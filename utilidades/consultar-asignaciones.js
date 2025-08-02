// Consultar directamente la tabla AsignacionOA
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function consultarAsignaciones() {
  try {
    console.log('=== CONSULTANDO TABLA ASIGNACIONOA ===');

    // Consultar todas las asignaciones de la planificación 2
    const asignaciones = await prisma.asignacionOA.findMany({
      where: {
        planificacionId: 2,
      },
      include: {
        oa: {
          include: {
            asignatura: true,
            nivel: true,
          },
        },
      },
      orderBy: {
        oaId: 'asc',
      },
    });

    console.log(`\nTotal de asignaciones: ${asignaciones.length}`);

    // Mostrar las primeras 10 asignaciones
    console.log('\nPrimeras 10 asignaciones:');
    asignaciones.slice(0, 10).forEach((asignacion, index) => {
      console.log(
        `${index + 1}. OA ID: ${asignacion.oaId} | ${asignacion.oa.oas_id} | ${asignacion.oa.asignatura.nombre} | Clases: ${asignacion.cantidadClases}`
      );
    });

    // Verificar si hay OA 01
    const oa01 = asignaciones.find(a => a.oa.oas_id === 'OA 01');
    if (oa01) {
      console.log('\n✅ OA 01 encontrado:');
      console.log(`   OA ID: ${oa01.oaId}`);
      console.log(`   Asignatura: ${oa01.oa.asignatura.nombre}`);
      console.log(`   Clases: ${oa01.cantidadClases}`);
    } else {
      console.log('\n❌ OA 01 NO encontrado');
    }

    // Contar por asignatura
    const porAsignatura = {};
    asignaciones.forEach(asignacion => {
      const asignatura = asignacion.oa.asignatura.nombre;
      if (!porAsignatura[asignatura]) {
        porAsignatura[asignatura] = 0;
      }
      porAsignatura[asignatura]++;
    });

    console.log('\nDistribución por asignatura:');
    Object.keys(porAsignatura).forEach(asignatura => {
      console.log(`  ${asignatura}: ${porAsignatura[asignatura]} asignaciones`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

consultarAsignaciones();
