const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

async function restoreArchivosEjemplo() {
  try {
    console.log('=== Restaurando archivos de ejemplo ===');

    // Archivo de ejemplo 1: Planificación de Clase
    const planificacionClase = await prisma.archivo.upsert({
      where: { titulo: 'Planificación de Clase - Matemáticas 1° Básico' },
      update: {},
      create: {
        titulo: 'Planificación de Clase - Matemáticas 1° Básico',
        tipo: 'planificacion',
        contenido: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [
                { type: 'text', text: 'Planificación de Clase: Suma y Resta' },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Esta es una planificación de ejemplo para una clase de matemáticas de 1° básico.',
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Objetivos de Aprendizaje' }],
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
                          text: 'Comprender la suma y resta de números hasta 20',
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
                          text: 'Resolver problemas matemáticos simples',
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
    console.log('✅ Planificación de clase creada');

    // Archivo de ejemplo 2: Material de Apoyo
    const materialApoyo = await prisma.archivo.upsert({
      where: { titulo: 'Material de Apoyo - Ciencias Naturales' },
      update: {},
      create: {
        titulo: 'Material de Apoyo - Ciencias Naturales',
        tipo: 'material',
        contenido: JSON.stringify({
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [
                { type: 'text', text: 'Material de Apoyo: El Sistema Solar' },
              ],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Este material de apoyo ayuda a los estudiantes a comprender el sistema solar.',
                },
              ],
            },
            {
              type: 'heading',
              attrs: { level: 2 },
              content: [{ type: 'text', text: 'Planetas del Sistema Solar' }],
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
                          text: 'Mercurio - El planeta más cercano al Sol',
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
                          text: 'Venus - El planeta más caliente',
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
                        { type: 'text', text: 'Tierra - Nuestro hogar' },
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
    console.log('✅ Material de apoyo creado');

    console.log('\n🎉 ¡Archivos de ejemplo restaurados exitosamente!');
  } catch (error) {
    console.error('Error al restaurar archivos de ejemplo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreArchivosEjemplo();
