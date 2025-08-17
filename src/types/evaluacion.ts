export interface Indicador {
  id: number;
  descripcion: string;
  preguntas: number;
}

export interface MatrizOA {
  id: number;
  oa: {
    oas_id: string;
    descripcion_oas: string;
    tipo_eje: 'Contenido' | 'Habilidad' | 'Actitud';
    nivel: { nombre: string };
    asignatura: { nombre: string };
  };
  indicadores: Indicador[];
}

export interface MatrizEspecificacion {
  id: number;
  nombre: string;
  total_preguntas: number;
  oas: MatrizOA[];
}

export interface EvaluacionFormData {
  matrizId: number | null;
  contenido: string;
  respuestasCorrectas: { [preguntaNumero: number]: string };
  indicadoresAsignados: {
    [preguntaNumero: number]: { contenido?: number; habilidad?: number };
  };
}
