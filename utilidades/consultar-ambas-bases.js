const { PrismaClient } = require('@prisma/client');

// Cliente para SQLite
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

// Cliente para PostgreSQL
const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.pchttmjsbxqaedszjaje:n2piyteoknP08FN6@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function consultarAmbasBases() {
  try {
    console.log('🔍 CONSULTANDO AMBAS BASES DE DATOS');
    console.log('=' .repeat(50));

    // 1. Consultar SQLite
    console.log('\n📋 SQLITE (ORIGEN):');
    const metodologiasSQLite = await sqlitePrisma.$queryRaw`SELECT * FROM metodologia ORDER BY id LIMIT 3`;
    console.log(JSON.stringify(metodologiasSQLite, null, 2));

    // 2. Consultar PostgreSQL
    console.log('\n📋 POSTGRESQL (DESTINO):');
    const metodologiasPostgres = await postgresPrisma.$queryRaw`SELECT * FROM metodologia ORDER BY id LIMIT 3`;
    console.log(JSON.stringify(metodologiasPostgres, null, 2));

    console.log('\n✅ Consulta completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

consultarAmbasBases(); 