const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuración
const BACKUP_DIR = path.join(__dirname, '../data-exports');
const DATE = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

// Tablas críticas para backup
const CRITICAL_TABLES = [
  'asignatura',
  'nivel', 
  'oa',
  'matrizEspecificacion',
  'horario',
  'planificacionAnual',
  'asignacionOA',
  'evaluacion',
  'resultadoEvaluacion'
];

async function backupTable(tableName) {
  try {
    console.log(`🔄 Haciendo backup de ${tableName}...`);
    
    // Obtener datos de la tabla
    const data = await prisma[tableName].findMany();
    
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
  console.log('🚀 Iniciando backup de tablas críticas...\n');
  
  // Crear directorio si no existe
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  
  const results = [];
  
  for (const table of CRITICAL_TABLES) {
    const result = await backupTable(table);
    results.push(result);
  }
  
  // Crear reporte de backup
  const report = {
    date: new Date().toISOString(),
    tables: results,
    summary: {
      total: results.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length,
      totalRecords: results.filter(r => !r.error).reduce((sum, r) => sum + (r.count || 0), 0)
    }
  };
  
  const reportFile = path.join(BACKUP_DIR, `backup_report_${DATE}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  
  console.log('\n📊 Resumen del backup:');
  console.log(`✅ Tablas exitosas: ${report.summary.successful}`);
  console.log(`❌ Tablas fallidas: ${report.summary.failed}`);
  console.log(`📝 Total de registros: ${report.summary.totalRecords}`);
  console.log(`📄 Reporte guardado en: ${reportFile}`);
  
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

module.exports = { backupAllTables, backupTable }; 