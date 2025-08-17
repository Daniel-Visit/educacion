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

async function migrarAsignaturaNivel() {
  try {
    console.log('🚀 MIGRANDO TABLA ASIGNATURA_NIVEL A POSTGRESQL');
    console.log('='.repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');

    const asignaturaNiveles = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM asignatura_nivel ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${asignaturaNiveles.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const existentes =
      await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM asignatura_nivel`;
    const totalExistentes = parseInt(existentes[0].total);

    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM asignatura_nivel`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');

    for (const asignaturaNivel of asignaturaNiveles) {
      await prismaPostgres.$executeRaw`
        INSERT INTO asignatura_nivel (id, asignatura_id, nivel_id, codigo, descripcion)
        VALUES (${asignaturaNivel.id}, ${asignaturaNivel.asignatura_id}, ${asignaturaNivel.nivel_id}, ${asignaturaNivel.codigo}, ${asignaturaNivel.descripcion})
      `;
      console.log(
        `✅ Insertado: ${asignaturaNivel.codigo} - ${asignaturaNivel.descripcion}`
      );
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const migrados =
      await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM asignatura_nivel`;
    const totalMigrados = parseInt(migrados[0].total);

    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${asignaturaNiveles.length}`);

    if (totalMigrados === asignaturaNiveles.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar datos migrados
    console.log('\n📋 Datos migrados:');
    const datosMigrados =
      await prismaPostgres.$queryRaw`SELECT * FROM asignatura_nivel ORDER BY id`;

    datosMigrados.forEach(an => {
      console.log(`\nID: ${an.id}`);
      console.log(`  Asignatura ID: ${an.asignatura_id}`);
      console.log(`  Nivel ID: ${an.nivel_id}`);
      console.log(`  Código: ${an.codigo}`);
      console.log(`  Descripción: ${an.descripcion}`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla asignatura_nivel completada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarAsignaturaNivel();
