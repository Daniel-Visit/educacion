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

async function migrarMatrizEspecificacion() {
  try {
    console.log('🚀 MIGRANDO TABLA MATRIZESPECIFICACION A POSTGRESQL');
    console.log('=' .repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');
    
    const matrices = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM MatrizEspecificacion ORDER BY id", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${matrices.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const existentes = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM "MatrizEspecificacion"`;
    const totalExistentes = parseInt(existentes[0].total);
    
    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM "MatrizEspecificacion"`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');
    
    for (const matriz of matrices) {
      // Convertir timestamp de milisegundos a Date para PostgreSQL
      const createdAt = new Date(matriz.createdAt);
      
      await prismaPostgres.$executeRaw`
        INSERT INTO "MatrizEspecificacion" (id, nombre, total_preguntas, asignatura_id, nivel_id, "createdAt")
        VALUES (${matriz.id}, ${matriz.nombre}, ${matriz.total_preguntas}, ${matriz.asignatura_id}, ${matriz.nivel_id}, ${createdAt})
      `;
      console.log(`✅ Insertado: ${matriz.nombre} (ID: ${matriz.id})`);
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const migrados = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM "MatrizEspecificacion"`;
    const totalMigrados = parseInt(migrados[0].total);
    
    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${matrices.length}`);
    
    if (totalMigrados === matrices.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar datos migrados
    console.log('\n📋 Datos migrados:');
    const datosMigrados = await prismaPostgres.$queryRaw`SELECT * FROM "MatrizEspecificacion" ORDER BY id`;
    
    datosMigrados.forEach(matriz => {
      console.log(`\nID: ${matriz.id}`);
      console.log(`  Nombre: ${matriz.nombre}`);
      console.log(`  Total Preguntas: ${matriz.total_preguntas}`);
      console.log(`  Asignatura ID: ${matriz.asignatura_id}`);
      console.log(`  Nivel ID: ${matriz.nivel_id}`);
      console.log(`  Created At: ${matriz.createdAt}`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla MatrizEspecificacion completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarMatrizEspecificacion(); 