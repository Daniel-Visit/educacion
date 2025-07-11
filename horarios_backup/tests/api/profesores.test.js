// Enfoque: Lógica de Prisma con mocks
const { NextRequest } = require('next/server');

// Mock de Prisma
const mockPrisma = {
  profesor: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  profesorAsignatura: {
    deleteMany: jest.fn(),
  },
  profesorNivel: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock del módulo prisma
jest.mock('../../src/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock de NextResponse
global.NextResponse = {
  json: jest.fn((data) => ({ json: () => data })),
};

describe('API Profesores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const profesorData = {
    rut: '12345678-9',
    nombre: 'Juan Pérez',
    asignaturas: [1, 2],
    niveles: [1],
  };

  const profesorResponse = {
    id: 1,
    rut: profesorData.rut,
    nombre: profesorData.nombre,
    createdAt: new Date(),
    updatedAt: new Date(),
    asignaturas: [
      { id: 1, asignaturaId: 1, asignatura: { id: 1, nombre: 'Matemáticas' } },
      { id: 2, asignaturaId: 2, asignatura: { id: 2, nombre: 'Lenguaje' } },
    ],
    niveles: [
      { id: 1, nivelId: 1, nivel: { id: 1, nombre: 'Primero Básico' } },
    ],
  };

  const profesorResponse2 = {
    id: 2,
    rut: '87654321-0',
    nombre: 'María García',
    createdAt: new Date(),
    updatedAt: new Date(),
    asignaturas: [],
    niveles: [],
  };

  describe('GET /api/profesores', () => {
    it('debería retornar lista de profesores', async () => {
      const { GET } = require('../../src/app/api/profesores/route');
      
      mockPrisma.profesor.findMany.mockResolvedValue([profesorResponse, profesorResponse2]);

      const request = new NextRequest('http://localhost:3000/api/profesores');
      const response = await GET(request);

      expect(mockPrisma.profesor.findMany).toHaveBeenCalledWith({
        include: { asignatura: true },
      });
      expect(mockPrisma.profesor.findMany).toHaveBeenCalledWith({
        include: { nivel: true },
      });
      expect(response.json()).toEqual([profesorResponse, profesorResponse2]);
    });
  });

  describe('POST /api/profesores', () => {
    it('debería crear un profesor exitosamente', async () => {
      const { POST } = require('../../src/app/api/profesores/route');
      
      mockPrisma.profesor.findFirst.mockResolvedValue(null);
      mockPrisma.profesor.create.mockResolvedValue(profesorResponse);

      const request = new NextRequest('http://localhost:3000/api/profesores', {
        method: 'POST',
        body: JSON.stringify(profesorData),
      });

      const response = await POST(request);

      expect(mockPrisma.profesor.findFirst).toHaveBeenCalledWith({
        where: { rut: profesorData.rut },
      });
      expect(mockPrisma.profesor.create).toHaveBeenCalledWith({
        data: profesorData,
      });
      expect(mockPrisma.profesor.create).toHaveBeenCalledWith({
        include: { asignatura: true },
      });
      expect(mockPrisma.profesor.create).toHaveBeenCalledWith({
        include: { nivel: true },
      });
      expect(response.json()).toEqual(profesorResponse);
    });

    it('debería validar datos requeridos', async () => {
      const { POST } = require('../../src/app/api/profesores/route');
      
      const invalidData = { rut: '', nombre: '' };
      const request = new NextRequest('http://localhost:3000/api/profesores', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('RUT y nombre son requeridos');
      expect(result.status).toBe(400);
    });

    it('debería validar formato de RUT', async () => {
      const { POST } = require('../../src/app/api/profesores/route');
      
      const invalidData = { ...profesorData, rut: 'invalid-rut' };
      const request = new NextRequest('http://localhost:3000/api/profesores', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('Formato de RUT inválido');
      expect(result.status).toBe(400);
    });

    it('debería validar RUT único', async () => {
      const { POST } = require('../../src/app/api/profesores/route');
      
      mockPrisma.profesor.findFirst.mockResolvedValue({ id: 1, rut: profesorData.rut });

      const request = new NextRequest('http://localhost:3000/api/profesores', {
        method: 'POST',
        body: JSON.stringify(profesorData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('El RUT ya está registrado');
      expect(result.status).toBe(400);
    });
  });

  describe('PUT /api/profesores/[id]', () => {
    it('debería actualizar un profesor exitosamente', async () => {
      const { PUT } = require('../../src/app/api/profesores/[id]/route');
      
      const updateData = { ...profesorData, nombre: 'Juan Pérez Actualizado' };
      const updatedProfesor = { ...profesorResponse, ...updateData };

      mockPrisma.profesor.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.profesor.findFirst.mockResolvedValue(null);
      mockPrisma.profesor.update.mockResolvedValue(updatedProfesor);

      const request = new NextRequest('http://localhost:3000/api/profesores/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: '1' } });

      expect(mockPrisma.profesor.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.profesor.findFirst).toHaveBeenCalledWith({
        where: { rut: updateData.rut, id: { not: 1 } },
      });
      expect(mockPrisma.profesor.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
      expect(mockPrisma.profesor.update).toHaveBeenCalledWith({
        include: { asignatura: true },
      });
      expect(mockPrisma.profesor.update).toHaveBeenCalledWith({
        include: { nivel: true },
      });
      expect(response.json()).toEqual(updatedProfesor);
    });

    it('debería validar que el profesor existe', async () => {
      const { PUT } = require('../../src/app/api/profesores/[id]/route');
      
      mockPrisma.profesor.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/profesores/999', {
        method: 'PUT',
        body: JSON.stringify(profesorData),
      });

      const response = await PUT(request, { params: { id: '999' } });
      const result = await response.json();

      expect(result.error).toBe('Profesor no encontrado');
      expect(result.status).toBe(404);
    });

    it('debería validar RUT único en actualización', async () => {
      const { PUT } = require('../../src/app/api/profesores/[id]/route');
      
      mockPrisma.profesor.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.profesor.findFirst.mockResolvedValue({ id: 2, rut: profesorData.rut });

      const request = new NextRequest('http://localhost:3000/api/profesores/1', {
        method: 'PUT',
        body: JSON.stringify(profesorData),
      });

      const response = await PUT(request, { params: { id: '1' } });
      const result = await response.json();

      expect(result.error).toBe('El RUT ya está registrado por otro profesor');
      expect(result.status).toBe(400);
    });
  });

  describe('DELETE /api/profesores/[id]', () => {
    it('debería eliminar un profesor exitosamente', async () => {
      const { DELETE } = require('../../src/app/api/profesores/[id]/route');
      
      const profesorConRelaciones = {
        id: 1,
        horario: [{ id: 1 }],
        modulos: [],
      };

      mockPrisma.profesor.findUnique.mockResolvedValue(profesorConRelaciones);
      mockPrisma.profesor.delete.mockResolvedValue({ id: 1 });

      const request = new NextRequest('http://localhost:3000/api/profesores/1');
      const response = await DELETE(request, { params: { id: '1' } });

      expect(mockPrisma.profesor.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { horario: true, modulos: true },
      });
      expect(mockPrisma.profesor.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(response.json()).toEqual({ id: 1 });
    });

    it('debería validar que el profesor existe', async () => {
      const { DELETE } = require('../../src/app/api/profesores/[id]/route');
      
      mockPrisma.profesor.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/profesores/999');
      const response = await DELETE(request, { params: { id: '999' } });
      const result = await response.json();

      expect(result.error).toBe('Profesor no encontrado');
      expect(result.status).toBe(404);
    });

    it('debería validar que no tenga horarios asignados', async () => {
      const { DELETE } = require('../../src/app/api/profesores/[id]/route');
      
      const profesorConHorarios = {
        id: 1,
        horario: [{ id: 1 }],
        modulos: [],
      };

      mockPrisma.profesor.findUnique.mockResolvedValue(profesorConHorarios);

      const request = new NextRequest('http://localhost:3000/api/profesores/1');
      const response = await DELETE(request, { params: { id: '1' } });
      const result = await response.json();

      expect(result.error).toBe('No se puede eliminar un profesor con horarios asignados');
      expect(result.status).toBe(400);
    });

    it('debería validar que no tenga módulos asignados', async () => {
      const { DELETE } = require('../../src/app/api/profesores/[id]/route');
      
      const profesorConModulos = {
        id: 1,
        horario: [],
        modulos: [{ id: 1 }],
      };

      mockPrisma.profesor.findUnique.mockResolvedValue(profesorConModulos);

      const request = new NextRequest('http://localhost:3000/api/profesores/1');
      const response = await DELETE(request, { params: { id: '1' } });
      const result = await response.json();

      expect(result.error).toBe('No se puede eliminar un profesor con módulos asignados');
      expect(result.status).toBe(400);
    });
  });

  describe('GET /api/profesores/[id]', () => {
    it('debería retornar un profesor específico', async () => {
      const { GET } = require('../../src/app/api/profesores/[id]/route');
      
      mockPrisma.profesor.findUnique.mockResolvedValue(profesorResponse);

      const request = new NextRequest('http://localhost:3000/api/profesores/1');
      const response = await GET(request, { params: { id: '1' } });

      expect(mockPrisma.profesor.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { asignatura: true },
      });
      expect(mockPrisma.profesor.findUnique).toHaveBeenCalledWith({
        include: { nivel: true },
      });
      expect(response.json()).toEqual(profesorResponse);
    });

    it('debería retornar 404 si el profesor no existe', async () => {
      const { GET } = require('../../src/app/api/profesores/[id]/route');
      
      mockPrisma.profesor.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/profesores/999');
      const response = await GET(request, { params: { id: '999' } });
      const result = await response.json();

      expect(result.error).toBe('Profesor no encontrado');
      expect(result.status).toBe(404);
    });
  });

  describe('Validaciones de relaciones', () => {
    it('debería manejar transacciones para crear profesor con asignaturas y niveles', async () => {
      const { POST } = require('../../src/app/api/profesores/route');
      
      mockPrisma.profesor.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue(profesorResponse);

      const request = new NextRequest('http://localhost:3000/api/profesores', {
        method: 'POST',
        body: JSON.stringify(profesorData),
      });

      await POST(request);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('debería manejar transacciones para actualizar profesor con asignaturas y niveles', async () => {
      const { PUT } = require('../../src/app/api/profesores/[id]/route');
      
      const updateData = { ...profesorData, nombre: 'Actualizado' };
      const updatedProfesor = {
        id: 1,
        rut: updateData.rut,
        nombre: updateData.nombre,
        asignaturas: [
          { id: 1, asignaturaId: 1, asignatura: { id: 1, nombre: 'Matemáticas' } },
          { id: 2, asignaturaId: 2, asignatura: { id: 2, nombre: 'Lenguaje' } },
        ],
        niveles: [
          { id: 1, nivelId: 1, nivel: { id: 1, nombre: 'Primero Básico' } },
        ],
      };

      mockPrisma.profesor.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.profesor.findFirst.mockResolvedValue(null);
      mockPrisma.profesorAsignatura.deleteMany.mockResolvedValue({ count: 2 });
      mockPrisma.profesorNivel.deleteMany.mockResolvedValue({ count: 1 });
      mockPrisma.$transaction.mockResolvedValue(updatedProfesor);

      const request = new NextRequest('http://localhost:3000/api/profesores/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      await PUT(request, { params: { id: '1' } });

      expect(mockPrisma.profesorAsignatura.deleteMany).toHaveBeenCalledWith({
        where: { profesorId: 1 },
      });
      expect(mockPrisma.profesorNivel.deleteMany).toHaveBeenCalledWith({
        where: { profesorId: 1 },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
}); 