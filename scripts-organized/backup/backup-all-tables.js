const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuración
const BACKUP_DIR = path.join(__dirname, '../data-exports');
const DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Obtener todas las tablas dinámicamente desde Prisma
async function getAllTables() {
  try {
    // Consulta SQL para obtener todas las tablas del schema público
    const result = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    return result.map(row => row.table_name);
  } catch (error) {
    console.error('❌ Error obteniendo tablas:', error);
    return [];
  }
}

async function backupTable(tableName) {
  try {
    console.log(`🔄 Haciendo backup de ${tableName}...`);
    
    // Obtener datos de la tabla usando raw query para ser más seguro
    const data = await prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}"`);
    
    // Crear archivo de backup
    const fileName = `${tableName}_${DATE}.json`;
    const filePath = path.join(BACKUP_DIR, fileName);
    
    // Guardar datos como JSON
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Backup de ${tableName} completado: ${data.length} registros`);
    return { table: tableName, count: data.length, file: fileName };
    
  } catch (error) {
    console.error(`❌ Error en backup de ${tableName}:`, error.message);
    return { table: tableName, error: error.message };
  }
}

async function backupAllTables() {
  console.log('🚀 Iniciando backup completo de todas las tablas...\n');
  
  // Crear directorio si no existe
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  // Obtener todas las tablas dinámicamente
  console.log('📋 Obteniendo lista de tablas...');
  const allTables = await getAllTables();
  
  if (allTables.length === 0) {
    console.log('❌ No se pudieron obtener las tablas');
    return;
  }
  
  console.log(`📊 Encontradas ${allTables.length} tablas: ${allTables.join(', ')}\n`);
  
  const results = [];
  
  for (const table of allTables) {
    const result = await backupTable(table);
    results.push(result);
  }
  
  // Crear reporte de backup
  const report = {
    date: new Date().toISOString(),
    totalTables: allTables.length,
    tables: results,
    summary: {
      total: results.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      totalRecords: results.filter(r => !r.error).reduce((sum, r) => sum + (r.count || 0), 0)
    }
  };
  
  const reportFile = path.join(BACKUP_DIR, `backup_complete_${DATE}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Resumen del backup completo:');
  console.log(`📋 Total de tablas: ${allTables.length}`);
  console.log(`✅ Tablas exitosas: ${report.summary.successful}`);
  console.log(`❌ Tablas fallidas: ${report.summary.failed}`);
  console.log(`📝 Total de registros: ${report.summary.totalRecords}`);
  console.log(`📄 Reporte guardado en: ${reportFile}`);
  
  // Mostrar tablas que fallaron
  const failedTables = results.filter(r => r.error);
  if (failedTables.length > 0) {
    console.log('\n❌ Tablas que fallaron:');
    failedTables.forEach(failed => {
      console.log(`  - ${failed.table}: ${failed.error}`);
    });
  }
  
  return report;
}

async function main() {
  try {
    await backupAllTables();
  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { backupAllTables, getAllTables, backupTable }; 