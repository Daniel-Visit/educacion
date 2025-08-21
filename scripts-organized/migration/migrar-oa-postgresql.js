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

async function migrarOA() {
  try {
    console.log('🚀 MIGRANDO TABLA OA A POSTGRESQL');
    console.log('='.repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');

    const oas = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM oa ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${oas.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const oasExistentes =
      await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM oa`;
    const totalExistentes = parseInt(oasExistentes[0].total);

    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM oa`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');

    for (const oa of oas) {
      // Convertir el valor booleano de SQLite (0/1) a PostgreSQL (true/false)
      const basalBoolean = oa.basal === 1 ? true : false;

      await prismaPostgres.$executeRaw`
        INSERT INTO oa (id, nivel_id, asignatura_id, eje_id, eje_descripcion, oas_id, descripcion_oas, basal, minimo_clases, tipo_eje)
        VALUES (${oa.id}, ${oa.nivel_id}, ${oa.asignatura_id}, ${oa.eje_id}, ${oa.eje_descripcion}, ${oa.oas_id}, ${oa.descripcion_oas}, ${basalBoolean}, ${oa.minimo_clases}, ${oa.tipo_eje})
      `;
      console.log(
        `✅ Insertado: ${oa.oas_id} - ${oa.descripcion_oas.substring(0, 50)}... (basal: ${basalBoolean})`
      );
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const oasMigrados =
      await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM oa`;
    const totalMigrados = parseInt(oasMigrados[0].total);

    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${oas.length}`);

    if (totalMigrados === oas.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de datos migrados:');
    const ejemplos =
      await prismaPostgres.$queryRaw`SELECT id, oas_id, descripcion_oas, basal FROM oa ORDER BY id LIMIT 3`;

    ejemplos.forEach(oa => {
      console.log(`\nID: ${oa.id}`);
      console.log(`  OA ID: ${oa.oas_id}`);
      console.log(`  Descripción: ${oa.descripcion_oas.substring(0, 80)}...`);
      console.log(`  Basal: ${oa.basal}`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla OA completada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarOA();
