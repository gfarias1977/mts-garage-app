import 'dotenv/config';
import { db } from '@/db';
import { eq, inArray } from 'drizzle-orm';
import {
  clientTypesTable,
  clientsTable,
  maintenanceTypesTable,
  mechanicsTable,
  serviceCategoriesTable,
  servicePricesTable,
  servicesTable,
  sparePartsTable,
  vehiclesTable,
  workOrderObservationsTable,
  workOrderServicesTable,
  workOrdersStatusTable,
  workOrdersTable,
} from '@/db/schema';

const SEED_USER = 'seed';
const SEED_USER_ID = BigInt(1);

async function main() {
  console.log('Seeding database...\n');

  // 1. client_types
  console.log('→ client_types');
  await db.insert(clientTypesTable).values([
    { id: 'EMPRESA', name: 'Empresa', createdBy: SEED_USER, status: 'A' },
    { id: 'PERSONA', name: 'Persona Natural', createdBy: SEED_USER, status: 'A' },
  ]).onConflictDoNothing();
  console.log('  ✓ done');

  // 2. work_orders_status
  console.log('→ work_orders_status');
  await db.insert(workOrdersStatusTable).values([
    { id: 'P', description: 'Pendiente', createdBy: SEED_USER, status: 'A' },
    { id: 'A', description: 'En Curso', createdBy: SEED_USER, status: 'A' },
    { id: 'C', description: 'Cerrada', createdBy: SEED_USER, status: 'A' },
    { id: 'X', description: 'Cancelada', createdBy: SEED_USER, status: 'A' },
  ]).onConflictDoNothing();
  console.log('  ✓ done');

  // 3. maintenance_types
  console.log('→ maintenance_types');
  await db.insert(maintenanceTypesTable).values([
    { id: 'PREV', name: 'Preventivo', createdBy: SEED_USER, status: 'A' },
    { id: 'CORR', name: 'Correctivo', createdBy: SEED_USER, status: 'A' },
    { id: 'EMRG', name: 'Emergencia', createdBy: SEED_USER, status: 'A' },
  ]).onConflictDoNothing();
  console.log('  ✓ done');

  // 4. clients
  console.log('→ clients');
  await db.insert(clientsTable).values([
    { id: '1-9', clientType: 'EMPRESA', name: 'CLIENTE SPOT', email: 'contacto@rock.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '76118792-9', clientType: 'EMPRESA', name: 'CABLEX', email: 'contacto@rock.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '76202270-2', clientType: 'EMPRESA', name: 'TODOPRODUCTO', email: 'contacto@rock.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '76566594-9', clientType: 'EMPRESA', name: 'THS', email: 'contacto@rock.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '76850657-4', clientType: 'EMPRESA', name: 'ROCK TRUCK', email: 'contacto@rock.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '77152635-8', clientType: 'EMPRESA', name: 'PF', email: 'contacto@pf.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '77192264-3', clientType: 'EMPRESA', name: 'SOLOGIST', email: 'contacto@sologist.cl', phone: '1234567', createdBy: SEED_USER, status: 'A' },
    { id: '77583635-0', clientType: 'EMPRESA', name: 'SAY GROUP', email: 'contacto@rock.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '77652474-3', clientType: 'EMPRESA', name: 'TRANSGAMBOA', email: 'contacto@transgamboa.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '96548780-8', clientType: 'EMPRESA', name: 'CUSTODIA', email: 'contacto@rock.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '96972780-3', clientType: 'EMPRESA', name: 'SUDAMERICANA', email: 'contacto@rock.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
  ]).onConflictDoNothing();
  console.log('  ✓ done');

  // 5. mechanics
  console.log('→ mechanics');
  await db.insert(mechanicsTable).values([
    { id: '25738898-0', name: 'ELVIS GONZALEZ VEIZAGA', address: 's/d', email: 'egonzalez@mts.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
    { id: '26377641-0', name: 'JOSE GREGORIO ANZOLA SALINAS', address: 's/d', email: 'janzola@mts.cl', phone: '123456', createdBy: SEED_USER, status: 'A' },
  ]).onConflictDoNothing();
  console.log('  ✓ done');

  // 6. vehicles
  console.log('→ vehicles');
  await db.insert(vehiclesTable).values([
    // Vehículos existentes
    { id: 'BBTK21', clientId: '1-9', name: 'Camión Mercedes Benz Actros', createdBy: SEED_USER, status: 'A' },
    { id: 'FRJP90', clientId: '1-9', name: 'Camión Volvo FH', createdBy: SEED_USER, status: 'A' },
    { id: 'GHJK45', clientId: '1-9', name: 'Furgón Iveco Daily', createdBy: SEED_USER, status: 'A' },

    // Nuevos vehículos de los inserts
    { id: 'BTYY67', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'BYGJ58', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'CCLL98', clientId: '1-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'DDBH59', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'DLWF76', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'FTJK36', clientId: '1-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'FZRL61', clientId: '1-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'GCYH73', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'GLZR67', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'GVHK69', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HGBT11', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HKRP48', clientId: '76202270-2', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HKRT70', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HKSW12', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HPJJ46', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HPSV41', clientId: '76202270-2', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HSWY55', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HXGJ52', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HZCX41', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HZCX42', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HZGJ76', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'HZPY14', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JC9012', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JC9014', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JCDY34', clientId: '76202270-2', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JCYS24', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JD5204', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JDDB45', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JDDB46', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JDDB47', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JDDB48', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JDDB49', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JFCP34', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JFYV30', clientId: '1-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JG7293', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JH8960', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JKCY95', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JKHS54', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JLLW42', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JSFT19', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JSGB51', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JTGP73', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JVLS50', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JVRR45', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JWLL90', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JWRL73', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JWRL74', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JWRL75', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JZGX29', clientId: '76566594-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'JZKC57', clientId: '76202270-2', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KBSS50', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KBSS51', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KBSS52', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KBST46', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KBWS54', clientId: '1-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KCFL54', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KCFL55', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KCFL56', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KCPP46', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KGFD54', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KHKY25', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KHKZ37', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KPXJ57', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KTKZ23', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KTZS23', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KWKJ19', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KWKJ96', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KXTC65', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KXZP59', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KZBC15', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'KZBC17', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LBTK96', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LCKF91', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LCKL36', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LCKR19', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LCXR19', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LDBX65', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LGSS11', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LJSF34', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LJSF42', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LJSF45', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LJSF63', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LJTD72', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LJTP33', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LLGW98', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LLGW980', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LPHR56', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LPYG48', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LRJD10', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LRSL70', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LRSL71', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LRYW68', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LRYW69', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LVHS29', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LVHS31', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LVHS36', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LWTZ94', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LWTZ95', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LWTZ96', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXCF52', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXCF53', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXCF54', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXCF80', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXHD44', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXHD45', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXHD47', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXHD48', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXHG61', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LXVD70', clientId: '76566594-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LYWR68', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LYWR69', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'LZZC14', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS001', clientId: '1-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS002', clientId: '76118792-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS003', clientId: '76202270-2', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS004', clientId: '76566594-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS005', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS006', clientId: '77152635-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS007', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS008', clientId: '77583635-0', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS009', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS010', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'MTS011', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PBCH15', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PBFC51', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PDYS53', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PDYS54', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PFTC34', clientId: '76566594-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PFTC35', clientId: '76566594-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGBC99', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGBD98', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGKV34', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGKV36', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGKV39', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGKV40', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGKX34', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGSW89', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGSW92', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGVV82', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGXV34', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGXV39', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PGXV40', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PHVP25', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PJTG84', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PJTG99', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PJTH30', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PJTH34', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PKVJ25', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PLCZ10', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PLJB41', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PLKC58', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PLLB40', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PLLB41', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PPU', clientId: '76118792-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PPZW57', clientId: '76566594-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PSCP55', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PSCS39', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PSCW46', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PWSB94', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PYDR48', clientId: '96972780-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PZGJ77', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'PZSW29', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RBDL51', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RCFY68', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RKHV76', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RKHV81', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RLFL15', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RLFY15', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RLFY31', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RSTV18', clientId: '1-9', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RWLY19', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RWWZ97', clientId: '77583635-0', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RXZR96', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RXZS30', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RXZS35', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'RYZL90', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'SJWL49', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'SLPC33', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'SSJH26', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'SWBR73', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'SWGV24', clientId: '77192264-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'SWKV23', clientId: '77652474-3', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'SZWR43', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'TDZR87', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'THGY14', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'TJPY91', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'TRGW43', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'TRGW75', clientId: '96548780-8', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'VGCS45', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'VGCS75', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'VGCW46', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'VGCW54', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'VGCX68', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'VGCX78', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'VGDB72', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
    { id: 'VGDD61', clientId: '76850657-4', name: 'Vehículo sin especificar', createdBy: SEED_USER, status: 'A' },
  ]).onConflictDoNothing();
  console.log('  ✓ done');

  // 7. service_categories — query existing or insert, always return IDs by name
  console.log('→ service_categories');
  const catNames = ['Frenos', 'Motor', 'Transmisión', 'Sistema Eléctrico'];
  let existingCats = await db
    .select({ id: serviceCategoriesTable.id, name: serviceCategoriesTable.name })
    .from(serviceCategoriesTable)
    .where(inArray(serviceCategoriesTable.name, catNames));
  if (existingCats.length < catNames.length) {
    const existingNames = new Set(existingCats.map((c) => c.name));
    const toInsert = [
      { name: 'Frenos', createdBy: SEED_USER, status: 'A' },
      { name: 'Motor', createdBy: SEED_USER, status: 'A' },
      { name: 'Transmisión', createdBy: SEED_USER, status: 'A' },
      { name: 'Sistema Eléctrico', createdBy: SEED_USER, status: 'A' },
    ].filter((c) => !existingNames.has(c.name));
    const inserted = await db
      .insert(serviceCategoriesTable)
      .values(toInsert)
      .returning({ id: serviceCategoriesTable.id, name: serviceCategoriesTable.name });
    existingCats = [...existingCats, ...inserted];
  }
  const catMap = Object.fromEntries(existingCats.map((c) => [c.name, c.id]));
  const catFrenosId = catMap['Frenos'];
  const catMotorId = catMap['Motor'];
  const catTransmisionId = catMap['Transmisión'];
  const catElectricoId = catMap['Sistema Eléctrico'];
  console.log('  ✓ done');

  // 8. services — query existing or insert, always return IDs by name
  console.log('→ services');
  const srvNames = [
    'Cambio de Pastillas',
    'Rectificación de Discos',
    'Cambio de Aceite',
    'Revisión de Correa',
    'Cambio de Embrague',
    'Diagnóstico Eléctrico',
  ];
  let existingSrvs = await db
    .select({ id: servicesTable.id, name: servicesTable.name })
    .from(servicesTable)
    .where(inArray(servicesTable.name, srvNames));
  if (existingSrvs.length < srvNames.length) {
    const existingNames = new Set(existingSrvs.map((s) => s.name));
    const allServices = [
      { userId: SEED_USER_ID, categoryId: catFrenosId, name: 'Cambio de Pastillas', description: 'Cambio completo de pastillas de freno', createdBy: SEED_USER, status: 'A' },
      { userId: SEED_USER_ID, categoryId: catFrenosId, name: 'Rectificación de Discos', description: 'Rectificación y ajuste de discos', createdBy: SEED_USER, status: 'A' },
      { userId: SEED_USER_ID, categoryId: catMotorId, name: 'Cambio de Aceite', description: 'Cambio de aceite con filtro', createdBy: SEED_USER, status: 'A' },
      { userId: SEED_USER_ID, categoryId: catMotorId, name: 'Revisión de Correa', description: 'Inspección y cambio de correa de distribución', createdBy: SEED_USER, status: 'A' },
      { userId: SEED_USER_ID, categoryId: catTransmisionId, name: 'Cambio de Embrague', description: 'Reemplazo de kit de embrague', createdBy: SEED_USER, status: 'A' },
      { userId: SEED_USER_ID, categoryId: catElectricoId, name: 'Diagnóstico Eléctrico', description: 'Diagnóstico con scanner OBD', createdBy: SEED_USER, status: 'A' },
    ].filter((s) => !existingNames.has(s.name));
    const inserted = await db
      .insert(servicesTable)
      .values(allServices)
      .returning({ id: servicesTable.id, name: servicesTable.name });
    existingSrvs = [...existingSrvs, ...inserted];
  }
  const srvMap = Object.fromEntries(existingSrvs.map((s) => [s.name, s.id]));
  const srvPastillas = srvMap['Cambio de Pastillas'];
  const srvDiscos = srvMap['Rectificación de Discos'];
  const srvAceite = srvMap['Cambio de Aceite'];
  const srvCorrea = srvMap['Revisión de Correa'];
  const srvEmbrague = srvMap['Cambio de Embrague'];
  const srvDiagnostico = srvMap['Diagnóstico Eléctrico'];
  console.log('  ✓ done');

  // 9. service_prices — only insert if no current prices exist for these services
  console.log('→ service_prices');
  const existingPrices = await db
    .select({ serviceId: servicePricesTable.serviceId })
    .from(servicePricesTable)
    .where(inArray(servicePricesTable.serviceId, [srvPastillas, srvDiscos, srvAceite, srvCorrea, srvEmbrague, srvDiagnostico]));
  if (existingPrices.length === 0) {
    await db.insert(servicePricesTable).values([
      { serviceId: srvPastillas, price: '85000', estimatedHourlyRate: '35000', isCurrent: true, createdBy: SEED_USER },
      { serviceId: srvDiscos, price: '65000', estimatedHourlyRate: '35000', isCurrent: true, createdBy: SEED_USER },
      { serviceId: srvAceite, price: '45000', estimatedHourlyRate: '25000', isCurrent: true, createdBy: SEED_USER },
      { serviceId: srvCorrea, price: '120000', estimatedHourlyRate: '40000', isCurrent: true, createdBy: SEED_USER },
      { serviceId: srvEmbrague, price: '350000', estimatedHourlyRate: '45000', isCurrent: true, createdBy: SEED_USER },
      { serviceId: srvDiagnostico, price: '30000', estimatedHourlyRate: '30000', isCurrent: true, createdBy: SEED_USER },
    ]);
  }
  console.log('  ✓ done');

  // 10. work_orders — onConflictDoNothing (unique on code), then query IDs
  console.log('→ work_orders');
  await db.insert(workOrdersTable).values([
    {
      userId: SEED_USER_ID,
      code: 'OT-2024-001',
      clientId: '76850657-4',
      mechanicId: '25738898-0',
      vehiclePlate: 'BBTK21',
      maintenanceType: 'PREV',
      createdBy: SEED_USER,
      status: 'A',
    },
    {
      userId: SEED_USER_ID,
      code: 'OT-2024-002',
      clientId: '77652474-3',
      mechanicId: '26377641-0',
      vehiclePlate: 'FRJP90',
      maintenanceType: 'CORR',
      createdBy: SEED_USER,
      status: 'P',
    },
  ]).onConflictDoNothing();
  const [wo1] = await db
    .select({ id: workOrdersTable.id })
    .from(workOrdersTable)
    .where(eq(workOrdersTable.code, 'OT-2024-001'));
  const wo1Id = wo1.id;
  console.log(`  ✓ done (OT-2024-001 id: ${wo1Id})`);

  // 11. work_order_services — skip if already exist for OT-2024-001
  console.log('→ work_order_services');
  const existingWos = await db
    .select({ id: workOrderServicesTable.id, serviceId: workOrderServicesTable.serviceId })
    .from(workOrderServicesTable)
    .where(eq(workOrderServicesTable.workOrderId, wo1Id));
  let wosAceiteId: bigint;
  let wosPastillasId: bigint;
  if (existingWos.length === 0) {
    const wos = await db
      .insert(workOrderServicesTable)
      .values([
        { workOrderId: wo1Id, serviceId: srvAceite, note: 'Aceite 15W-40 sintético', createdBy: SEED_USER, status: 'A' },
        { workOrderId: wo1Id, serviceId: srvPastillas, note: 'Pastillas marca Bosch', createdBy: SEED_USER, status: 'A' },
      ])
      .returning({ id: workOrderServicesTable.id, serviceId: workOrderServicesTable.serviceId });
    wosAceiteId = wos.find((r) => r.serviceId === srvAceite)!.id;
    wosPastillasId = wos.find((r) => r.serviceId === srvPastillas)!.id;
  } else {
    wosAceiteId = existingWos.find((r) => r.serviceId === srvAceite)!.id;
    wosPastillasId = existingWos.find((r) => r.serviceId === srvPastillas)!.id;
  }
  console.log('  ✓ done');

  // 12. work_order_observations — skip if already exist for OT-2024-001
  console.log('→ work_order_observations');
  const existingObs = await db
    .select({ id: workOrderObservationsTable.id })
    .from(workOrderObservationsTable)
    .where(eq(workOrderObservationsTable.workOrderId, wo1Id));
  if (existingObs.length === 0) {
    await db.insert(workOrderObservationsTable).values([
      {
        workOrderId: wo1Id,
        authorName: 'ELVIS GONZALEZ VEIZAGA',
        content: 'Vehículo ingresa con ruido en frenos delanteros. Se detecta desgaste en pastillas.',
        createdBy: SEED_USER,
      },
    ]);
  }
  console.log('  ✓ done');

  // 13. work_order_service_spare_parts — skip if already exist for OT-2024-001
  console.log('→ work_order_service_spare_parts');
  const existingParts = await db
    .select({ id: sparePartsTable.id })
    .from(sparePartsTable)
    .where(eq(sparePartsTable.workOrderId, wo1Id));
  if (existingParts.length === 0) {
    await db.insert(sparePartsTable).values([
      { workOrderId: wo1Id, serviceId: wosPastillasId, description: 'Pastillas Bosch BP1055', cost: '42000', createdBy: SEED_USER, status: 'A' },
      { workOrderId: wo1Id, serviceId: wosAceiteId, description: 'Aceite Mobil 15W-40 5L', cost: '18500', createdBy: SEED_USER, status: 'A' },
    ]);
  }
  console.log('  ✓ done');

  console.log('\nSeed complete.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
