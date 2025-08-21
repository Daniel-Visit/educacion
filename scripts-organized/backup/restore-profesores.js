const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Configurar la ruta de la base de datos
process.env.DATABASE_URL = `file:${path.join(__dirname, '../prisma/dev.db')}`;

const prisma = new PrismaClient();

async function insertarProfesores() {
  try {
    console.log('🔄 Iniciando inserción de profesores...');

    // Primero eliminar todas las referencias a profesores en otras tablas
    console.log('🗑️ Eliminando referencias a profesores en otras tablas...');

    // Eliminar relaciones profesor-asignatura
    const profesorAsignaturasEliminadas =
      await prisma.profesorAsignatura.deleteMany({});
    console.log(
      `✅ Eliminadas ${profesorAsignaturasEliminadas.count} relaciones profesor-asignatura`
    );

    // Eliminar relaciones profesor-nivel
    const profesorNivelesEliminados = await prisma.profesorNivel.deleteMany({});
    console.log(
      `✅ Eliminados ${profesorNivelesEliminados.count} relaciones profesor-nivel`
    );

    // Eliminar relaciones módulo-profesor
    const moduloProfesoresEliminados =
      await prisma.moduloHorarioProfesor.deleteMany({});
    console.log(
      `✅ Eliminados ${moduloProfesoresEliminados.count} relaciones módulo-profesor`
    );

    // Eliminar horarios que referencian profesores
    const horariosEliminados = await prisma.horario.deleteMany({});
    console.log(`✅ Eliminados ${horariosEliminados.count} horarios`);

    // Ahora eliminar todos los profesores
    console.log('🗑️ Eliminando profesores existentes...');
    const profesoresEliminados = await prisma.profesor.deleteMany({});
    console.log(
      `✅ Eliminados ${profesoresEliminados.count} profesores existentes`
    );

    // Datos de los profesores
    const hoy = new Date();
    const fecha25 = new Date(
      hoy.getFullYear() - 25,
      hoy.getMonth(),
      hoy.getDate()
    );
    const fecha35 = new Date(
      hoy.getFullYear() - 35,
      hoy.getMonth(),
      hoy.getDate()
    );
    const profesores = [
      {
        rut: '12345678-9',
        nombre: 'Francisca Díaz',
        email: 'francisca.diaz@educacion.cl',
        telefono: '+56912345678',
        fechaNacimiento: fecha25.toISOString(),
      },
      {
        rut: '98765432-1',
        nombre: 'Pedro Montalva',
        email: 'pedro.montalva@educacion.cl',
        telefono: '+56987654321',
        fechaNacimiento: fecha35.toISOString(),
      },
    ];

    // Insertar profesores
    for (const profesor of profesores) {
      const profesorCreado = await prisma.profesor.create({
        data: profesor,
      });
      console.log(
        `✅ Profesor creado: ${profesorCreado.nombre} (ID: ${profesorCreado.id})`
      );
    }

    // Verificar profesores insertados
    const profesoresEnBD = await prisma.profesor.findMany();
    console.log('\n📋 Profesores en la base de datos:');
    profesoresEnBD.forEach(prof => {
      console.log(
        `  - ${prof.nombre} (RUT: ${prof.rut}, Email: ${prof.email})`
      );
    });

    console.log('\n🎉 Inserción de profesores completada exitosamente!');
    console.log(`📊 Total de profesores: ${profesoresEnBD.length}`);
  } catch (error) {
    console.error('❌ Error al insertar profesores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para solo mostrar profesores existentes
async function mostrarProfesores() {
  try {
    const profesores = await prisma.profesor.findMany({
      orderBy: { nombre: 'asc' },
    });

    if (profesores.length === 0) {
      console.log('📭 No hay profesores registrados en la base de datos.');
      console.log(
        '💡 Ejecuta este script para insertar profesores de ejemplo.'
      );
    } else {
      console.log('📋 Profesores registrados en la base de datos:');
      console.log('');
      profesores.forEach((prof, index) => {
        console.log(`${index + 1}. ${prof.nombre}`);
        console.log(`   RUT: ${prof.rut}`);
        console.log(`   Email: ${prof.email || 'No especificado'}`);
        console.log(`   Teléfono: ${prof.telefono || 'No especificado'}`);
        console.log(`   Creado: ${prof.createdAt.toLocaleDateString('es-CL')}`);
        console.log('');
      });
      console.log(`📊 Total de profesores: ${profesores.length}`);
    }
  } catch (error) {
    console.error('❌ Error al consultar profesores:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
const comando = args[0];

if (comando === '--list' || comando === '-l') {
  mostrarProfesores();
} else {
  insertarProfesores();
}
