const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configuración
const BACKUP_DIR = path.join(__dirname, '../data-exports');

async function restoreTable(tableName, date = null) {
  try {
    console.log(`🔄 Restaurando ${tableName}...`);
    
    // Buscar archivo de backup
    let fileName;
    if (date) {
      fileName = `${tableName}_${date}.json`;
    } else {
      // Buscar el archivo más reciente
      const files = fs.readdirSync(BACKUP_DIR)
        .filter(file => file.startsWith(`${tableName}_`) && file.endsWith('.json'))
        .sort()
        .reverse();
      
      if (files.length === 0) {
        throw new Error(`No se encontró archivo de backup para ${tableName}`);
      }
      fileName = files[0];
    }
    
    const filePath = path.join(BACKUP_DIR, fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${fileName}`);
    }
    
    // Leer datos del backup
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Limpiar tabla existente (opcional - comentar si no quieres)
    // await prisma[tableName].deleteMany();
    
    // Restaurar datos
    if (data.length > 0) {
      await prisma[tableName].createMany({
        data: data,
        skipDuplicates: true // Evitar duplicados
      });
    }
    
    console.log(`✅ Restauración de ${tableName} completada: ${data.length} registros`);
    return { table: tableName, count: data.length, file: fileName };
    
  } catch (error) {
    console.error(`❌ Error restaurando ${tableName}:`, error.message);
    return { table: tableName, error: error.message };
  }
}

async function restoreFromReport(reportFile) {
  try {
    console.log(`🔄 Restaurando desde reporte: ${reportFile}...`);
    
    const reportPath = path.join(BACKUP_DIR, reportFile);
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Reporte no encontrado: ${reportFile}`);
    }
    
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const results = [];
    
    for (const tableInfo of report.tables) {
      if (!tableInfo.error) {
        const result = await restoreTable(tableInfo.table);
        results.push(result);
      } else {
        console.log(`⚠️  Saltando ${tableInfo.table}: ${tableInfo.error}`);
        results.push({ table: tableInfo.table, skipped: true, reason: tableInfo.error });
      }
    }
    
    console.log('\n📊 Resumen de la restauración:');
    console.log(`✅ Tablas restauradas: ${results.filter(r => !r.error && !r.skipped).length}`);
    console.log(`❌ Tablas fallidas: ${results.filter(r => r.error).length}`);
    console.log(`⚠️  Tablas saltadas: ${results.filter(r => r.skipped).length}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error en restauración:', error);
    throw error;
  }
}

async function listBackups() {
  try {
    console.log('📋 Backups disponibles:\n');
    
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('No hay directorio de backups');
      return;
    }
    
    const files = fs.readdirSync(BACKUP_DIR);
    const reports = files.filter(f => f.startsWith('backup_report_'));
    const dataFiles = files.filter(f => !f.startsWith('backup_report_'));
    
    console.log('📊 Reportes de backup:');
    reports.forEach(report => {
      const date = report.replace('backup_report_', '').replace('.json', '');
      console.log(`  - ${date}`);
    });
    
    console.log('\n📁 Archivos de datos:');
    const tables = [...new Set(dataFiles.map(f => f.split('_')[0]))];
    tables.forEach(table => {
      const tableFiles = dataFiles.filter(f => f.startsWith(`${table}_`));
      console.log(`  - ${table}: ${tableFiles.length} backups`);
    });
    
  } catch (error) {
    console.error('❌ Error listando backups:', error);
  }
}

async function main() {
  const command = process.argv[2];
  const table = process.argv[3];
  const date = process.argv[4];
  
  try {
    switch (command) {
      case 'list':
        await listBackups();
        break;
      case 'restore-table':
        if (!table) {
          console.log('Uso: node restore-data.js restore-table <tableName> [date]');
          return;
        }
        await restoreTable(table, date);
        break;
      case 'restore-all':
        const reportFile = process.argv[3] || 'backup_report_' + new Date().toISOString().split('T')[0] + '.json';
        await restoreFromReport(reportFile);
        break;
      default:
        console.log('Comandos disponibles:');
        console.log('  list                    - Listar backups disponibles');
        console.log('  restore-table <table>   - Restaurar tabla específica');
        console.log('  restore-all [report]    - Restaurar desde reporte');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { restoreTable, restoreFromReport, listBackups }; 