// Interfaces compartidas
export interface Alumno {
  id: string | number;
  nombre: string;
  apellido: string;
}

export interface RespuestaAlumno {
  id: string | number;
  alumno: Alumno;
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentaje: number;
  nota?: number;
}

export interface Estadisticas {
  promedioNota: number;
  aprobados: number;
  reprobados: number;
  porcentajeAprobacion: number;
  totalAlumnos: number;
  notaMaxima?: number;
  notaMinima?: number;
}

// Función para calcular nota según nivel de exigencia
export const calcularNota = (
  porcentajeCorrectas: number,
  nivelExigencia: number
): number => {
  const porcentaje = porcentajeCorrectas;
  const exigencia = nivelExigencia;

  if (porcentaje <= exigencia) {
    // Fórmula de 1 a 4
    const pendiente = 3 / exigencia;
    const nota = 1 + porcentaje * pendiente;
    return Math.round(nota * 100) / 100;
  } else {
    // Fórmula de 4 a 7
    const pendiente = 3 / (100 - exigencia);
    const nota = 4 + (porcentaje - exigencia) * pendiente;
    return Math.round(nota * 100) / 100;
  }
};

// Calcular estadísticas con el nivel de exigencia actual
export const calcularEstadisticas = (
  respuestasAlumnos: RespuestaAlumno[],
  nivelExigencia: number
): Estadisticas => {
  if (respuestasAlumnos.length === 0) {
    return {
      promedioNota: 0,
      aprobados: 0,
      reprobados: 0,
      porcentajeAprobacion: 0,
      totalAlumnos: 0,
    };
  }

  // Calcular notas para todos los alumnos
  const notas = respuestasAlumnos.map(r =>
    calcularNota(r.porcentaje, nivelExigencia)
  );

  // Calcular promedio de notas
  const promedioNota =
    Math.round(
      (notas.reduce((sum, nota) => sum + nota, 0) / notas.length) * 100
    ) / 100;

  // Calcular porcentaje de aprobación (nota >= 4.0)
  const aprobados = notas.filter(nota => nota >= 4.0).length;
  const porcentajeAprobacion = Math.round((aprobados / notas.length) * 100);

  return {
    promedioNota,
    aprobados,
    reprobados: respuestasAlumnos.length - aprobados,
    porcentajeAprobacion,
    totalAlumnos: respuestasAlumnos.length,
    notaMaxima: Math.max(...notas),
    notaMinima: Math.min(...notas),
  };
};

// Función para calcular rangos de porcentajes
export const calcularRangosPorcentajes = (
  respuestasAlumnos: RespuestaAlumno[]
) => {
  const rangos = [
    { rango: '91%-100%', min: 91, max: 100, color: '#7c3aed', estudiantes: 0 },
    { rango: '81%-90%', min: 81, max: 90, color: '#8b5cf6', estudiantes: 0 },
    { rango: '71%-80%', min: 71, max: 80, color: '#a855f7', estudiantes: 0 },
    { rango: '61%-70%', min: 61, max: 70, color: '#c084fc', estudiantes: 0 },
    { rango: '51%-60%', min: 51, max: 60, color: '#d8b4fe', estudiantes: 0 },
    { rango: '41%-50%', min: 41, max: 50, color: '#e9d5ff', estudiantes: 0 },
    { rango: '31%-40%', min: 31, max: 40, color: '#f3e8ff', estudiantes: 0 },
    { rango: '21%-30%', min: 21, max: 30, color: '#faf5ff', estudiantes: 0 },
    { rango: '11%-20%', min: 11, max: 20, color: '#fdf4ff', estudiantes: 0 },
    { rango: '1%-10%', min: 1, max: 10, color: '#fef7ff', estudiantes: 0 },
  ];

  respuestasAlumnos.forEach(respuesta => {
    const porcentaje = respuesta.porcentaje;
    const rango = rangos.find(r => porcentaje >= r.min && porcentaje <= r.max);
    if (rango) {
      rango.estudiantes++;
    }
  });

  // Filtrar solo rangos con estudiantes
  return rangos.filter(rango => rango.estudiantes > 0);
};

// Función para generar CSV de resultados
export const generarCSV = (
  respuestasAlumnos: RespuestaAlumno[],
  nivelExigencia: number
) => {
  const headers = [
    'Alumno',
    'Puntaje Total',
    'Puntaje Máximo',
    'Porcentaje Correctas',
    'Nota (Nivel Exigencia: ' + nivelExigencia + '%)',
    'Estado',
  ];

  // Crear filas de datos
  const rows = respuestasAlumnos.map(resultadoAlumno => {
    const nota = calcularNota(resultadoAlumno.porcentaje, nivelExigencia);
    const estado = nota >= 4.0 ? 'Aprobado' : 'Reprobado';

    return [
      `${resultadoAlumno.alumno.nombre} ${resultadoAlumno.alumno.apellido}`,
      resultadoAlumno.puntajeTotal.toString(),
      resultadoAlumno.puntajeMaximo.toString(),
      `${resultadoAlumno.porcentaje.toFixed(1)}%`,
      nota.toString(),
      estado,
    ];
  });

  // Agregar fila de estadísticas
  const stats = calcularEstadisticas(respuestasAlumnos, nivelExigencia);
  rows.push([]); // Línea vacía
  rows.push(['ESTADÍSTICAS GENERALES', '', '', '', '', '']);
  rows.push(['Total Alumnos', stats.totalAlumnos.toString(), '', '', '', '']);
  rows.push(['Promedio Nota', stats.promedioNota.toString(), '', '', '', '']);
  rows.push(['Aprobados', stats.aprobados.toString(), '', '', '', '']);
  rows.push([
    'Porcentaje Aprobación',
    `${stats.porcentajeAprobacion}%`,
    '',
    '',
    '',
    '',
  ]);

  // Combinar headers y rows
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
};

// Función para descargar CSV
export const descargarCSV = (csvContent: string, nombreEvaluacion: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `resultados_${nombreEvaluacion.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
  );
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
