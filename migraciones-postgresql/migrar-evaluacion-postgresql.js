const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();

// Cliente para PostgreSQL
const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRES
    }
  }
});

// Conexión a SQLite
const db = new sqlite3.Database('./prisma/dev.db');

async function migrarEvaluacion() {
  try {
    console.log('🚀 MIGRANDO TABLA EVALUACION A POSTGRESQL');
    console.log('=' .repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');
    
    const evaluaciones = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM Evaluacion ORDER BY id", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${evaluaciones.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const existentes = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM "Evaluacion"`;
    const totalExistentes = parseInt(existentes[0].total);
    
    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM "Evaluacion"`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');
    
    for (const evaluacion of evaluaciones) {
      // Convertir timestamps de milisegundos a Date para PostgreSQL
      const createdAt = new Date(evaluacion.createdAt);
      const updatedAt = new Date(evaluacion.updatedAt);
      
      await prismaPostgres.$executeRaw`
        INSERT INTO "Evaluacion" (id, "archivoId", "matrizId", estado, "createdAt", "updatedAt")
        VALUES (${evaluacion.id}, ${evaluacion.archivoId}, ${evaluacion.matrizId}, ${evaluacion.estado}, ${createdAt}, ${updatedAt})
      `;
      console.log(`✅ Insertado: Evaluación ID ${evaluacion.id} - Estado: ${evaluacion.estado}`);
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const migrados = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM "Evaluacion"`;
    const totalMigrados = parseInt(migrados[0].total);
    
    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${evaluaciones.length}`);
    
    if (totalMigrados === evaluaciones.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar datos migrados
    console.log('\n📋 Datos migrados:');
    const datosMigrados = await prismaPostgres.$queryRaw`SELECT * FROM "Evaluacion" ORDER BY id`;
    
    datosMigrados.forEach(evaluacion => {
      console.log(`\nID: ${evaluacion.id}`);
      console.log(`  Archivo ID: ${evaluacion.archivoId}`);
      console.log(`  Matriz ID: ${evaluacion.matrizId}`);
      console.log(`  Estado: ${evaluacion.estado}`);
      console.log(`  Created At: ${evaluacion.createdAt}`);
      console.log(`  Updated At: ${evaluacion.updatedAt}`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla Evaluacion completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarEvaluacion(); 