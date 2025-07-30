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

async function migrarHorario() {
  try {
    console.log('🚀 MIGRANDO TABLA HORARIO A POSTGRESQL');
    console.log('=' .repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');
    
    const horarios = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM Horario ORDER BY id", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${horarios.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const existentes = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM horario`;
    const totalExistentes = parseInt(existentes[0].total);
    
    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM horario`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');
    
    for (const horario of horarios) {
      // Convertir timestamps de milisegundos a Date para PostgreSQL
      const createdAt = new Date(horario.createdAt);
      const updatedAt = new Date(horario.updatedAt);
      const fechaPrimeraClase = horario.fechaPrimeraClase ? new Date(horario.fechaPrimeraClase) : null;
      
      await prismaPostgres.$executeRaw`
        INSERT INTO horario (id, nombre, "docenteId", "asignaturaId", "nivelId", "createdAt", "updatedAt", "fechaPrimeraClase")
        VALUES (${horario.id}, ${horario.nombre}, ${horario.docenteId}, ${horario.asignaturaId}, ${horario.nivelId}, ${createdAt}, ${updatedAt}, ${fechaPrimeraClase})
      `;
      console.log(`✅ Insertado: ${horario.nombre} (ID: ${horario.id})`);
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const migrados = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM horario`;
    const totalMigrados = parseInt(migrados[0].total);
    
    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${horarios.length}`);
    
    if (totalMigrados === horarios.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar datos migrados
    console.log('\n📋 Datos migrados:');
    const datosMigrados = await prismaPostgres.$queryRaw`SELECT * FROM horario ORDER BY id`;
    
    datosMigrados.forEach(horario => {
      console.log(`\nID: ${horario.id}`);
      console.log(`  Nombre: ${horario.nombre}`);
      console.log(`  Docente ID: ${horario.docenteId}`);
      console.log(`  Asignatura ID: ${horario.asignaturaId}`);
      console.log(`  Nivel ID: ${horario.nivelId}`);
      console.log(`  Fecha Primera Clase: ${horario.fechaPrimeraClase || 'N/A'}`);
      console.log(`  Created At: ${horario.createdAt}`);
      console.log(`  Updated At: ${horario.updatedAt}`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla horario completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarHorario(); 