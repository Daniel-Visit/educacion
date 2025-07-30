const { PrismaClient } = require('@prisma/client');

// Cliente para PostgreSQL
const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRES
    }
  }
});

// Datos reales de metodología desde SQLite
const metodologiasReales = [
  {
    id: 1,
    nombre_metodologia: "Aprendizaje Basado en Proyectos (ABP)",
    descripcion: "Los estudiantes adquieren conocimientos y habilidades mediante la elaboración de proyectos que responden a problemas reales, promoviendo el pensamiento crítico, la colaboración y la resolución de problemas.",
    nivel_recomendado: "Educación Básica y Media",
    fuentes_literatura: "- Elige Educar: 6 metodologías de enseñanza que todo profesor innovador debería conocer"
  },
  {
    id: 2,
    nombre_metodologia: "Aula Invertida (Flipped Classroom)",
    descripcion: "Los estudiantes estudian nuevos contenidos en casa mediante materiales proporcionados por el docente y utilizan el tiempo en clase para realizar actividades prácticas y resolver dudas, optimizando el tiempo de instrucción directa.",
    nivel_recomendado: "Educación Media y Superior",
    fuentes_literatura: "- Elige Educar: 6 metodologías de enseñanza que todo profesor innovador debería conocer"
  },
  {
    id: 3,
    nombre_metodologia: "Aprendizaje Cooperativo",
    descripcion: "Estrategia en la que los estudiantes trabajan en pequeños grupos para alcanzar objetivos comunes, fomentando la interdependencia positiva, la responsabilidad individual y grupal, y el desarrollo de habilidades sociales.",
    nivel_recomendado: "Todos los niveles",
    fuentes_literatura: "- Elige Educar: 6 metodologías de enseñanza que todo profesor innovador debería conocer"
  },
  {
    id: 4,
    nombre_metodologia: "Gamificación",
    descripcion: "Incorporación de elementos y dinámicas de juego en contextos educativos para aumentar la motivación, el compromiso y el aprendizaje de los estudiantes.",
    nivel_recomendado: "Educación Básica y Media",
    fuentes_literatura: "- Elige Educar: 6 metodologías de enseñanza que todo profesor innovador debería conocer"
  },
  {
    id: 5,
    nombre_metodologia: "Design Thinking (Pensamiento de Diseño)",
    descripcion: "Metodología centrada en el usuario que busca resolver problemas de manera creativa y colaborativa, fomentando la empatía, la definición de problemas, la ideación, la creación de prototipos y la evaluación.",
    nivel_recomendado: "Educación Media y Superior",
    fuentes_literatura: "- Elige Educar: 6 metodologías de enseñanza que todo profesor innovador debería conocer"
  },
  {
    id: 6,
    nombre_metodologia: "Aprendizaje Basado en el Pensamiento (TBL)",
    descripcion: "Enfocado en desarrollar habilidades de pensamiento crítico y analítico, enseñando a los estudiantes a contextualizar, analizar, relacionar y argumentar, más allá de la simple memorización de información.",
    nivel_recomendado: "Educación Media y Superior",
    fuentes_literatura: "- Elige Educar: 6 metodologías de enseñanza que todo profesor innovador debería conocer"
  },
  {
    id: 7,
    nombre_metodologia: "Aprendizaje Basado en Problemas (ABP)",
    descripcion: "Los estudiantes aprenden a través de la resolución de problemas complejos y reales, desarrollando habilidades de investigación, análisis y solución de problemas de manera autónoma y colaborativa.",
    nivel_recomendado: "Educación Media y Superior",
    fuentes_literatura: "- Universidad Central: Manual de apoyo docente: Metodologías Activas para el aprendizaje"
  },
  {
    id: 8,
    nombre_metodologia: "Aprendizaje por Indagación",
    descripcion: "Método en el que los estudiantes construyen su conocimiento formulando preguntas, investigando y explorando, promoviendo la curiosidad y el pensamiento científico.",
    nivel_recomendado: "Educación Básica y Media",
    fuentes_literatura: "- Wikipedia: Aprendizaje basado en la indagación"
  },
  {
    id: 9,
    nombre_metodologia: "Enseñanza Explícita",
    descripcion: "Estrategia estructurada y directa donde el docente presenta claramente los objetivos de aprendizaje, proporciona explicaciones y modela procedimientos, seguido de práctica guiada y retroalimentación.",
    nivel_recomendado: "Todos los niveles",
    fuentes_literatura: "- American Federation of Teachers: Principles of Instruction: Research-Based Strategies That All Teachers Should Know"
  },
  {
    id: 10,
    nombre_metodologia: "Aceleración Cognitiva",
    descripcion: "Enfoque que busca desarrollar las habilidades de pensamiento de los estudiantes mediante desafíos cognitivos que promueven el razonamiento abstracto y la metacognición.",
    nivel_recomendado: "Educación Básica y Media",
    fuentes_literatura: "- Wikipedia: Aceleración cognitiva"
  },
  {
    id: 11,
    nombre_metodologia: "Tutoría entre Iguales",
    descripcion: "Método en el que estudiantes más avanzados o con mayor dominio de un tema apoyan a sus compañeros en el aprendizaje, beneficiando tanto al tutor como al tutorizado.",
    nivel_recomendado: "Educación Básica y Media",
    fuentes_literatura: "- Currículum Nacional MINEDUC: Tutoría entre iguales: de la teoría a la práctica"
  },
  {
    id: 12,
    nombre_metodologia: "Aprendizaje Autónomo",
    descripcion: "Fomenta que los estudiantes tomen responsabilidad de su propio aprendizaje, estableciendo metas, seleccionando estrategias y evaluando su progreso de manera independiente.",
    nivel_recomendado: "Educación Media y Superior",
    fuentes_literatura: "- Universidad Central: Manual de apoyo docente: Metodologías Activas para el aprendizaje"
  }
];

