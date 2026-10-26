import React, { useState, useEffect } from 'react';
import { Pregunta } from '../types';
import { Check, Paperclip, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { CustomSelect, SelectOption } from './CustomSelect';

const AREA_RESPONSABLE_OPTIONS: SelectOption[] = [
  { value: 'OTI', label: 'OTI', subtitle: 'Tecnologías de la Información' },
  { value: 'OAJ', label: 'OAJ', subtitle: 'Asesoría Jurídica' },
  { value: 'UPM', label: 'UPM', subtitle: 'Planeamiento y Modernización' },
  { value: 'UP', label: 'UP', subtitle: 'Presupuesto' },
  { value: 'UE', label: 'UE', subtitle: 'Estadística' },
  { value: 'URH', label: 'URH', subtitle: 'Recursos Humanos' },
];

interface QuestionCardProps {
  pregunta: Pregunta;
  onSaveRespuesta: (codigo: string, nivel: number, texto: string, comentarios: string) => Promise<void>;
  onOpenEvidencias: (codigo: string) => void;
  onPrevQuestion?: () => void;
  onNextQuestion?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalInDimension?: number;
  isSingleMode?: boolean;
  userRole?: string;
  onAssignArea?: (codigo: string, newArea: string) => Promise<void>;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  pregunta,
  onSaveRespuesta,
  onOpenEvidencias,
  onPrevQuestion,
  onNextQuestion,
  hasPrev,
  hasNext,
  currentIndex,
  totalInDimension,
  isSingleMode = false,
  userRole,
  onAssignArea
}) => {
  const currentRespuesta = pregunta.respuesta;
  const [selectedNivel, setSelectedNivel] = useState<number | null>(
    currentRespuesta ? currentRespuesta.valor_nivel : null
  );
  const [comentarios, setComentarios] = useState<string>(
    currentRespuesta ? currentRespuesta.comentarios || '' : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sincronizar estado cuando cambie la pregunta seleccionada
  useEffect(() => {
    setSelectedNivel(currentRespuesta ? currentRespuesta.valor_nivel : null);
    setComentarios(currentRespuesta ? currentRespuesta.comentarios || '' : '');
    setSaveSuccess(false);
  }, [pregunta.codigo, currentRespuesta]);

  const selectedOption = selectedNivel === -1
    ? { nivel: -1, etiqueta: 'No Aplica', descripcion: 'No Aplica (N/A)' }
    : pregunta.opciones.find(o => o.nivel === selectedNivel);

  const handleSave = async () => {
    if (selectedNivel === null || !selectedOption) {
      toast.warning("Por favor seleccione un nivel de madurez o marque 'No Aplica' para calificar.");
      return;
    }
    setIsSaving(true);
    try {
      await onSaveRespuesta(pregunta.codigo, selectedNivel, selectedOption.descripcion, comentarios);
      setSaveSuccess(true);
      toast.success(`Pregunta ${pregunta.codigo} guardada exitosamente.`);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error al guardar la evaluación.");
    } finally {
      setIsSaving(false);
    }
  };

  // Color de acento lateral según nivel evaluado
  const getCardBorderAccent = () => {
    if (!currentRespuesta) {
      return 'border-slate-200 dark:border-slate-800 border-l-4 sm:border-l-8 border-l-slate-300 dark:border-l-slate-700';
    }
    const val = currentRespuesta.valor_nivel;
    if (val < 0) {
      return 'border-indigo-400/40 border-l-4 sm:border-l-8 border-l-indigo-500';
    }
    if (val >= 3) {
      return 'border-emerald-500/40 border-l-4 sm:border-l-8 border-l-emerald-500';
    }
    if (val === 2) {
      return 'border-amber-500/40 border-l-4 sm:border-l-8 border-l-amber-500';
    }
    return 'border-rose-500/40 border-l-4 sm:border-l-8 border-l-rose-500';
  };

  // Estilos de cada opción de nivel según diseño oficial
  const getOptionCardStyle = (nivel: number, isSelected: boolean) => {
    if (isSelected) {
      return 'border-2 border-sky-600 bg-sky-50 dark:bg-sky-950/60 ring-2 ring-sky-400 dark:ring-sky-500 shadow-md text-slate-900 dark:text-white';
    }

    switch (nivel) {
      case 0:
        return 'border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 hover:border-slate-400 text-slate-800 dark:text-slate-200';
      case 1:
        return 'border border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 hover:border-rose-400 text-rose-900 dark:text-rose-200';
      case 2:
        return 'border border-amber-300 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20 hover:border-amber-400 text-amber-900 dark:text-amber-200';
      case 3:
        return 'border border-sky-300 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20 hover:border-sky-400 text-sky-900 dark:text-sky-200';
      case 4:
        return 'border border-teal-300 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 hover:border-teal-400 text-teal-900 dark:text-teal-200';
      case 5:
        return 'border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 hover:border-emerald-400 text-emerald-900 dark:text-emerald-200';
      default:
        return 'border border-slate-200 bg-white text-slate-800';
    }
  };

  const getOptionHeaderColor = (nivel: number, isSelected: boolean) => {
    if (isSelected) return 'text-sky-800 dark:text-sky-300';
    switch (nivel) {
      case 0: return 'text-slate-700 dark:text-slate-300';
      case 1: return 'text-rose-700 dark:text-rose-400';
      case 2: return 'text-amber-700 dark:text-amber-400';
      case 3: return 'text-sky-700 dark:text-sky-400';
      case 4: return 'text-teal-700 dark:text-teal-400';
      case 5: return 'text-emerald-700 dark:text-emerald-400';
      default: return 'text-slate-700';
    }
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 shadow-xs transition-all ${getCardBorderAccent()}`}>

      {/* 1. & 2. ENCABEZADO Y TÍTULO DE PREGUNTA (ESTÁTICO / STICKY EN RESPONSIVE) */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pt-3.5 sm:pt-4 pb-3 -mt-4 sm:-mt-6 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 rounded-t-2xl shadow-xs mb-4">
        {/* Encabezado: Código + Dimensión + Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Código estilo cápsula Imagen 3 */}
            <span className="px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-heading font-black text-xs sm:text-sm border border-sky-300 dark:border-sky-700 shadow-xs">
              {pregunta.codigo}
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dimensión {pregunta.dimension_codigo}
            </span>

            {/* Badge de Área Responsable / Selector de Reasignación si es Administrador */}
            {userRole === 'ADMINISTRADOR' && onAssignArea ? (
              <CustomSelect
                options={AREA_RESPONSABLE_OPTIONS}
                value={pregunta.area_responsable || 'OTI'}
                onChange={(val) => onAssignArea(pregunta.codigo, val)}
                prefixLabel="RESP:"
                icon={<Building2 className="w-3.5 h-3.5" />}
                compact={true}
                dropdownAlign="left"
                menuClassName="w-64"
              />
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs">
                <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Resp: {pregunta.area_responsable || 'OTI'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentRespuesta ? (
              currentRespuesta.valor_nivel < 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" /> No Aplica (N/A)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Evaluada ({currentRespuesta.valor_nivel}.0 pts)
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Pendiente de evaluación
              </span>
            )}
          </div>
        </div>

        {/* Título y Enunciado */}
        {pregunta.titulo && (
          <div className="text-xs sm:text-sm font-extrabold uppercase text-sky-600 dark:text-sky-400 tracking-wider mb-1 line-clamp-1">
            {pregunta.titulo}
          </div>
        )}
        <h3 className="font-heading text-xs sm:text-sm md:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 md:line-clamp-none">
          {pregunta.enunciado}
        </h3>
      </div>

      {/* 3. GUÍA METODOLÓGICA (EXPLICACIÓN Y RESULTADOS ESPERADOS) */}
      <div className="bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 rounded-2xl p-3.5 sm:p-4 mb-4 text-[11px] sm:text-xs space-y-2">
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-sky-800 dark:text-sky-400 uppercase tracking-wide mr-1.5">
            EXPLICACIÓN:
          </span>
          {pregunta.explicacion}
        </div>
        <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mr-1.5">
            RESULTADOS ESPERADOS:
          </span>
          {pregunta.resultados_esperados}
        </div>
      </div>

      {/* Opción especial: No Aplica (N/A) si la pregunta lo admite */}
      {pregunta.admite_na && !pregunta.admite_na.toLowerCase().startsWith('no') && (
        <div
          onClick={() => setSelectedNivel(-1)}
          className={`p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all border mb-4 flex flex-col justify-between ${selectedNivel === -1
              ? 'border-2 border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-400 dark:ring-indigo-500 shadow-md text-indigo-950 dark:text-white'
              : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-indigo-400 text-slate-700 dark:text-slate-300'
            }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Opción: No Aplica (N/A)
            </span>
            <span className="font-heading font-black text-xs text-indigo-600 dark:text-indigo-400">
              Excluido del promedio
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Criterio oficial MEMGD:</strong> {pregunta.admite_na}
          </p>
        </div>
      )}

      {/* 4. RÚBRICAS OFICIALES PCM (NIVELES 0 A 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
        {pregunta.opciones.map((opt) => {
          const isSelected = selectedNivel === opt.nivel;
          return (
            <div
              key={opt.nivel}
              onClick={() => setSelectedNivel(opt.nivel)}
              className={`p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all flex flex-col justify-between ${getOptionCardStyle(
                opt.nivel,
                isSelected
              )}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`font-bold text-[10px] sm:text-[11px] uppercase tracking-wider ${getOptionHeaderColor(opt.nivel, isSelected)}`}>
                  {opt.etiqueta}
                </span>
                <span className="font-heading font-black text-xs sm:text-sm">
                  {opt.nivel}.0 pts
                </span>
              </div>
              <p className="text-[11px] sm:text-xs leading-relaxed line-clamp-3 sm:line-clamp-4 opacity-90">
                {opt.descripcion}
              </p>
            </div>
          );
        })}
      </div>

      {/* 5. JUSTIFICACIÓN TÉCNICA */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mb-2">
        <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
          COMENTARIOS Y JUSTIFICACIÓN TÉCNICA DE LA ENTIDAD:
        </label>
        <textarea
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          rows={2}
          placeholder="Sustente el nivel marcado y señale el documento de sustento..."
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
        />
      </div>

      {/* 6. BARRA INFERIOR DE ACCIONES Y NAVEGACIÓN (ESTÁTICA / STICKY EN RESPONSIVE) */}
      <div className="sticky bottom-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-3 sm:pb-4 pt-3 -mb-4 sm:-mb-6 -mx-4 sm:-mx-6 px-3 sm:px-6 border-t border-slate-200/80 dark:border-slate-800/80 rounded-b-2xl shadow-[0_-4px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_12px_rgba(0,0,0,0.3)] mt-3">
        <div className="flex items-center gap-1.5 sm:gap-3 w-full">
          {/* 1. Botón Anterior (solo icono en móvil, con label en desktop) */}
          {isSingleMode && (
            <button
              type="button"
              onClick={onPrevQuestion}
              disabled={!hasPrev}
              className="order-1 w-9 h-9 sm:w-auto sm:h-auto p-0 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs flex-shrink-0"
              title="Ir a pregunta anterior"
              aria-label="Ir a pregunta anterior"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>
          )}

          {/* 2. Botón Evidencias */}
          <button
            type="button"
            onClick={() => onOpenEvidencias(pregunta.codigo)}
            className="order-2 sm:order-3 sm:ml-auto flex-1 sm:flex-initial justify-center px-2 sm:px-4 py-2 sm:py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-200 transition-all shadow-2xs truncate min-w-0"
          >
            <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 dark:text-sky-400 flex-shrink-0" />
            <span className="truncate">Evidencias ({pregunta.total_evidencias})</span>
          </button>

          {/* 3. Botón Guardar */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`order-3 sm:order-4 flex-1 sm:flex-initial justify-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer truncate min-w-0 ${saveSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20'
              }`}
          >
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] flex-shrink-0" />
            <span className="truncate">{isSaving ? 'Guardando...' : saveSuccess ? '¡Guardado!' : 'Guardar'}</span>
          </button>

          {/* 4. Botón Siguiente (solo icono en móvil, con label en desktop) */}
          {isSingleMode && (
            <button
              type="button"
              onClick={onNextQuestion}
              disabled={!hasNext}
              className="order-4 sm:order-2 w-9 h-9 sm:w-auto sm:h-auto p-0 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs flex-shrink-0"
              title="Ir a siguiente pregunta"
              aria-label="Ir a siguiente pregunta"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
