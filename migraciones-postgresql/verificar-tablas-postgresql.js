require('dotenv').config({ path: './env.postgres' });
const { PrismaClient } = require('@prisma/client');

const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRES
    }
  }
});

async function verificarTablas() {
  try {
    console.log('🔍 VERIFICANDO TABLAS EN POSTGRESQL');
    console.log('=' .repeat(50));

    const tablas = await prismaPostgres.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;

    console.log('📋 Tablas en PostgreSQL:');
    tablas.forEach(tabla => {
      console.log(`  - ${tabla.tablename}`);
    });

    console.log(`\n📊 Total tablas: ${tablas.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
  }
}

verificarTablas(); 