async function corregirMetodologia() {
  try {
    console.log('🔧 CORRIGIENDO DATOS DE METODOLOGÍA EN POSTGRESQL');
    console.log('=' .repeat(50));

    // 1. Eliminar todos los datos existentes
    console.log('🗑️  Eliminando datos existentes...');
    await prismaPostgres.$executeRaw`DELETE FROM metodologia`;
    console.log('✅ Datos eliminados');

    // 2. Insertar los datos correctos
    console.log('📝 Insertando datos correctos...');
    
    for (const metodologia of metodologiasReales) {
      await prismaPostgres.$executeRaw`
        INSERT INTO metodologia (id, nombre_metodologia, descripcion, nivel_recomendado, fuentes_literatura)
        VALUES (${metodologia.id}, ${metodologia.nombre_metodologia}, ${metodologia.descripcion}, ${metodologia.nivel_recomendado}, ${metodologia.fuentes_literatura})
      `;
      console.log(`✅ Insertado: ${metodologia.nombre_metodologia}`);
    }

    // 3. Verificar
    console.log('\n🔍 Verificando datos insertados...');
    const metodologiasInsertadas = await prismaPostgres.$queryRaw`SELECT * FROM metodologia ORDER BY id`;
    
    console.log(`\n📊 Total registros en PostgreSQL: ${metodologiasInsertadas.length}`);
    console.log('\n📋 Datos insertados:');
    metodologiasInsertadas.forEach(m => {
      console.log(`\nID: ${m.id}`);
      console.log(`  Nombre: "${m.nombre_metodologia}"`);
      console.log(`  Descripción: "${m.descripcion}"`);
      console.log(`  Nivel Recomendado: "${m.nivel_recomendado}"`);
      console.log(`  Fuentes Literatura: "${m.fuentes_literatura}"`);
      console.log('  ---');
    });

    console.log('\n✅ Corrección completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
  }
}

corregirMetodologia(); 