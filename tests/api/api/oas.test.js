// Tests para la API de OAs - Metodología establecida
const { NextRequest } = require('next/server');

// Mock de Prisma
const mockPrisma = {
  oa: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

// Mock del módulo prisma
jest.mock('../../src/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock de NextResponse
global.NextResponse = {
  json: jest.fn(data => ({ json: () => data })),
};

describe('API OAs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const oaData = {
    codigo: 'OA01',
    descripcion: 'Descripción del OA',
    ejeId: 1,
    nivelId: 1,
    asignaturaId: 1,
  };

  const oaResponse = {
    id: 1,
    codigo: oaData.codigo,
    descripcion: oaData.descripcion,
    ejeId: oaData.ejeId,
    nivelId: oaData.nivelId,
    asignaturaId: oaData.asignaturaId,
    createdAt: new Date(),
    updatedAt: new Date(),
    eje: { id: 1, nombre: 'Eje 1' },
    nivel: { id: 1, nombre: 'Primero Básico' },
    asignatura: { id: 1, nombre: 'Matemáticas' },
  };

  describe('GET /api/oas', () => {
    it('debería retornar lista de OAs', async () => {
      const { GET } = require('../../src/app/api/oas/route');

      mockPrisma.oa.findMany.mockResolvedValue([oaResponse]);

      const request = new NextRequest('http://localhost:3000/api/oas');
      const response = await GET(request);

      expect(mockPrisma.oa.findMany).toHaveBeenCalledWith({
        include: {
          eje: true,
          nivel: true,
          asignatura: true,
        },
        orderBy: { codigo: 'asc' },
      });
      expect(response.json()).toEqual([oaResponse]);
    });
  });

  describe('POST /api/oas', () => {
    it('debería crear un OA exitosamente', async () => {
      const { POST } = require('../../src/app/api/oas/route');

      mockPrisma.oa.create.mockResolvedValue(oaResponse);

      const request = new NextRequest('http://localhost:3000/api/oas', {
        method: 'POST',
        body: JSON.stringify(oaData),
      });

      const response = await POST(request);

      expect(mockPrisma.oa.create).toHaveBeenCalledWith({
        data: oaData,
        include: {
          eje: true,
          nivel: true,
          asignatura: true,
        },
      });
      expect(response.json()).toEqual(oaResponse);
    });

    it('debería validar datos requeridos', async () => {
      const { POST } = require('../../src/app/api/oas/route');

      const invalidData = { codigo: '', descripcion: '' };
      const request = new NextRequest('http://localhost:3000/api/oas', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('Código y descripción son requeridos');
      expect(result.status).toBe(400);
    });

    it('debería validar longitud del código', async () => {
      const { POST } = require('../../src/app/api/oas/route');

      const invalidData = { ...oaData, codigo: 'A'.repeat(51) };
      const request = new NextRequest('http://localhost:3000/api/oas', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('El código no puede exceder 50 caracteres');
      expect(result.status).toBe(400);
    });

    it('debería validar longitud de la descripción', async () => {
      const { POST } = require('../../src/app/api/oas/route');

      const invalidData = { ...oaData, descripcion: 'A'.repeat(1001) };
      const request = new NextRequest('http://localhost:3000/api/oas', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe(
        'La descripción no puede exceder 1000 caracteres'
      );
      expect(result.status).toBe(400);
    });
  });
});
