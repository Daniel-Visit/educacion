// Tipos base
export interface OA {
  id: number;
  oas_id: string;
  descripcion_oas: string;
  eje_id: number;
  eje_descripcion: string;
  nivel_id: number;
  asignatura_id: number;
  nivel: { nombre: string };
  asignatura: { nombre: string };
  basal?: boolean;
  tipo_eje: 'Contenido' | 'Habilidad' | 'Actitud';
}

export interface Indicador {
  id?: number;
  descripcion: string;
  preguntas: number;
}

export interface Eje {
  id: number;
  descripcion: string;
}

export interface Asignatura {
  id: number;
  nombre: string;
}

export interface Nivel {
  id: number;
  nombre: string;
}

// Tipos compuestos
export interface MatrizOA {
  id: number;
  oaId: number;
  oa: OA;
  indicadores: Indicador[];
}

export interface MatrizEspecificacion {
  id: number;
  nombre: string;
  total_preguntas: number;
  fecha_creacion?: string;
  createdAt?: string;
  oas: MatrizOA[];
}

// Estados de formulario
export interface MatrizFormState {
  matrizName: string;
  selectedAsignatura: number | null;
  selectedNivel: number | null;
  selectedOAsContenido: OA[];
  selectedOAsHabilidad: OA[];
  totalPreguntas: number;
  oaIndicadores: { [oaId: number]: Indicador[] };
  errors: { [key: string]: string };
}

// Tipos para validación
export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

// Tipos para importación CSV
export interface CSVRow {
  oa_identificador: string;
  tipo_oa: string;
  indicador: string;
  preguntas_por_indicador: string;
}

export interface ImportedOA extends OA {
  indicador: string;
  preguntas_por_indicador: number;
}

// Tipos para componentes
export interface Step {
  n: number;
  label: string;
}

export interface GradientConfig {
  gradient: string;
  hoverGradient: string;
}
