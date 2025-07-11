// Tests para la API de Niveles - Metodología establecida
const { NextRequest } = require('next/server');

// Mock de Prisma
const mockPrisma = {
  nivel: {
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
  json: jest.fn((data) => ({ json: () => data })),
};

describe('API Niveles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const nivelData = {
    nombre: 'Primero Básico',
  };

  const nivelResponse = {
    id: 1,
    nombre: nivelData.nombre,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('GET /api/niveles', () => {
    it('debería retornar lista de niveles', async () => {
      const { GET } = require('../../src/app/api/niveles/route');
      
      mockPrisma.nivel.findMany.mockResolvedValue([nivelResponse]);

      const request = new NextRequest('http://localhost:3000/api/niveles');
      const response = await GET(request);

      expect(mockPrisma.nivel.findMany).toHaveBeenCalledWith({
        orderBy: { nombre: 'asc' },
      });
      expect(response.json()).toEqual([nivelResponse]);
    });
  });

  describe('POST /api/niveles', () => {
    it('debería crear un nivel exitosamente', async () => {
      const { POST } = require('../../src/app/api/niveles/route');
      
      mockPrisma.nivel.create.mockResolvedValue(nivelResponse);

      const request = new NextRequest('http://localhost:3000/api/niveles', {
        method: 'POST',
        body: JSON.stringify(nivelData),
      });

      const response = await POST(request);

      expect(mockPrisma.nivel.create).toHaveBeenCalledWith({
        data: nivelData,
      });
      expect(response.json()).toEqual(nivelResponse);
    });

    it('debería validar datos requeridos', async () => {
      const { POST } = require('../../src/app/api/niveles/route');
      
      const invalidData = { nombre: '' };
      const request = new NextRequest('http://localhost:3000/api/niveles', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('El nombre es requerido');
      expect(result.status).toBe(400);
    });

    it('debería validar nombre con espacios en blanco', async () => {
      const { POST } = require('../../src/app/api/niveles/route');
      
      const invalidData = { nombre: '   ' };
      const request = new NextRequest('http://localhost:3000/api/niveles', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('El nombre no puede estar vacío');
      expect(result.status).toBe(400);
    });

    it('debería validar longitud del nombre', async () => {
      const { POST } = require('../../src/app/api/niveles/route');
      
      const longNombre = 'A'.repeat(101);
      const invalidData = { nombre: longNombre };
      const request = new NextRequest('http://localhost:3000/api/niveles', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(result.error).toBe('El nombre no puede exceder 100 caracteres');
      expect(result.status).toBe(400);
    });
  });
}); 