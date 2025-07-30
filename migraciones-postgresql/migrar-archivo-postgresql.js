const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();

// Cliente para PostgreSQL
const prismaPostgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRES
    }
  }
});

// Conexión a SQLite
const db = new sqlite3.Database('./prisma/dev.db');

async function migrarArchivo() {
  try {
    console.log('🚀 MIGRANDO TABLA ARCHIVO A POSTGRESQL');
    console.log('=' .repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');
    
    const archivos = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM Archivo ORDER BY id", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${archivos.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const existentes = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM "Archivo"`;
    const totalExistentes = parseInt(existentes[0].total);
    
    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM "Archivo"`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');
    
    for (const archivo of archivos) {
      // Convertir timestamps de milisegundos a Date para PostgreSQL
      const createdAt = new Date(archivo.createdAt);
      const updatedAt = new Date(archivo.updatedAt);
      
      await prismaPostgres.$executeRaw`
        INSERT INTO "Archivo" (id, titulo, tipo, contenido, "createdAt", "updatedAt")
        VALUES (${archivo.id}, ${archivo.titulo}, ${archivo.tipo}, ${archivo.contenido}, ${createdAt}, ${updatedAt})
      `;
      console.log(`✅ Insertado: ${archivo.titulo} (ID: ${archivo.id}, Tipo: ${archivo.tipo})`);
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const migrados = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM "Archivo"`;
    const totalMigrados = parseInt(migrados[0].total);
    
    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${archivos.length}`);
    
    if (totalMigrados === archivos.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar algunos ejemplos
    console.log('\n📋 Ejemplos de datos migrados:');
    const ejemplos = await prismaPostgres.$queryRaw`SELECT id, titulo, tipo, LENGTH(contenido) as contenido_length FROM "Archivo" ORDER BY id LIMIT 5`;
    
    ejemplos.forEach(archivo => {
      console.log(`\nID: ${archivo.id}`);
      console.log(`  Título: ${archivo.titulo}`);
      console.log(`  Tipo: ${archivo.tipo}`);
      console.log(`  Tamaño contenido: ${archivo.contenido_length} caracteres`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla Archivo completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarArchivo(); 