--> statement-breakpoint
-- 1. Drop FK constraints that reference the PKs being retyped
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_wor_client_id_clients_cli_id_fk";
--> statement-breakpoint
ALTER TABLE "work_orders" DROP CONSTRAINT "work_orders_wor_mechanic_id_mechanics_mec_id_fk";
--> statement-breakpoint
-- 2. Drop bigserial sequence defaults before retyping PKs
ALTER TABLE "mechanics" ALTER COLUMN "mec_id" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "cli_id" DROP DEFAULT;
--> statement-breakpoint
-- 4. Retype PKs: bigint → varchar(10)
ALTER TABLE "mechanics" ALTER COLUMN "mec_id" TYPE varchar(10) USING "mec_id"::text;
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "cli_id" TYPE varchar(10) USING "cli_id"::text;
--> statement-breakpoint
-- 5. Drop removed columns
ALTER TABLE "mechanics" DROP COLUMN "mec_user_id";
--> statement-breakpoint
ALTER TABLE "mechanics" DROP COLUMN "mec_identification_number";
--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "cli_user_id";
--> statement-breakpoint
-- 6. Add new created_by columns (temp default '' satisfies NOT NULL for existing rows)
ALTER TABLE "mechanics" ADD COLUMN "mec_created_by" varchar NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "mechanics" ALTER COLUMN "mec_created_by" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "cli_created_by" varchar NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "cli_created_by" DROP DEFAULT;
--> statement-breakpoint
-- 7. Retype FK columns in work_orders: bigint → varchar(10)
ALTER TABLE "work_orders" ALTER COLUMN "wor_client_id" TYPE varchar(10) USING "wor_client_id"::text;
--> statement-breakpoint
ALTER TABLE "work_orders" ALTER COLUMN "wor_mechanic_id" TYPE varchar(10) USING "wor_mechanic_id"::text;
--> statement-breakpoint
-- 8. Re-add FK constraints (types now match)
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_wor_client_id_clients_cli_id_fk" FOREIGN KEY ("wor_client_id") REFERENCES "public"."clients"("cli_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_wor_mechanic_id_mechanics_mec_id_fk" FOREIGN KEY ("wor_mechanic_id") REFERENCES "public"."mechanics"("mec_id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
-- 9. Drop orphaned sequences
DROP SEQUENCE IF EXISTS "mechanics_mec_id_seq";
--> statement-breakpoint
DROP SEQUENCE IF EXISTS "clients_cli_id_seq";
