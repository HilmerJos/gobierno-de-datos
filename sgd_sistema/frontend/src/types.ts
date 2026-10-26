export interface OptionItem {
  id?: number;
  nivel: number;
  etiqueta: string;
  descripcion: string;
}

export interface Respuesta {
  valor_nivel: number;
  opcion_texto: string;
  comentarios: string;
  actualizado_en?: string;
}

export interface UserSession {
  id: number;
  username: string;
  nombre_completo: string;
  siglas: string; // 'ADMIN' | 'OTI' | 'OAJ' | 'UPM' | 'UP' | 'UE' | 'URH'
  rol: 'ADMINISTRADOR' | 'AREA_RESPONSABLE';
  area: string;
}

export interface UsuarioItem {
  id: number;
  username: string;
  nombre_completo: string;
  siglas: string;
  rol: 'ADMINISTRADOR' | 'AREA_RESPONSABLE';
  area: string;
  activo: number;
  total_preguntas?: number;
}

export interface Pregunta {
  id: number;
  dimension_codigo: string;
  codigo: string;
  titulo?: string;
  enunciado: string;
  explicacion: string;
  resultados_esperados: string;
  admite_na?: string;
  area_responsable?: string;
  opciones: OptionItem[];
  respuesta: Respuesta | null;
  total_evidencias: number;
}

export interface Dimension {
  id: number;
  codigo: string;
  nombre: string;
  total_preguntas: number;
  respondidas: number;
  puntaje: number;
  brecha?: number;
}

export interface Stats {
  puntaje_final: number;
  nivel_descriptivo: string;
  nivel_objetivo: number;
  brecha_global: number;
  total_preguntas: number;
  total_respondidas: number;
  porcentaje_avance: number;
  total_evidencias: number;
  total_validadas: number;
  dimensiones: {
    codigo: string;
    nombre: string;
    total_preguntas: number;
    respondidas: number;
    puntaje: number;
    brecha: number;
  }[];
}

export interface Evidencia {
  id: number;
  pregunta_codigo: string;
  pregunta_enunciado?: string;
  dimension_codigo?: string;
  origen: string;
  tipo_evidencia: string;
  nombre_evidencia: string;
  ruta_o_enlace: string;
  descripcion: string;
  responsable: string;
  area_unidad: string;
  fecha_registro: string;
  estado_validacion: string;
  comentarios_revision?: string;
}

export interface Iniciativa {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  eje_engd: string;
  plazo: string;
  peso_relativo: number;
  meta_porcentaje: number;
  avance_porcentaje: number;
  responsable: string;
  puesto: string;
  unidad_organica: string;
  costo_proyectado: number;
  costo_ejecutado: number;
  fuente_financiamiento: string;
  fecha_inicio: string;
  fecha_fin: string;
  indice_ponderado: number;
}

export interface ConfigInstitucional {
  entidad_nombre: string;
  siglas: string;
  ogd_nombre: string;
  ogd_puesto: string;
  presidente_cgtd: string;
  resolucion_cgtd: string;
  periodo: string;
  nivel_objetivo: number;
}
