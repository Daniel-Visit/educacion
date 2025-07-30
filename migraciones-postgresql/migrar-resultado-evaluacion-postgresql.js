const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();

// Cliente para PostgreSQL
const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.pchttmjsbxqaedszjaje:n2piyteoknP08FN6@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
});

// Conexión a SQLite
const db = new sqlite3.Database('./prisma/dev.db');

async function migrarResultadoEvaluacion() {
  try {
    console.log('🚀 MIGRANDO TABLA RESULTADOEVALUACION A POSTGRESQL');
    console.log('=' .repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');
    
    const resultados = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM ResultadoEvaluacion ORDER BY id", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${resultados.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const existentes = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM "ResultadoEvaluacion"`;
    const totalExistentes = parseInt(existentes[0].total);
    
    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM "ResultadoEvaluacion"`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');
    
    for (const resultado of resultados) {
      // Convertir timestamps de milisegundos a Date para PostgreSQL
      const fechaCarga = new Date(resultado.fechaCarga);
      
      await prismaPostgres.$executeRaw`
        INSERT INTO "ResultadoEvaluacion" (id, nombre, "evaluacionId", "fechaCarga", "totalAlumnos", "escalaNota")
        VALUES (${resultado.id}, ${resultado.nombre}, ${resultado.evaluacionId}, ${fechaCarga}, ${resultado.totalAlumnos}, ${resultado.escalaNota})
      `;
      console.log(`✅ Insertado: ${resultado.nombre} (ID: ${resultado.id})`);
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const migrados = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM "ResultadoEvaluacion"`;
    const totalMigrados = parseInt(migrados[0].total);
    
    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${resultados.length}`);
    
    if (totalMigrados === resultados.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar datos migrados
    console.log('\n📋 Datos migrados:');
    const datosMigrados = await prismaPostgres.$queryRaw`SELECT * FROM "ResultadoEvaluacion" ORDER BY id`;
    
    datosMigrados.forEach(resultado => {
      console.log(`\nID: ${resultado.id}`);
      console.log(`  Nombre: ${resultado.nombre}`);
      console.log(`  Evaluación ID: ${resultado.evaluacionId}`);
      console.log(`  Fecha Carga: ${resultado.fechaCarga}`);
      console.log(`  Total Alumnos: ${resultado.totalAlumnos}`);
      console.log(`  Escala Nota: ${resultado.escalaNota}`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla ResultadoEvaluacion completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarResultadoEvaluacion(); 