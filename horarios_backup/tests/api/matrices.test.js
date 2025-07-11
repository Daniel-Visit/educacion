const { NextRequest, NextResponse } = require('next/server');

// Mock de Prisma
const mockPrisma = {
  matrizEspecificacion: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  matrizOA: {
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  indicador: {
    deleteMany: jest.fn(),
  },
  oa: {
    findUnique: jest.fn(),
  },
  nivel: {
    findUnique: jest.fn(),
  },
  asignatura: {
    findUnique: jest.fn(),
  },
};

// Mock de @prisma/client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

// Mock de NextResponse
global.NextResponse = {
  json: jest.fn((data, options) => ({
    json: () => Promise.resolve(data),
    status: options?.status || 200,
  })),
};

// Mock de NextRequest
global.NextRequest = class {
  constructor(url = 'http://localhost:3000/api/matrices') {
    this._url = url;
  }
  
  get url() {
    return this._url;
  }
  
  json() {
    return Promise.resolve(this._body || {});
  }
};

// Importar las funciones después de los mocks
const { GET, POST } = require('../../src/app/api/matrices/route');
const { GET: GET_BY_ID, PUT, DELETE } = require('../../src/app/api/matrices/[id]/route');

describe('Matrices API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/matrices', () => {
    it('should return all matrices with OAs and details', async () => {
      const mockMatrices = [
        {
          id: 1,
          nombre: 'Matriz de Matemáticas',
          total_preguntas: 20,
          createdAt: '2024-01-01T00:00:00Z',
          oas: [
            {
              id: 1,
              oaId: 1,
              indicadores: [
                { id: 1, descripcion: 'Indicador 1', preguntas: 10 }
              ]
            }
          ]
        }
      ];

      const mockOA = {
        id: 1,
        nivel_id: 1,
        asignatura_id: 1,
        eje_id: 1,
        eje_descripcion: 'Números',
        oas_id: 'OA1',
        descripcion_oas: 'Descripción OA',
        basal: true,
        minimo_clases: 5
      };

      const mockNivel = { id: 1, nombre: '2° Básico' };
      const mockAsignatura = { id: 1, nombre: 'Matemáticas' };

      mockPrisma.matrizEspecificacion.findMany.mockResolvedValue(mockMatrices);
      mockPrisma.oa.findUnique.mockResolvedValue(mockOA);
      mockPrisma.nivel.findUnique.mockResolvedValue(mockNivel);
      mockPrisma.asignatura.findUnique.mockResolvedValue(mockAsignatura);

      const request = new NextRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(mockPrisma.matrizEspecificacion.findMany).toHaveBeenCalledWith({
        include: {
          oas: {
            include: {
              indicadores: true,
            },
          },
        },
      });

      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(1);
      expect(data[0].nombre).toBe('Matriz de Matemáticas');
      expect(data[0].oas).toHaveLength(1);
      expect(data[0].oas[0].oa).toBeDefined();
      expect(data[0].oas[0].oa.nivel).toBeDefined();
      expect(data[0].oas[0].oa.asignatura).toBeDefined();
    });

    it('should handle database errors', async () => {
      mockPrisma.matrizEspecificacion.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(data.error).toBe('Database error');
      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/matrices', () => {
    it('should create a new matrix with OAs and indicators', async () => {
      const requestData = {
        nombre: 'Nueva Matriz',
        total_preguntas: 15,
        oas: [
          {
            oaId: 1,
            indicadores: [
              { descripcion: 'Indicador 1', preguntas: 8 },
              { descripcion: 'Indicador 2', preguntas: 7 }
            ]
          }
        ]
      };

      const mockCreatedMatrix = {
        id: 1,
        nombre: 'Nueva Matriz',
        total_preguntas: 15,
        createdAt: '2024-01-01T00:00:00Z',
        oas: [
          {
            id: 1,
            oaId: 1,
            indicadores: [
              { id: 1, descripcion: 'Indicador 1', preguntas: 8 },
              { id: 2, descripcion: 'Indicador 2', preguntas: 7 }
            ]
          }
        ]
      };

      mockPrisma.matrizEspecificacion.create.mockResolvedValue(mockCreatedMatrix);

      const request = new NextRequest();
      request._body = requestData;
      
      const response = await POST(request);
      const data = await response.json();

      expect(mockPrisma.matrizEspecificacion.create).toHaveBeenCalledWith({
        data: {
          nombre: 'Nueva Matriz',
          total_preguntas: 15,
          oas: {
            create: [
              {
                oaId: 1,
                indicadores: {
                  create: [
                    { descripcion: 'Indicador 1', preguntas: 8 },
                    { descripcion: 'Indicador 2', preguntas: 7 }
                  ]
                }
              }
            ]
          }
        },
        include: {
          oas: {
            include: {
              indicadores: true,
            },
          },
        },
      });

      expect(data).toEqual(mockCreatedMatrix);
      expect(response.status).toBe(201);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        nombre: '',
        total_preguntas: 0,
        oas: []
      };

      const request = new NextRequest();
      request._body = invalidData;
      
      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toBe('Datos incompletos o inválidos');
      expect(response.status).toBe(400);
    });

    it('should validate OAs array', async () => {
      const invalidData = {
        nombre: 'Matriz',
        total_preguntas: 10,
        oas: 'not an array'
      };

      const request = new NextRequest();
      request._body = invalidData;
      
      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toBe('Datos incompletos o inválidos');
      expect(response.status).toBe(400);
    });

    it('should handle database errors during creation', async () => {
      const requestData = {
        nombre: 'Matriz',
        total_preguntas: 10,
        oas: [{ oaId: 1, indicadores: [] }]
      };

      mockPrisma.matrizEspecificacion.create.mockRejectedValue(new Error('Creation failed'));

      const request = new NextRequest();
      request._body = requestData;
      
      const response = await POST(request);
      const data = await response.json();

      expect(data.error).toBe('Creation failed');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/matrices/[id]', () => {
    it('should return a specific matrix by ID', async () => {
      const mockMatrix = {
        id: 1,
        nombre: 'Matriz Específica',
        total_preguntas: 20,
        createdAt: '2024-01-01T00:00:00Z',
        oas: [
          {
            id: 1,
            oaId: 1,
            indicadores: [
              { id: 1, descripcion: 'Indicador 1', preguntas: 10 }
            ]
          }
        ]
      };

      const mockOA = {
        id: 1,
        nivel_id: 1,
        asignatura_id: 1,
        eje_id: 1,
        eje_descripcion: 'Números',
        oas_id: 'OA1',
        descripcion_oas: 'Descripción OA',
        basal: true,
        minimo_clases: 5
      };

      const mockNivel = { id: 1, nombre: '2° Básico' };
      const mockAsignatura = { id: 1, nombre: 'Matemáticas' };

      mockPrisma.matrizEspecificacion.findUnique.mockResolvedValue(mockMatrix);
      mockPrisma.oa.findUnique.mockResolvedValue(mockOA);
      mockPrisma.nivel.findUnique.mockResolvedValue(mockNivel);
      mockPrisma.asignatura.findUnique.mockResolvedValue(mockAsignatura);

      const request = new NextRequest();
      const params = Promise.resolve({ id: '1' });
      
      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(mockPrisma.matrizEspecificacion.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          oas: {
            include: {
              indicadores: true,
            },
          },
        },
      });

      expect(data.id).toBe(1);
      expect(data.nombre).toBe('Matriz Específica');
      expect(data.oas).toHaveLength(1);
    });

    it('should handle invalid ID', async () => {
      const request = new NextRequest();
      const params = Promise.resolve({ id: 'invalid' });
      
      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(data.error).toBe('ID inválido');
      expect(response.status).toBe(400);
    });

    it('should handle matrix not found', async () => {
      mockPrisma.matrizEspecificacion.findUnique.mockResolvedValue(null);

      const request = new NextRequest();
      const params = Promise.resolve({ id: '999' });
      
      const response = await GET_BY_ID(request, { params });
      const data = await response.json();

      expect(data.error).toBe('Matriz no encontrada');
      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/matrices/[id]', () => {
    it('should update an existing matrix', async () => {
      const requestData = {
        nombre: 'Matriz Actualizada',
        total_preguntas: 25,
        oas: [
          {
            oaId: 1,
            indicadores: [
              { descripcion: 'Nuevo Indicador', preguntas: 15 }
            ]
          }
        ]
      };

      const mockMatrizOAs = [{ id: 1 }, { id: 2 }];
      const mockUpdatedMatrix = {
        id: 1,
        nombre: 'Matriz Actualizada',
        total_preguntas: 25,
        oas: [
          {
            id: 1,
            oaId: 1,
            indicadores: [
              { id: 1, descripcion: 'Nuevo Indicador', preguntas: 15 }
            ]
          }
        ]
      };

      mockPrisma.matrizOA.findMany.mockResolvedValue(mockMatrizOAs);
      mockPrisma.matrizEspecificacion.update.mockResolvedValue(mockUpdatedMatrix);

      const request = new NextRequest();
      request._body = requestData;
      const params = Promise.resolve({ id: '1' });
      
      const response = await PUT(request, { params });
      const data = await response.json();

      expect(mockPrisma.matrizOA.findMany).toHaveBeenCalledWith({ where: { matrizId: 1 } });
      expect(mockPrisma.indicador.deleteMany).toHaveBeenCalledWith({ 
        where: { matrizOAId: { in: [1, 2] } } 
      });
      expect(mockPrisma.matrizOA.deleteMany).toHaveBeenCalledWith({ where: { matrizId: 1 } });
      expect(mockPrisma.matrizEspecificacion.update).toHaveBeenCalled();

      expect(data).toEqual(mockUpdatedMatrix);
    });

    it('should validate required fields for update', async () => {
      const invalidData = {
        nombre: '',
        total_preguntas: 0,
        oas: []
      };

      const request = new NextRequest();
      request._body = invalidData;
      const params = Promise.resolve({ id: '1' });
      
      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data.error).toBe('Datos incompletos o inválidos');
      expect(response.status).toBe(400);
    });

    it('should handle invalid ID for update', async () => {
      const requestData = {
        nombre: 'Matriz',
        total_preguntas: 10,
        oas: [{ oaId: 1, indicadores: [] }]
      };

      const request = new NextRequest();
      request._body = requestData;
      const params = Promise.resolve({ id: 'invalid' });
      
      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data.error).toBe('ID inválido');
      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/matrices/[id]', () => {
    it('should delete a matrix and all related data', async () => {
      const mockMatrizOAs = [{ id: 1 }, { id: 2 }];

      mockPrisma.matrizOA.findMany.mockResolvedValue(mockMatrizOAs);

      const request = new NextRequest();
      const params = Promise.resolve({ id: '1' });
      
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(mockPrisma.matrizOA.findMany).toHaveBeenCalledWith({ where: { matrizId: 1 } });
      expect(mockPrisma.indicador.deleteMany).toHaveBeenCalledWith({ 
        where: { matrizOAId: { in: [1, 2] } } 
      });
      expect(mockPrisma.matrizOA.deleteMany).toHaveBeenCalledWith({ where: { matrizId: 1 } });
      expect(mockPrisma.matrizEspecificacion.delete).toHaveBeenCalledWith({ where: { id: 1 } });

      expect(data.message).toBe('Matriz eliminada correctamente');
    });

    it('should handle invalid ID for deletion', async () => {
      const request = new NextRequest();
      const params = Promise.resolve({ id: 'invalid' });
      
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(data.error).toBe('ID inválido');
      expect(response.status).toBe(400);
    });

    it('should handle database errors during deletion', async () => {
      mockPrisma.matrizOA.findMany.mockRejectedValue(new Error('Deletion failed'));

      const request = new NextRequest();
      const params = Promise.resolve({ id: '1' });
      
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(data.error).toBe('Error interno del servidor');
      expect(response.status).toBe(500);
    });
  });
}); 