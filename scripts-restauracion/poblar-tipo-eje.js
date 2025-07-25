const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function poblarTipoEje() {
  try {
    console.log('=== Poblando campo tipo_eje en tabla OA ===');
    
    // OAs 1-30: tipo_eje = "Contenido"
    console.log('\n1. Actualizando OAs 1-30 con tipo_eje = "Contenido"...');
    const resultadoContenido = await prisma.oa.updateMany({
      where: {
        id: {
          gte: 1,
          lte: 30
        }
      },
      data: {
        tipo_eje: "Contenido"
      }
    });
    console.log(`✅ ${resultadoContenido.count} OAs actualizados con "Contenido"`);
    
    // OAs 31-37: tipo_eje = "Actitud"
    console.log('\n2. Actualizando OAs 31-37 con tipo_eje = "Actitud"...');
    const resultadoActitud = await prisma.oa.updateMany({
      where: {
        id: {
          gte: 31,
          lte: 37
        }
      },
      data: {
        tipo_eje: "Actitud"
      }
    });
    console.log(`✅ ${resultadoActitud.count} OAs actualizados con "Actitud"`);
    
    // Verificar que se actualizaron correctamente
    console.log('\n3. Verificando actualizaciones...');
    const oasActualizados = await prisma.oa.findMany({
      select: {
        id: true,
        oas_id: true,
        tipo_eje: true
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    console.log('\n📋 Resumen de categorización:');
    oasActualizados.forEach(oa => {
      console.log(`- OA ${oa.id} (${oa.oas_id}): ${oa.tipo_eje}`);
    });
    
    // Contar por tipo
    const conteoContenido = oasActualizados.filter(oa => oa.tipo_eje === "Contenido").length;
    const conteoActitud = oasActualizados.filter(oa => oa.tipo_eje === "Actitud").length;
    
    console.log(`\n📊 Total: ${conteoContenido} Contenido, ${conteoActitud} Actitud`);
    console.log('\n🎉 ¡Campo tipo_eje poblado exitosamente!');
    
  } catch (error) {
    console.error('Error al poblar tipo_eje:', error);
  } finally {
    await prisma.$disconnect();
  }
}

poblarTipoEje(); 