// Tests para la API de Horarios - Metodología establecida
const { NextRequest } = require('next/server');

// Mock de Prisma
const mockPrisma = {
  horario: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  profesor: {
    findUnique: jest.fn(),
  },
  asignatura: {
    findUnique: jest.fn(),
  },
  nivel: {
    findUnique: jest.fn(),
  },
  moduloHorario: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  moduloHorarioProfesor: {
    create: jest.fn(),
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
  json: jest.fn(data => ({ json: () => data })),
};

describe('API Horarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const horarioData = {
    nombre: 'Horario Matemáticas 4°A',
    docenteId: 1,
    asignaturaId: 1,
    nivelId: 1,
    modulos: [
      {
        dia: 'Lunes',
        horaInicio: '08:00',
        duracion: 60,
      },
    ],
  };

  const horarioResponse = {
    id: 1,
    nombre: horarioData.nombre,
    docenteId: horarioData.docenteId,
    asignaturaId: horarioData.asignaturaId,
    nivelId: horarioData.nivelId,
    createdAt: '2025-07-11T03:47:38.538Z',
    updatedAt: '2025-07-11T03:47:38.538Z',
    asignatura: { id: 1, nombre: 'Matemáticas' },
    nivel: { id: 1, nombre: '4° Básico' },
    profesor: { id: 1, nombre: 'Juan Pérez' },
    modulos: [
      {
        id: 1,
        dia: 'Lunes',
        horaInicio: '08:00',
        duracion: 60,
        orden: 1,
        profesores: [
          {
            id: 1,
            profesor: { id: 1, nombre: 'Juan Pérez' },
            rol: 'titular',
          },
        ],
      },
    ],
  };

  describe('GET /api/horarios', () => {
    it('debería retornar lista de horarios', async () => {
      const { GET } = require('../../src/app/api/horarios/route');

      mockPrisma.horario.findMany.mockResolvedValue([horarioResponse]);

      const request = new NextRequest('http://localhost:3000/api/horarios');
      const response = await GET(request);

      expect(mockPrisma.horario.findMany).toHaveBeenCalledWith({
        include: {
          asignatura: true,
          nivel: true,
          profesor: true,
          modulos: {
            include: {
              profesores: {
                include: {
                  profesor: true,
                },
              },
            },
            orderBy: {
              orden: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(await response.json()).toEqual({
        data: [horarioResponse],
        message: 'Horarios obtenidos correctamente',
      });
    });
  });

  describe('POST /api/horarios', () => {
    it('debería crear un horario exitosamente', async () => {
      const { POST } = require('../../src/app/api/horarios/route');

      mockPrisma.profesor.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Juan Pérez',
      });
      mockPrisma.asignatura.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Matemáticas',
      });
      mockPrisma.nivel.findUnique.mockResolvedValue({
        id: 1,
        nombre: '4° Básico',
      });
      mockPrisma.$transaction.mockResolvedValue(horarioResponse);

      const request = new NextRequest('http://localhost:3000/api/horarios', {
        method: 'POST',
        body: JSON.stringify(horarioData),
      });

      const response = await POST(request);

      expect(mockPrisma.profesor.findUnique).toHaveBeenCalledWith({
        where: { id: parseInt(horarioData.docenteId.toString()) },
      });
      expect(mockPrisma.asignatura.findUnique).toHaveBeenCalledWith({
        where: { id: parseInt(horarioData.asignaturaId.toString()) },
      });
      expect(mockPrisma.nivel.findUnique).toHaveBeenCalledWith({
        where: { id: parseInt(horarioData.nivelId.toString()) },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(await response.json()).toEqual({
        data: horarioResponse,
        message: 'Horario creado correctamente',
      });
    });

    it('debería validar datos requeridos', async () => {
      const { POST } = require('../../src/app/api/horarios/route');

      const invalidData = { nombre: '', docenteId: '' };
      const request = new NextRequest('http://localhost:3000/api/horarios', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe(
        'Nombre, docente, asignatura y nivel son obligatorios'
      );
      expect(response.status).toBe(400);
    });

    it('debería validar que existan módulos', async () => {
      const { POST } = require('../../src/app/api/horarios/route');

      const invalidData = { ...horarioData, modulos: [] };
      const request = new NextRequest('http://localhost:3000/api/horarios', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('Debe incluir al menos un módulo');
      expect(response.status).toBe(400);
    });

    it('debería validar que el docente existe', async () => {
      const { POST } = require('../../src/app/api/horarios/route');

      mockPrisma.profesor.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/horarios', {
        method: 'POST',
        body: JSON.stringify(horarioData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('El docente especificado no existe');
      expect(response.status).toBe(400);
    });

    it('debería validar que la asignatura existe', async () => {
      const { POST } = require('../../src/app/api/horarios/route');

      mockPrisma.profesor.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Juan Pérez',
      });
      mockPrisma.asignatura.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/horarios', {
        method: 'POST',
        body: JSON.stringify(horarioData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('La asignatura especificada no existe');
      expect(response.status).toBe(400);
    });

    it('debería validar que el nivel existe', async () => {
      const { POST } = require('../../src/app/api/horarios/route');

      mockPrisma.profesor.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Juan Pérez',
      });
      mockPrisma.asignatura.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Matemáticas',
      });
      mockPrisma.nivel.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/horarios', {
        method: 'POST',
        body: JSON.stringify(horarioData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('El nivel especificado no existe');
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/horarios/[id]', () => {
    it('debería retornar un horario específico', async () => {
      const { GET } = require('../../src/app/api/horarios/[id]/route');

      mockPrisma.horario.findUnique.mockResolvedValue(horarioResponse);

      const request = new NextRequest('http://localhost:3000/api/horarios/1');
      const response = await GET(request, { params: { id: '1' } });

      expect(mockPrisma.horario.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          asignatura: true,
          nivel: true,
          profesor: true,
          modulos: {
            include: {
              profesores: {
                include: {
                  profesor: true,
                },
              },
            },
            orderBy: {
              orden: 'asc',
            },
          },
        },
      });
      expect(await response.json()).toEqual({
        data: horarioResponse,
        message: 'Horario obtenido correctamente',
      });
    });

    it('debería retornar 404 si el horario no existe', async () => {
      const { GET } = require('../../src/app/api/horarios/[id]/route');

      mockPrisma.horario.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/horarios/999');
      const response = await GET(request, { params: { id: '999' } });
      const result = await response.json();

      expect(result.error).toBe('Horario no encontrado');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/horarios/[id]', () => {
    it('debería actualizar un horario exitosamente', async () => {
      const { PUT } = require('../../src/app/api/horarios/[id]/route');

      const updateData = { ...horarioData, nombre: 'Horario Actualizado' };
      const updatedHorario = {
        ...horarioResponse,
        nombre: 'Horario Actualizado',
      };

      mockPrisma.horario.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.profesor.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Juan Pérez',
      });
      mockPrisma.asignatura.findUnique.mockResolvedValue({
        id: 1,
        nombre: 'Matemáticas',
      });
      mockPrisma.nivel.findUnique.mockResolvedValue({
        id: 1,
        nombre: '4° Básico',
      });
      mockPrisma.$transaction.mockResolvedValue(updatedHorario);

      const request = new NextRequest('http://localhost:3000/api/horarios/1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: '1' } });

      expect(mockPrisma.horario.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(await response.json()).toEqual({
        data: updatedHorario,
        message: 'Horario actualizado correctamente',
      });
    });

    it('debería validar que el horario existe', async () => {
      const { PUT } = require('../../src/app/api/horarios/[id]/route');

      mockPrisma.horario.findUnique.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/horarios/999',
        {
          method: 'PUT',
          body: JSON.stringify(horarioData),
        }
      );

      const response = await PUT(request, { params: { id: '999' } });
      const result = await response.json();

      expect(result.error).toBe('Horario no encontrado');
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/horarios/[id]', () => {
    it('debería eliminar un horario exitosamente', async () => {
      const { DELETE } = require('../../src/app/api/horarios/[id]/route');

      mockPrisma.horario.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.$transaction.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/horarios/1');
      const response = await DELETE(request, { params: { id: '1' } });

      expect(mockPrisma.horario.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(await response.json()).toEqual({
        message: 'Horario eliminado correctamente',
      });
    });

    it('debería validar que el horario existe', async () => {
      const { DELETE } = require('../../src/app/api/horarios/[id]/route');

      mockPrisma.horario.findUnique.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/horarios/999');
      const response = await DELETE(request, { params: { id: '999' } });
      const result = await response.json();

      expect(result.error).toBe('Horario no encontrado');
      expect(response.status).toBe(404);
    });
  });
});
