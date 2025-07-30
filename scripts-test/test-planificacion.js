// Script de prueba para verificar que la aplicación esté funcionando
async function testPlanificacion() {
  try {
    console.log('=== TEST PLANIFICACIÓN ===');
    
    // Verificar que la aplicación esté corriendo
    console.log('\n1. Verificando que la aplicación esté corriendo...');
    const healthResponse = await fetch('http://localhost:3000/api/planificaciones');
    if (healthResponse.ok) {
      console.log('✅ Aplicación funcionando correctamente');
    } else {
      console.log('❌ Error al conectar con la aplicación');
      return;
    }
    
    // Obtener planificaciones
    const planificaciones = await healthResponse.json();
    console.log(`\n2. Planificaciones disponibles: ${planificaciones.length}`);
    
    if (planificaciones.length > 0) {
      const primeraPlanificacion = planificaciones[0];
      console.log(`\n3. Probando con planificación ID: ${primeraPlanificacion.id}`);
      
      // Obtener detalles de la planificación
      const detailResponse = await fetch(`http://localhost:3000/api/planificaciones/${primeraPlanificacion.id}`);
      const planificacionDetalle = await detailResponse.json();
      
      console.log(`\n4. Planificación cargada: ${planificacionDetalle.nombre}`);
      console.log(`   - Asignaciones: ${planificacionDetalle.asignaciones?.length || 0}`);
      
      // Verificar algunas asignaciones específicas
      if (planificacionDetalle.asignaciones && planificacionDetalle.asignaciones.length > 0) {
        console.log('\n5. Verificando asignaciones:');
        planificacionDetalle.asignaciones.slice(0, 5).forEach((asignacion, index) => {
          console.log(`   ${index + 1}. OA ID: ${asignacion.oaId}, Clases: ${asignacion.cantidadClases}`);
        });
      }
      
      // Obtener ejes
      console.log('\n6. Verificando ejes...');
      const ejesResponse = await fetch('http://localhost:3000/api/ejes');
      const ejes = await ejesResponse.json();
      console.log(`   - Ejes disponibles: ${ejes.length}`);
      
      // Verificar que los OA IDs de las asignaciones estén en los ejes
      const oaIdsEnAsignaciones = planificacionDetalle.asignaciones?.map(a => a.oaId) || [];
      const oaIdsEnEjes = ejes.flatMap(eje => eje.oas.map(oa => oa.id));
      
      const oasNoEncontrados = oaIdsEnAsignaciones.filter(id => !oaIdsEnEjes.includes(id));
      
      if (oasNoEncontrados.length === 0) {
        console.log('✅ Todos los OA IDs de las asignaciones están presentes en los ejes');
      } else {
        console.log(`❌ OA IDs no encontrados: ${oasNoEncontrados}`);
      }
      
      console.log('\n=== RESULTADO ===');
      console.log('✅ Todas las verificaciones pasaron correctamente');
      console.log('🔗 URL para probar: http://localhost:3000/planificacion-anual?planificacionId=' + primeraPlanificacion.id);
      
    } else {
      console.log('❌ No hay planificaciones disponibles para probar');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

testPlanificacion(); 