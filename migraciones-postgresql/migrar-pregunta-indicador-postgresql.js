const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();

// Cliente para PostgreSQL
const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.pchttmjsbxqaedszjaje:n2piyteoknP08FN6@aws-0-us-east-2.pooler.supabase.com:5432/postgres',
    },
  },
});

// Conexión a SQLite
const db = new sqlite3.Database('./prisma/dev.db');

async function migrarPreguntaIndicador() {
  try {
    console.log('🚀 MIGRANDO TABLA PREGUNTAINDICADOR A POSTGRESQL');
    console.log('='.repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');

    const preguntaIndicadores = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM pregunta_indicador ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${preguntaIndicadores.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const existentes =
      await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM pregunta_indicador`;
    const totalExistentes = parseInt(existentes[0].total);

    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM pregunta_indicador`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');

    for (const preguntaIndicador of preguntaIndicadores) {
      await prismaPostgres.$executeRaw`
        INSERT INTO pregunta_indicador (id, "preguntaId", "indicadorId", tipo)
        VALUES (${preguntaIndicador.id}, ${preguntaIndicador.preguntaId}, ${preguntaIndicador.indicadorId}, ${preguntaIndicador.tipo})
      `;
      console.log(
        `✅ Insertado: ID ${preguntaIndicador.id} - Pregunta: ${preguntaIndicador.preguntaId}, Indicador: ${preguntaIndicador.indicadorId}, Tipo: ${preguntaIndicador.tipo}`
      );
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const migrados =
      await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM pregunta_indicador`;
    const totalMigrados = parseInt(migrados[0].total);

    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${preguntaIndicadores.length}`);

    if (totalMigrados === preguntaIndicadores.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar datos migrados
    console.log('\n📋 Datos migrados:');
    const datosMigrados =
      await prismaPostgres.$queryRaw`SELECT * FROM pregunta_indicador ORDER BY id`;

    datosMigrados.forEach(preguntaIndicador => {
      console.log(`\nID: ${preguntaIndicador.id}`);
      console.log(`  Pregunta ID: ${preguntaIndicador.preguntaId}`);
      console.log(`  Indicador ID: ${preguntaIndicador.indicadorId}`);
      console.log(`  Tipo: ${preguntaIndicador.tipo}`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla PreguntaIndicador completada');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarPreguntaIndicador();
