const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleFiles() {
  try {
    // Crear una imagen de ejemplo (un pixel PNG transparente en base64)
    const imagenEjemplo = await prisma.imagen.create({
      data: {
        nombre: 'pixel-transparente.png',
        tipo: 'image/png',
        data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        tamaño: 95,
      },
    });

    console.log('Imagen de ejemplo creada:', imagenEjemplo.nombre);

    // Crear archivo de planificación de ejemplo
    const planificacion = await prisma.archivo.create({
      data: {
        titulo: 'Planificación de Matemáticas - Álgebra',
        tipo: 'planificacion',
        contenido: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Planificación de Matemáticas' }],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Unidad: Álgebra Básica' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Esta planificación cubre los fundamentos del álgebra para estudiantes de primer año.',
                },
              ],
            },
            {
              type: 'image',
              attrs: {
                src: `/api/imagenes/${imagenEjemplo.id}`,
                alt: 'Diagrama de ejemplo',
              },
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Objetivos de Aprendizaje:' }],
            },
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Comprender las operaciones básicas con variables',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Resolver ecuaciones lineales simples',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Aplicar conceptos algebraicos en problemas reales',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      },
    });

    // Crear archivo de material de ejemplo
    const material = await prisma.archivo.create({
      data: {
        titulo: 'Material de Apoyo - Ecuaciones Lineales',
        tipo: 'material',
        contenido: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: 'Material de Apoyo' }],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Ecuaciones Lineales' }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Una ecuación lineal es una igualdad que contiene una o más variables elevadas a la primera potencia.',
                },
              ],
            },
            {
              type: 'image',
              attrs: {
                src: `/api/imagenes/${imagenEjemplo.id}`,
                alt: 'Ejemplo visual',
              },
            },
            {
              type: 'heading',
              attrs: { level: 3 },
              content: [{ type: 'text', text: 'Ejemplo:' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '2x + 3 = 7' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Para resolver esta ecuación:' }],
            },
            {
              type: 'orderedList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Restar 3 a ambos lados: 2x = 4',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Dividir por 2: x = 2' }],
                    },
                  ],
                },
              ],
            },
          ],
        }),
      },
    });

    // Crear relaciones entre archivos e imágenes
    await prisma.archivoImagen.createMany({
      data: [
        {
          archivoId: planificacion.id,
          imagenId: imagenEjemplo.id,
        },
        {
          archivoId: material.id,
          imagenId: imagenEjemplo.id,
        },
      ],
    });

    console.log('Archivos de ejemplo creados exitosamente:');
    console.log('Planificación:', planificacion.titulo);
    console.log('Material:', material.titulo);
    console.log('Imagen compartida entre ambos archivos');
  } catch (error) {
    console.error('Error al crear archivos de ejemplo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleFiles();
