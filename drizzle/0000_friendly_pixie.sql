CREATE TABLE "clients" (
	"cli_id" bigserial PRIMARY KEY NOT NULL,
	"cli_user_id" bigint NOT NULL,
	"cli_name" varchar(100) NOT NULL,
	"cli_email" varchar(150),
	"cli_phone" varchar(30),
	"cli_created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mechanics" (
	"mec_id" bigserial PRIMARY KEY NOT NULL,
	"mec_user_id" bigint NOT NULL,
	"mec_name" varchar(100) NOT NULL,
	"mec_address" varchar(255),
	"mec_email" varchar(150),
	"mec_phone" varchar(30),
	"mec_identification_number" varchar(50) NOT NULL,
	"mec_status" varchar(20) NOT NULL,
	"mec_created_at" timestamp DEFAULT now(),
	CONSTRAINT "mechanics_mec_identification_number_unique" UNIQUE("mec_identification_number")
);
--> statement-breakpoint
CREATE TABLE "service_categories" (
	"sct_id" bigserial PRIMARY KEY NOT NULL,
	"sct_user_id" bigint,
	"sct_name" varchar(100) NOT NULL,
	"sct_created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "services" (
	"srv_id" bigserial PRIMARY KEY NOT NULL,
	"srv_user_id" bigint NOT NULL,
	"srv_category_id" bigint NOT NULL,
	"srv_name" varchar(100) NOT NULL,
	"srv_description" text,
	"srv_status" varchar(20) NOT NULL,
	"srv_created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_prices" (
	"srp_id" bigserial PRIMARY KEY NOT NULL,
	"srp_service_id" bigint NOT NULL,
	"srp_price" numeric(12, 2) NOT NULL,
	"srp_estimated_hourly_rate" numeric(10, 2),
	"srp_currency" varchar(10) DEFAULT 'CLP' NOT NULL,
	"srp_is_current" boolean DEFAULT false NOT NULL,
	"srp_created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"wor_id" bigserial PRIMARY KEY NOT NULL,
	"wor_user_id" bigint NOT NULL,
	"wor_code" varchar(50) NOT NULL,
	"wor_client_id" bigint NOT NULL,
	"wor_mechanic_id" bigint,
	"wor_vehicle_plate" varchar(20) NOT NULL,
	"wor_maintenance_type" varchar(20) NOT NULL,
	"wor_status" varchar(30) NOT NULL,
	"wor_created_at" timestamp DEFAULT now(),
	CONSTRAINT "work_orders_wor_code_unique" UNIQUE("wor_code")
);
--> statement-breakpoint
CREATE TABLE "work_order_services" (
	"wos_id" bigserial PRIMARY KEY NOT NULL,
	"wos_work_order_id" bigint NOT NULL,
	"wos_service_id" bigint NOT NULL,
	"wos_description" text NOT NULL,
	"wos_hours_worked" numeric(10, 2),
	"wos_estimated_hourly_rate" numeric(10, 2),
	"wos_actual_hourly_rate" numeric(10, 2),
	"wos_discount" numeric(10, 2),
	"wos_created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spare_parts" (
	"spr_id" bigserial PRIMARY KEY NOT NULL,
	"spr_service_id" bigint NOT NULL,
	"spr_description" varchar(255) NOT NULL,
	"spr_cost" numeric(10, 2) NOT NULL,
	"spr_created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "work_order_observations" (
	"woo_id" bigserial PRIMARY KEY NOT NULL,
	"woo_work_order_id" bigint NOT NULL,
	"woo_author_type" varchar(20) NOT NULL,
	"woo_author_name" varchar(100) NOT NULL,
	"woo_content" text NOT NULL,
	"woo_created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "work_order_logs" (
	"wol_id" bigserial PRIMARY KEY NOT NULL,
	"wol_work_order_id" bigint NOT NULL,
	"wol_changed_by" varchar(20) NOT NULL,
	"wol_changed_by_id" bigint,
	"wol_field" varchar(100),
	"wol_old_value" text,
	"wol_new_value" text,
	"wol_created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_srv_category_id_service_categories_sct_id_fk" FOREIGN KEY ("srv_category_id") REFERENCES "public"."service_categories"("sct_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_prices" ADD CONSTRAINT "service_prices_srp_service_id_services_srv_id_fk" FOREIGN KEY ("srp_service_id") REFERENCES "public"."services"("srv_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_wor_client_id_clients_cli_id_fk" FOREIGN KEY ("wor_client_id") REFERENCES "public"."clients"("cli_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_wor_mechanic_id_mechanics_mec_id_fk" FOREIGN KEY ("wor_mechanic_id") REFERENCES "public"."mechanics"("mec_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_services" ADD CONSTRAINT "work_order_services_wos_work_order_id_work_orders_wor_id_fk" FOREIGN KEY ("wos_work_order_id") REFERENCES "public"."work_orders"("wor_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_services" ADD CONSTRAINT "work_order_services_wos_service_id_services_srv_id_fk" FOREIGN KEY ("wos_service_id") REFERENCES "public"."services"("srv_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spare_parts" ADD CONSTRAINT "spare_parts_spr_service_id_work_order_services_wos_id_fk" FOREIGN KEY ("spr_service_id") REFERENCES "public"."work_order_services"("wos_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_observations" ADD CONSTRAINT "work_order_observations_woo_work_order_id_work_orders_wor_id_fk" FOREIGN KEY ("woo_work_order_id") REFERENCES "public"."work_orders"("wor_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_logs" ADD CONSTRAINT "work_order_logs_wol_work_order_id_work_orders_wor_id_fk" FOREIGN KEY ("wol_work_order_id") REFERENCES "public"."work_orders"("wor_id") ON DELETE no action ON UPDATE no action;