const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Configurar Prisma para SQLite (origen)
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db',
    },
  },
});

// Configurar Prisma para PostgreSQL (destino)
const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRES,
    },
  },
});

async function migrarAsignatura() {
  console.log('🚀 Iniciando migración de tabla: asignatura');
  console.log('='.repeat(50));

  try {
    // Paso 1: Leer datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');
    const asignaturasSQLite = await sqlitePrisma.asignatura.findMany({
      orderBy: { id: 'asc' },
    });

    console.log(
      `✅ Encontradas ${asignaturasSQLite.length} asignaturas en SQLite`
    );

    // Mostrar datos para verificación
    console.log('\n📋 Datos en SQLite:');
    asignaturasSQLite.forEach(asignatura => {
      console.log(`  ID: ${asignatura.id}, Nombre: "${asignatura.nombre}"`);
    });

    // Paso 2: Verificar que PostgreSQL esté vacío
    console.log('\n🔍 Verificando PostgreSQL...');
    const asignaturasPostgres = await postgresPrisma.asignatura.findMany();

    if (asignaturasPostgres.length > 0) {
      console.log('⚠️  ADVERTENCIA: PostgreSQL ya tiene datos!');
      console.log('Datos en PostgreSQL:');
      asignaturasPostgres.forEach(asignatura => {
        console.log(`  ID: ${asignatura.id}, Nombre: "${asignatura.nombre}"`);
      });

      const respuesta = process.argv.includes('--force');
      if (!respuesta) {
        console.log('\n❌ Migración cancelada. Usa --force para continuar.');
        return;
      }
    } else {
      console.log('✅ PostgreSQL está vacío, listo para migración');
    }

    // Paso 3: Migrar datos
    console.log('\n🔄 Migrando datos a PostgreSQL...');
    const resultados = [];

    for (const asignatura of asignaturasSQLite) {
      try {
        const nuevaAsignatura = await postgresPrisma.asignatura.create({
          data: {
            id: asignatura.id, // Mantener el mismo ID
            nombre: asignatura.nombre,
          },
        });

        resultados.push({
          id: nuevaAsignatura.id,
          nombre: nuevaAsignatura.nombre,
          status: '✅ Migrado correctamente',
        });

        console.log(
          `  ✅ Migrado: ID ${asignatura.id} - "${asignatura.nombre}"`
        );
      } catch (error) {
        console.log(
          `  ❌ Error migrando ID ${asignatura.id}: ${error.message}`
        );
        resultados.push({
          id: asignatura.id,
          nombre: asignatura.nombre,
          status: `❌ Error: ${error.message}`,
        });
      }
    }

    // Paso 4: Verificación final
    console.log('\n🔍 Verificación final...');
    const asignaturasFinales = await postgresPrisma.asignatura.findMany({
      orderBy: { id: 'asc' },
    });

    console.log(`\n📊 Resumen de migración:`);
    console.log(`  SQLite: ${asignaturasSQLite.length} registros`);
    console.log(`  PostgreSQL: ${asignaturasFinales.length} registros`);
    console.log(
      `  Exitosos: ${resultados.filter(r => r.status.includes('✅')).length}`
    );
    console.log(
      `  Errores: ${resultados.filter(r => r.status.includes('❌')).length}`
    );

    // Verificar que los datos sean idénticos
    const sonIdenticos =
      asignaturasSQLite.length === asignaturasFinales.length &&
      asignaturasSQLite.every(
        (sqlite, index) =>
          sqlite.id === asignaturasFinales[index].id &&
          sqlite.nombre === asignaturasFinales[index].nombre
      );

    if (sonIdenticos) {
      console.log('\n🎉 ¡MIGRACIÓN EXITOSA! Los datos son idénticos.');
    } else {
      console.log('\n⚠️  ADVERTENCIA: Los datos no son idénticos!');
      console.log('Diferencias encontradas:');

      asignaturasSQLite.forEach((sqlite, index) => {
        const postgres = asignaturasFinales[index];
        if (
          !postgres ||
          sqlite.id !== postgres.id ||
          sqlite.nombre !== postgres.nombre
        ) {
          console.log(`  SQLite: ID ${sqlite.id} - "${sqlite.nombre}"`);
          console.log(
            `  PostgreSQL: ID ${postgres?.id} - "${postgres?.nombre}"`
          );
          console.log('  ---');
        }
      });
    }

    // Guardar log de migración
    const logData = {
      fecha: new Date().toISOString(),
      tabla: 'asignatura',
      sqliteCount: asignaturasSQLite.length,
      postgresCount: asignaturasFinales.length,
      exitosos: resultados.filter(r => r.status.includes('✅')).length,
      errores: resultados.filter(r => r.status.includes('❌')).length,
      sonIdenticos,
      resultados,
    };

    fs.writeFileSync(
      'migracion-asignatura-log.json',
      JSON.stringify(logData, null, 2)
    );
    console.log('\n📝 Log guardado en: migracion-asignatura-log.json');
  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

// Ejecutar migración
migrarAsignatura();
