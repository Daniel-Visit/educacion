const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();

// Cliente para PostgreSQL
const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRES,
    },
  },
});

// Conexión a SQLite
const db = new sqlite3.Database('./prisma/dev.db');

async function migrarAlumno() {
  try {
    console.log('🚀 MIGRANDO TABLA ALUMNO A POSTGRESQL');
    console.log('='.repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');

    const alumnos = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Alumno ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${alumnos.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const existentes =
      await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM alumno`;
    const totalExistentes = parseInt(existentes[0].total);

    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM alumno`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');

    for (const alumno of alumnos) {
      // Convertir timestamps de milisegundos a Date para PostgreSQL
      const createdAt = new Date(alumno.createdAt);
      const updatedAt = new Date(alumno.updatedAt);

      await prismaPostgres.$executeRaw`
        INSERT INTO alumno (id, rut, nombre, apellido, curso, "nivelId", "createdAt", "updatedAt")
        VALUES (${alumno.id}, ${alumno.rut}, ${alumno.nombre}, ${alumno.apellido}, ${alumno.curso}, ${alumno.nivelId}, ${createdAt}, ${updatedAt})
      `;
      console.log(
        `✅ Insertado: ${alumno.nombre} ${alumno.apellido} (RUT: ${alumno.rut})`
      );
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const migrados =
      await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM alumno`;
    const totalMigrados = parseInt(migrados[0].total);

    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${alumnos.length}`);

    if (totalMigrados === alumnos.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de datos migrados:');
    const ejemplos =
      await prismaPostgres.$queryRaw`SELECT id, rut, nombre, apellido, curso, "nivelId" FROM alumno ORDER BY id LIMIT 5`;

    ejemplos.forEach(alumno => {
      console.log(`\nID: ${alumno.id}`);
      console.log(`  RUT: ${alumno.rut}`);
      console.log(`  Nombre: ${alumno.nombre}`);
      console.log(`  Apellido: ${alumno.apellido}`);
      console.log(`  Curso: ${alumno.curso || 'N/A'}`);
      console.log(`  Nivel ID: ${alumno.nivelId || 'N/A'}`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla alumno completada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarAlumno();
