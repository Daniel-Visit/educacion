const { PrismaClient } = require('@prisma/client');

// Cliente para SQLite (origen)
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

// Cliente para PostgreSQL (destino) - usando esquema específico
const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.pchttmjsbxqaedszjaje:n2piyteoknP08FN6@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
    }
  }
});

async function migrarAsignatura() {
  console.log('🚀 MIGRACIÓN: asignatura (SQLite → PostgreSQL)');
  console.log('=' .repeat(50));

  try {
    // 1. Leer datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');
    const asignaturasSQLite = await sqlitePrisma.asignatura.findMany({
      orderBy: { id: 'asc' }
    });

    console.log(`✅ Encontradas ${asignaturasSQLite.length} asignaturas en SQLite`);

    // 2. Verificar PostgreSQL usando query raw
    console.log('\n🔍 Verificando PostgreSQL...');
    const asignaturasPostgres = await postgresPrisma.$queryRaw`SELECT * FROM asignatura ORDER BY id`;
    
    if (asignaturasPostgres.length > 0) {
      console.log(`⚠️  PostgreSQL ya tiene ${asignaturasPostgres.length} asignaturas`);
      console.log('¿Continuar? (Ctrl+C para cancelar)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      console.log('✅ PostgreSQL está vacío, listo para migración');
    }

    // 3. Migrar datos usando query raw
    console.log('\n🔄 Migrando datos...');
    const resultados = [];

    for (const asignatura of asignaturasSQLite) {
      try {
        await postgresPrisma.$executeRaw`INSERT INTO asignatura (id, nombre) VALUES (${asignatura.id}, ${asignatura.nombre})`;

        resultados.push({
          id: asignatura.id,
          nombre: asignatura.nombre,
          status: '✅ Migrado'
        });

        console.log(`  ✅ ID ${asignatura.id}: "${asignatura.nombre}"`);
      } catch (error) {
        console.log(`  ❌ Error ID ${asignatura.id}: ${error.message}`);
        resultados.push({
          id: asignatura.id,
          nombre: asignatura.nombre,
          status: `❌ Error: ${error.message}`
        });
      }
    }

    // 4. Verificación final
    console.log('\n🔍 Verificación final...');
    const asignaturasFinales = await postgresPrisma.$queryRaw`SELECT * FROM asignatura ORDER BY id`;

    console.log(`\n📊 RESUMEN:`);
    console.log(`  SQLite: ${asignaturasSQLite.length} registros`);
    console.log(`  PostgreSQL: ${asignaturasFinales.length} registros`);
    console.log(`  Exitosos: ${resultados.filter(r => r.status.includes('✅')).length}`);
    console.log(`  Errores: ${resultados.filter(r => r.status.includes('❌')).length}`);

    // Verificar que sean idénticos
    const sonIdenticos = asignaturasSQLite.length === asignaturasFinales.length &&
      asignaturasSQLite.every((sqlite, index) => 
        sqlite.id === asignaturasFinales[index].id &&
        sqlite.nombre === asignaturasFinales[index].nombre
      );

    if (sonIdenticos) {
      console.log('\n🎉 ¡MIGRACIÓN EXITOSA! Los datos son idénticos.');
    } else {
      console.log('\n⚠️  ADVERTENCIA: Los datos no son idénticos!');
    }

  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

migrarAsignatura(); 