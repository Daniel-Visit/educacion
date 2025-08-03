// Script para verificar exactamente qué OAs se guardaron en la planificación
async function verificarPlanificacionGuardada() {
  try {
    console.log('=== VERIFICANDO PLANIFICACIÓN GUARDADA ===');

    // 1. Obtener la planificación actual
    console.log('\n1. Obteniendo planificación ID 2...');
    const planificacionResponse = await fetch(
      'http://localhost:3000/api/planificaciones/2'
    );
    const planificacion = await planificacionResponse.json();

    console.log('Planificación:', planificacion.nombre);
    console.log(
      'Horario - Asignatura:',
      planificacion.horario.asignatura.nombre
    );
    console.log('Horario - Nivel:', planificacion.horario.nivel.nombre);

    // 2. Verificar asignaciones guardadas
    console.log('\n2. Asignaciones guardadas:');
    console.log('Cantidad de asignaciones:', planificacion.asignaciones.length);

    planificacion.asignaciones.forEach((asignacion, index) => {
      console.log(
        `${index + 1}. OA ID: ${asignacion.oaId} | ${asignacion.oa.oas_id} | ${asignacion.oa.descripcion_oas.substring(0, 50)}... | Clases: ${asignacion.cantidadClases}`
      );
    });

    // 3. Verificar si OA 01 está en las asignaciones
    console.log('\n3. Buscando OA 01 específicamente:');
    const oa01 = planificacion.asignaciones.find(
      asignacion => asignacion.oa.oas_id === 'OA 01'
    );
    if (oa01) {
      console.log('✅ OA 01 encontrado:');
      console.log(`   ID: ${oa01.oaId}`);
      console.log(`   Clases asignadas: ${oa01.cantidadClases}`);
      console.log(`   Asignatura: ${oa01.oa.asignatura.nombre}`);
    } else {
      console.log('❌ OA 01 NO encontrado en las asignaciones');
    }

    // 4. Verificar todos los OAs por asignatura
    console.log('\n4. Distribución por asignatura:');
    const porAsignatura = {};
    planificacion.asignaciones.forEach(asignacion => {
      const asignatura = asignacion.oa.asignatura.nombre;
      if (!porAsignatura[asignatura]) {
        porAsignatura[asignatura] = [];
      }
      porAsignatura[asignatura].push({
        oas_id: asignacion.oa.oas_id,
        cantidadClases: asignacion.cantidadClases,
      });
    });

    Object.keys(porAsignatura).forEach(asignatura => {
      console.log(`\n${asignatura}:`);
      porAsignatura[asignatura].forEach(oa => {
        console.log(`  ${oa.oas_id}: ${oa.cantidadClases} clases`);
      });
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

verificarPlanificacionGuardada();
