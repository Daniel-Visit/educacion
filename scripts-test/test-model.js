const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('Modelos disponibles:', Object.keys(prisma));
console.log('matrizEspecificacion disponible:', !!prisma.matrizEspecificacion);

if (prisma.matrizEspecificacion) {
  console.log('Métodos del modelo:', Object.keys(prisma.matrizEspecificacion));
} else {
  console.log('El modelo matrizEspecificacion NO está disponible');
} 