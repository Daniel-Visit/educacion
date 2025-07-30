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

async function migrarProfesor() {
  try {
    console.log('🚀 MIGRANDO TABLA PROFESOR A POSTGRESQL');
    console.log('=' .repeat(50));

    // 1. Obtener todos los datos de SQLite
    console.log('📖 Leyendo datos de SQLite...');
    
    const profesores = await new Promise((resolve, reject) => {
      db.all("SELECT * FROM Profesor ORDER BY id", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log(`📊 Total registros en SQLite: ${profesores.length}`);

    // 2. Verificar si ya existen datos en PostgreSQL
    console.log('🔍 Verificando datos existentes en PostgreSQL...');
    const existentes = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM profesor`;
    const totalExistentes = parseInt(existentes[0].total);
    
    if (totalExistentes > 0) {
      console.log(`⚠️  Ya existen ${totalExistentes} registros en PostgreSQL`);
      console.log('🗑️  Eliminando datos existentes...');
      await prismaPostgres.$executeRaw`DELETE FROM profesor`;
      console.log('✅ Datos eliminados');
    }

    // 3. Insertar datos en PostgreSQL
    console.log('📝 Insertando datos en PostgreSQL...');
    
    for (const profesor of profesores) {
      // Convertir timestamps de milisegundos a Date para PostgreSQL
      const createdAt = new Date(profesor.createdAt);
      const updatedAt = new Date(profesor.updatedAt);
      const fechaNacimiento = profesor.fechaNacimiento ? new Date(profesor.fechaNacimiento) : null;
      
      await prismaPostgres.$executeRaw`
        INSERT INTO profesor (id, rut, nombre, email, telefono, "createdAt", "updatedAt", "fechaNacimiento")
        VALUES (${profesor.id}, ${profesor.rut}, ${profesor.nombre}, ${profesor.email}, ${profesor.telefono}, ${createdAt}, ${updatedAt}, ${fechaNacimiento})
      `;
      console.log(`✅ Insertado: ${profesor.nombre} (RUT: ${profesor.rut})`);
    }

    // 4. Verificar migración
    console.log('\n🔍 Verificando migración...');
    const migrados = await prismaPostgres.$queryRaw`SELECT COUNT(*) as total FROM profesor`;
    const totalMigrados = parseInt(migrados[0].total);
    
    console.log(`\n📊 Total registros en PostgreSQL: ${totalMigrados}`);
    console.log(`📊 Total registros en SQLite: ${profesores.length}`);
    
    if (totalMigrados === profesores.length) {
      console.log('✅ Migración exitosa - Todos los registros migrados');
    } else {
      console.log('❌ Error en migración - Cantidad de registros no coincide');
    }

    // 5. Mostrar datos migrados
    console.log('\n📋 Datos migrados:');
    const datosMigrados = await prismaPostgres.$queryRaw`SELECT * FROM profesor ORDER BY id`;
    
    datosMigrados.forEach(profesor => {
      console.log(`\nID: ${profesor.id}`);
      console.log(`  RUT: ${profesor.rut}`);
      console.log(`  Nombre: ${profesor.nombre}`);
      console.log(`  Email: ${profesor.email || 'N/A'}`);
      console.log(`  Teléfono: ${profesor.telefono || 'N/A'}`);
      console.log(`  Fecha Nacimiento: ${profesor.fechaNacimiento || 'N/A'}`);
      console.log(`  Created At: ${profesor.createdAt}`);
      console.log(`  Updated At: ${profesor.updatedAt}`);
      console.log('  ---');
    });

    console.log('\n✅ Migración de tabla profesor completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prismaPostgres.$disconnect();
    db.close();
  }
}

migrarProfesor(); 