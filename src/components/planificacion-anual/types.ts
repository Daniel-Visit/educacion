export interface OA {
  id: number;
  oas_id: string;
  descripcion_oas: string;
  minimo_clases: number;
  basal?: boolean;
  eje_descripcion: string;
}

export interface Eje {
  id: number;
  descripcion: string;
  oas: OA[];
}

export interface OAClases {
  [oaId: number]: number;
} 