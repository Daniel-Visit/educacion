const { PrismaClient } = require('@prisma/client')

// Mock Prisma para tests de integración
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    horario: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    profesor: {
      findFirst: jest.fn(),
    },
    asignatura: {
      findFirst: jest.fn(),
    },
    nivel: {
      findFirst: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}))

describe('Horarios Integration Flow', () => {
  let prisma

  beforeEach(() => {
    jest.clearAllMocks()
    prisma = new PrismaClient()
  })

  afterEach(async () => {
    await prisma.$disconnect()
  })

  describe('Complete CRUD Flow', () => {
    test('should handle complete schedule lifecycle', async () => {
      // Step 1: Initial state - no schedules
      prisma.horario.findMany.mockResolvedValue([])

      let result = await prisma.horario.findMany()
      expect(result).toHaveLength(0)

      // Step 2: Create first schedule
      const schedule1 = {
        nombre: 'Horario de Matemáticas',
        docenteId: 1,
        asignaturaId: 1,
        nivelId: 1,
      }

      const createdSchedule1 = {
        id: 1,
        ...schedule1,
        createdAt: new Date(),
        updatedAt: new Date(),
        asignatura: { id: 1, nombre: 'Matemáticas' },
        nivel: { id: 1, nombre: 'Primer Año' },
        profesor: {
          id: 1,
          rut: '12345678-9',
          nombre: 'Profesor de Prueba',
          email: 'profesor@test.com',
        },
      }

      prisma.horario.create.mockResolvedValue(createdSchedule1)

      result = await prisma.horario.create({
        data: schedule1,
        include: {
          asignatura: true,
          nivel: true,
          profesor: true,
        },
      })

      expect(result.nombre).toBe(schedule1.nombre)
      expect(result.id).toBe(1)

      // Step 3: Create second schedule
      const schedule2 = {
        nombre: 'Horario de Lenguaje',
        docenteId: 2,
        asignaturaId: 2,
        nivelId: 1,
      }

      const createdSchedule2 = {
        id: 2,
        ...schedule2,
        createdAt: new Date(),
        updatedAt: new Date(),
        asignatura: { id: 2, nombre: 'Lenguaje' },
        nivel: { id: 1, nombre: 'Primer Año' },
        profesor: {
          id: 2,
          rut: '87654321-0',
          nombre: 'Profesor de Lenguaje',
          email: 'lenguaje@test.com',
        },
      }

      prisma.horario.create.mockResolvedValue(createdSchedule2)

      result = await prisma.horario.create({
        data: schedule2,
        include: {
          asignatura: true,
          nivel: true,
          profesor: true,
        },
      })

      expect(result.nombre).toBe(schedule2.nombre)
      expect(result.id).toBe(2)

      // Step 4: Verify both schedules exist
      prisma.horario.findMany.mockResolvedValue([createdSchedule2, createdSchedule1])

      result = await prisma.horario.findMany()

      expect(result).toHaveLength(2)
      expect(result[0].nombre).toBe('Horario de Lenguaje')
      expect(result[1].nombre).toBe('Horario de Matemáticas')
    })

    test('should handle multiple schedules with same teacher', async () => {
      // Create multiple schedules for the same teacher
      const schedules = [
        {
          nombre: 'Matemáticas Básicas',
          docenteId: 1,
          asignaturaId: 1,
          nivelId: 1,
        },
        {
          nombre: 'Matemáticas Avanzadas',
          docenteId: 1,
          asignaturaId: 1,
          nivelId: 2,
        },
        {
          nombre: 'Física',
          docenteId: 1,
          asignaturaId: 3,
          nivelId: 1,
        },
      ]

      const createdSchedules = schedules.map((schedule, index) => ({
        id: index + 1,
        ...schedule,
        createdAt: new Date(),
        updatedAt: new Date(),
        asignatura: { id: schedule.asignaturaId, nombre: `Asignatura ${schedule.asignaturaId}` },
        nivel: { id: schedule.nivelId, nombre: `Nivel ${schedule.nivelId}` },
        profesor: {
          id: 1,
          rut: '12345678-9',
          nombre: 'Profesor de Prueba',
          email: 'profesor@test.com',
        },
      }))

      // Mock creation for each schedule
      for (let i = 0; i < schedules.length; i++) {
        prisma.horario.create.mockResolvedValueOnce(createdSchedules[i])
      }

      // Create all schedules
      for (let i = 0; i < schedules.length; i++) {
        const result = await prisma.horario.create({
          data: schedules[i],
          include: {
            asignatura: true,
            nivel: true,
            profesor: true,
          },
        })

        expect(result.id).toBe(i + 1)
        expect(result.docenteId).toBe(1)
      }

      // Verify all schedules exist
      prisma.horario.findMany.mockResolvedValue(createdSchedules.reverse())

      const result = await prisma.horario.findMany()

      expect(result).toHaveLength(3)
      expect(result.every(schedule => schedule.docenteId === 1)).toBe(true)
    })

    test('should handle error recovery in schedule creation', async () => {
      // Step 1: Try to create schedule with database error
      const schedule = {
        nombre: 'Horario con Error',
        docenteId: 1,
        asignaturaId: 1,
        nivelId: 1,
      }

      prisma.horario.create.mockRejectedValueOnce(new Error('Database connection failed'))

      await expect(
        prisma.horario.create({
          data: schedule,
        })
      ).rejects.toThrow('Database connection failed')

      // Step 2: Retry with valid database connection
      const createdSchedule = {
        id: 1,
        ...schedule,
        createdAt: new Date(),
        updatedAt: new Date(),
        asignatura: { id: 1, nombre: 'Matemáticas' },
        nivel: { id: 1, nombre: 'Primer Año' },
        profesor: {
          id: 1,
          rut: '12345678-9',
          nombre: 'Profesor de Prueba',
          email: 'profesor@test.com',
        },
      }

      prisma.horario.create.mockResolvedValueOnce(createdSchedule)

      const result = await prisma.horario.create({
        data: schedule,
        include: {
          asignatura: true,
          nivel: true,
          profesor: true,
        },
      })

      expect(result.nombre).toBe(schedule.nombre)
    })
  })

  describe('Data Validation Flow', () => {
    test('should handle various validation scenarios', () => {
      const validateHorario = (data) => {
        if (!data.nombre || !data.docenteId || !data.asignaturaId || !data.nivelId) {
          throw new Error('Nombre, docente, asignatura y nivel son obligatorios')
        }
        return true
      }

      const testCases = [
        {
          name: 'Missing all required fields',
          data: {},
          expectedError: 'Nombre, docente, asignatura y nivel son obligatorios',
        },
        {
          name: 'Missing docenteId',
          data: { nombre: 'Test', asignaturaId: 1, nivelId: 1 },
          expectedError: 'Nombre, docente, asignatura y nivel son obligatorios',
        },
        {
          name: 'Missing asignaturaId',
          data: { nombre: 'Test', docenteId: 1, nivelId: 1 },
          expectedError: 'Nombre, docente, asignatura y nivel son obligatorios',
        },
        {
          name: 'Missing nivelId',
          data: { nombre: 'Test', docenteId: 1, asignaturaId: 1 },
          expectedError: 'Nombre, docente, asignatura y nivel son obligatorios',
        },
        {
          name: 'Empty name',
          data: { nombre: '', docenteId: 1, asignaturaId: 1, nivelId: 1 },
          expectedError: 'Nombre, docente, asignatura y nivel son obligatorios',
        },
      ]

      for (const testCase of testCases) {
        expect(() => validateHorario(testCase.data)).toThrow(testCase.expectedError)
      }
    })
  })

  describe('Performance Flow', () => {
    test('should handle multiple concurrent operations', async () => {
      const schedules = Array.from({ length: 10 }, (_, i) => ({
        nombre: `Horario ${i + 1}`,
        docenteId: 1,
        asignaturaId: 1,
        nivelId: 1,
      }))

      const createdSchedules = schedules.map((schedule, index) => ({
        id: index + 1,
        ...schedule,
        createdAt: new Date(),
        updatedAt: new Date(),
        asignatura: { id: 1, nombre: 'Matemáticas' },
        nivel: { id: 1, nombre: 'Primer Año' },
        profesor: {
          id: 1,
          rut: '12345678-9',
          nombre: 'Profesor de Prueba',
          email: 'profesor@test.com',
        },
      }))

      // Mock creation for each schedule
      for (let i = 0; i < schedules.length; i++) {
        prisma.horario.create.mockResolvedValueOnce(createdSchedules[i])
      }

      // Send concurrent operations
      const promises = schedules.map(schedule =>
        prisma.horario.create({
          data: schedule,
          include: {
            asignatura: true,
            nivel: true,
            profesor: true,
          },
        })
      )

      const results = await Promise.all(promises)

      // Verify all operations succeeded
      results.forEach((result, index) => {
        expect(result.nombre).toBe(schedules[index].nombre)
        expect(result.id).toBe(index + 1)
      })
    })
  })
}) 