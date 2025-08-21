const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addAsignaturaNivel() {
  try {
    console.log('=== Agregando combinaciones Asignatura/Nivel ===');

    // Combinación 1: Lenguaje 2° Básico
    console.log('\n1. Agregando Lenguaje 2° Básico...');
    const lenguaje2do = await prisma.asignaturaNivel.upsert({
      where: {
        asignatura_id_nivel_id: {
          asignatura_id: 7,
          nivel_id: 2,
        },
      },
      update: {},
      create: {
        asignatura_id: 7,
        nivel_id: 2,
        codigo: 'LE02',
        descripcion: 'Lenguaje y Comunicación 2° Básico',
      },
    });
    console.log(`✅ Lenguaje 2° Básico agregado: ${lenguaje2do.codigo}`);

    // Combinación 2: Matemática 2° Básico
    console.log('\n2. Agregando Matemática 2° Básico...');
    const matematica2do = await prisma.asignaturaNivel.upsert({
      where: {
        asignatura_id_nivel_id: {
          asignatura_id: 9,
          nivel_id: 2,
        },
      },
      update: {},
      create: {
        asignatura_id: 9,
        nivel_id: 2,
        codigo: 'MA02',
        descripcion: 'Matemática 2° Básico',
      },
    });
    console.log(`✅ Matemática 2° Básico agregado: ${matematica2do.codigo}`);

    // Verificar que se agregaron correctamente
    console.log('\n3. Verificando combinaciones agregadas...');
    const todasLasCombinaciones = await prisma.asignaturaNivel.findMany({
      include: {
        asignatura: true,
        nivel: true,
      },
    });

    console.log('\n📋 Combinaciones en la base de datos:');
    todasLasCombinaciones.forEach(combinacion => {
      console.log(
        `- ${combinacion.codigo}: ${combinacion.asignatura.nombre} ${combinacion.nivel.nombre}`
      );
    });

    console.log('\n🎉 ¡Combinaciones agregadas exitosamente!');
  } catch (error) {
    console.error('Error al agregar combinaciones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addAsignaturaNivel();
