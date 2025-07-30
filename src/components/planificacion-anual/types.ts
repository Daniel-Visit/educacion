export interface OA {
  id: number;
  nivel_id: number;
  asignatura_id: number;
  eje_id: number;
  eje_descripcion: string;
  tipo_eje?: string;
  oas_id: string;
  descripcion_oas: string;
  basal: boolean;
  minimo_clases: number;
}

export interface Eje {
  id: string; // Cambiado a string para usar ejeKey
  ejeId: number; // El eje_id original
  descripcion: string;
  oas: OA[];
}

export interface OAClases {
  [oaId: number]: number;
} 