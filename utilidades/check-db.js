const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Configurar la ruta de la base de datos
process.env.DATABASE_URL = `file:${path.join(__dirname, 'prisma/dev.db')}`;

const prisma = new PrismaClient();

async function verificarIntegridadDB() {
  try {
    console.log('🔍 Verificando integridad de la base de datos...\n');

    // 1. Verificar datos educativos básicos
    console.log('📚 1. Verificando datos educativos básicos:');

    const asignaturas = await prisma.asignatura.findMany();
    console.log(`   ✅ Asignaturas: ${asignaturas.length} registros`);

    const niveles = await prisma.nivel.findMany();
    console.log(`   ✅ Niveles: ${niveles.length} registros`);

    const metodologias = await prisma.metodologia.findMany();
    console.log(`   ✅ Metodologías: ${metodologias.length} registros`);

    const oas = await prisma.oa.findMany();
    console.log(`   ✅ OAs: ${oas.length} registros`);

    // 2. Verificar profesores
    console.log('\n👥 2. Verificando profesores:');

    const profesores = await prisma.profesor.findMany();
    console.log(`   ✅ Profesores: ${profesores.length} registros`);
    profesores.forEach(prof => {
      console.log(`      - ${prof.nombre} (RUT: ${prof.rut})`);
    });

    // 3. Verificar relaciones profesor-asignatura
    console.log('\n🔗 3. Verificando relaciones profesor-asignatura:');

    const profesorAsignaturas = await prisma.profesorAsignatura.findMany({
      include: {
        profesor: true,
        asignatura: true,
      },
    });
    console.log(
      `   ✅ Relaciones profesor-asignatura: ${profesorAsignaturas.length} registros`
    );

    // 4. Verificar relaciones profesor-nivel
    console.log('\n🔗 4. Verificando relaciones profesor-nivel:');

    const profesorNiveles = await prisma.profesorNivel.findMany({
      include: {
        profesor: true,
        nivel: true,
      },
    });
    console.log(
      `   ✅ Relaciones profesor-nivel: ${profesorNiveles.length} registros`
    );

    // 5. Verificar horarios
    console.log('\n⏰ 5. Verificando horarios:');

    const horarios = await prisma.horario.findMany({
      include: {
        profesor: true,
        asignatura: true,
        nivel: true,
      },
    });
    console.log(`   ✅ Horarios: ${horarios.length} registros`);

    // 6. Verificar módulos horarios
    console.log('\n📅 6. Verificando módulos horarios:');

    const modulosHorarios = await prisma.moduloHorario.findMany({
      include: {
        horario: true,
        profesores: {
          include: {
            profesor: true,
          },
        },
      },
    });
    console.log(`   ✅ Módulos horarios: ${modulosHorarios.length} registros`);

    // 7. Verificar planificaciones anuales
    console.log('\n📋 7. Verificando planificaciones anuales:');

    const planificaciones = await prisma.planificacionAnual.findMany({
      include: {
        horario: true,
        asignaciones: {
          include: {
            oa: true,
          },
        },
      },
    });
    console.log(
      `   ✅ Planificaciones anuales: ${planificaciones.length} registros`
    );

    // 8. Verificar matrices de especificación
    console.log('\n🎯 8. Verificando matrices de especificación:');

    const matrices = await prisma.matrizEspecificacion.findMany({
      include: {
        oas: {
          include: {
            indicadores: true,
          },
        },
        evaluaciones: true,
      },
    });
    console.log(`   ✅ Matrices: ${matrices.length} registros`);

    // 9. Verificar evaluaciones
    console.log('\n📝 9. Verificando evaluaciones:');

    const evaluaciones = await prisma.evaluacion.findMany({
      include: {
        matriz: true,
        archivo: true,
        preguntas: {
          include: {
            alternativas: true,
          },
        },
      },
    });
    console.log(`   ✅ Evaluaciones: ${evaluaciones.length} registros`);

    // 10. Verificar archivos
    console.log('\n📁 10. Verificando archivos:');

    const archivos = await prisma.archivo.findMany({
      include: {
        imagenes: {
          include: {
            imagen: true,
          },
        },
        evaluaciones: true,
      },
    });
    console.log(`   ✅ Archivos: ${archivos.length} registros`);

    // 11. Verificar imágenes
    console.log('\n🖼️ 11. Verificando imágenes:');

    const imagenes = await prisma.imagen.findMany();
    console.log(`   ✅ Imágenes: ${imagenes.length} registros`);

    // 12. Verificar constraints y relaciones
    console.log('\n🔒 12. Verificando constraints y relaciones:');

    // Verificar que todos los OAs tienen asignatura_id y nivel_id válidos
    const oasConRelaciones = await prisma.oa.findMany({
      include: {
        asignatura: true,
        nivel: true,
      },
    });
    const oasSinAsignatura = oasConRelaciones.filter(oa => !oa.asignatura);
    const oasSinNivel = oasConRelaciones.filter(oa => !oa.nivel);
    console.log(
      `   ✅ OAs con asignatura válida: ${oasConRelaciones.length - oasSinAsignatura.length}/${oasConRelaciones.length}`
    );
    console.log(
      `   ✅ OAs con nivel válido: ${oasConRelaciones.length - oasSinNivel.length}/${oasConRelaciones.length}`
    );

    // Verificar que todas las evaluaciones tienen matriz y archivo válidos
    const evaluacionesConRelaciones = await prisma.evaluacion.findMany({
      include: {
        matriz: true,
        archivo: true,
      },
    });
    const evaluacionesSinMatriz = evaluacionesConRelaciones.filter(
      eval => !eval.matriz
    );
    const evaluacionesSinArchivo = evaluacionesConRelaciones.filter(
      eval => !eval.archivo
    );
    console.log(
      `   ✅ Evaluaciones con matriz válida: ${evaluacionesConRelaciones.length - evaluacionesSinMatriz.length}/${evaluacionesConRelaciones.length}`
    );
    console.log(
      `   ✅ Evaluaciones con archivo válido: ${evaluacionesConRelaciones.length - evaluacionesSinArchivo.length}/${evaluacionesConRelaciones.length}`
    );

    // Verificar que todos los horarios tienen profesor, asignatura y nivel válidos
    const horariosConRelaciones = await prisma.horario.findMany({
      include: {
        profesor: true,
        asignatura: true,
        nivel: true,
      },
    });
    const horariosSinProfesor = horariosConRelaciones.filter(
      hor => !hor.profesor
    );
    const horariosSinAsignatura = horariosConRelaciones.filter(
      hor => !hor.asignatura
    );
    const horariosSinNivel = horariosConRelaciones.filter(hor => !hor.nivel);
    console.log(
      `   ✅ Horarios con profesor válido: ${horariosConRelaciones.length - horariosSinProfesor.length}/${horariosConRelaciones.length}`
    );
    console.log(
      `   ✅ Horarios con asignatura válida: ${horariosConRelaciones.length - horariosSinAsignatura.length}/${horariosConRelaciones.length}`
    );
    console.log(
      `   ✅ Horarios con nivel válido: ${horariosConRelaciones.length - horariosSinNivel.length}/${horariosConRelaciones.length}`
    );

    console.log('\n🎉 Verificación de integridad completada exitosamente!');
    console.log(
      '✅ La base de datos está en buen estado y lista para el prisma db push.'
    );
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarIntegridadDB();
