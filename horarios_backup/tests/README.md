# 🧪 Tests - Educacion App

## 📁 Estructura de Tests

```
tests/
├── api/                    # Tests de APIs
│   ├── horarios.test.js    # Tests para API de horarios
│   ├── profesores.test.js  # Tests para API de profesores (futuro)
│   └── evaluaciones.test.js # Tests para API de evaluaciones (futuro)
├── components/             # Tests de componentes React
│   ├── ui/                 # Tests de componentes UI
│   └── forms/              # Tests de formularios
├── integration/            # Tests de flujos completos
│   ├── horarios-flow.test.js # Flujo completo de horarios
│   └── evaluaciones-flow.test.js # Flujo de evaluaciones (futuro)
├── database/               # Tests de base de datos
│   ├── relations.test.js   # Tests de relaciones
│   └── constraints.test.js # Tests de constraints
└── utils/                  # Tests de utilidades
    └── helpers.test.js     # Tests de funciones helper
```

## 🚀 Comandos de Testing

### **Ejecutar Todos los Tests**
```bash
npm test
```

### **Ejecutar Tests en Modo Watch**
```bash
npm run test:watch
```

### **Ejecutar Tests con Coverage**
```bash
npm run test:coverage
```

### **Ejecutar Tests Específicos**

#### **Solo Tests de API**
```bash
npm run test:api
```

#### **Solo Tests de Componentes**
```bash
npm run test:components
```

#### **Solo Tests de Integración**
```bash
npm run test:integration
```

#### **Solo Tests de Base de Datos**
```bash
npm run test:database
```

### **Ejecutar Tests Específicos por Patrón**
```bash
npm test -- --testNamePattern="horarios"
```

## 📊 Cobertura de Tests

### **Métricas Mínimas**
- **APIs**: 95%
- **Componentes**: 80%
- **Utilidades**: 90%
- **Integración**: 70%

### **Verificar Cobertura**
```bash
npm run test:coverage
```

## 🧩 Tipos de Tests

### **1. Tests de API**
- **Propósito**: Probar endpoints HTTP
- **Herramienta**: Jest + Supertest
- **Cobertura**: GET, POST, PUT, DELETE, validaciones, errores

### **2. Tests de Componentes**
- **Propósito**: Probar componentes React
- **Herramienta**: Jest + React Testing Library
- **Cobertura**: Renderizado, props, eventos, interacciones

### **3. Tests de Integración**
- **Propósito**: Probar flujos completos
- **Herramienta**: Jest + Supertest
- **Cobertura**: Flujos de usuario, interacciones entre módulos

### **4. Tests de Base de Datos**
- **Propósito**: Probar relaciones y constraints
- **Herramienta**: Jest + Prisma
- **Cobertura**: Foreign keys, unique constraints, cascades

## 📝 Convenciones de Naming

### **Archivos de Test**
- `*.test.js` - Tests unitarios
- `*.spec.js` - Tests de especificación
- `*-flow.test.js` - Tests de flujo/integración

### **Estructura de Tests**
```javascript
describe('Feature Name', () => {
  describe('Method/Endpoint Name', () => {
    test('should do something specific', () => {
      // Test implementation
    })
  })
})
```

## 🔧 Configuración

### **Jest Configuration**
- Archivo: `jest.config.js`
- Setup: `jest.setup.js`
- Coverage: Configurado en `package.json`

### **Mocks**
- **Prisma**: Mocked para tests de API
- **Next.js Router**: Mocked para tests de componentes
- **External APIs**: Mocked cuando sea necesario

## 🚨 Reglas de Testing

### **Obligatorias**
1. **Cada nueva API** debe tener tests completos
2. **Cada componente** debe tener tests de funcionalidad
3. **Cada utilidad** debe tener tests unitarios
4. **Tests deben pasar** antes de cada commit

### **Buenas Prácticas**
1. **Tests descriptivos** con nombres claros
2. **Arrange-Act-Assert** pattern
3. **Mocks apropiados** para dependencias externas
4. **Edge cases** cubiertos
5. **Error handling** testeado

### **Antes de Commit**
- [ ] Tests escritos para nueva funcionalidad
- [ ] Tests existentes siguen pasando
- [ ] Cobertura mínima alcanzada
- [ ] Tests de edge cases incluidos
- [ ] Tests de errores incluidos

## 🔄 Workflow de Testing

### **1. Desarrollo**
```bash
# Desarrollar nueva funcionalidad
```

### **2. Testing Inmediato**
```bash
# Escribir tests para la funcionalidad
npm run test:watch
```

### **3. Validación**
```bash
# Verificar que todos los tests pasan
npm test
```

### **4. Commit**
```bash
# Commit incluye código + tests
git add .
git commit -m "feat: add new feature with tests"
```

## 📈 Monitoreo Continuo

### **Revisión Semanal**
- Revisar tests que fallan frecuentemente
- Optimizar tests lentos
- Actualizar tests obsoletos

### **Revisión Mensual**
- Evaluar cobertura de tests
- Identificar gaps en testing
- Planificar mejoras en testing

---

**Última actualización**: $(date)
**Responsable**: Equipo de desarrollo
**Revisión**: Semanal 