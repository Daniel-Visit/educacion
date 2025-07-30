const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

console.log('Modelos disponibles en PrismaClient:');
console.log(Object.keys(prisma)); 