import React, { useState } from 'react';
import { Pregunta } from '../types';
import { Check, Paperclip } from 'lucide-react';

interface QuestionCardProps {
  pregunta: Pregunta;
  onSaveRespuesta: (codigo: string, nivel: number, texto: string, comentarios: string) => Promise<void>;
  onOpenEvidencias: (codigo: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  pregunta,
  onSaveRespuesta,
  onOpenEvidencias
}) => {
  const currentRespuesta = pregunta.respuesta;
  const [selectedNivel, setSelectedNivel] = useState<number | null>(
    currentRespuesta ? currentRespuesta.valor_nivel : null
  );
  const [comentarios, setComentarios] = useState<string>(
    currentRespuesta ? currentRespuesta.comentarios || '' : ''
  );
  const [isSaving, setIsSaving] = useState(false);

  const selectedOption = pregunta.opciones.find(o => o.nivel === selectedNivel);

  const handleSave = async () => {
    if (selectedNivel === null || !selectedOption) {
      alert("Por favor seleccione un nivel de madurez para calificar.");
      return;
    }
    setIsSaving(true);
    try {
      await onSaveRespuesta(pregunta.codigo, selectedNivel, selectedOption.descripcion, comentarios);
    } finally {
      setIsSaving(false);
    }
  };

  const getBadgeStyle = (nivel: number, isSelected: boolean) => {
    const colors = [
      'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
      'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
      'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
      'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300',
      'bg-cyan-50 border-cyan-300 text-cyan-900 dark:bg-cyan-950/40 dark:border-cyan-800 dark:text-cyan-300',
      'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
    ];

    if (isSelected) {
      return 'border-sky-600 bg-sky-50 dark:bg-sky-950/50 dark:border-sky-400 ring-2 ring-sky-500 shadow-md';
    }
    return colors[nivel] || colors[0];
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border transition-all ${
      currentRespuesta
        ? 'border-emerald-500/40 bg-white dark:bg-slate-900/90 shadow-xs border-l-4 sm:border-l-8 border-l-emerald-500'
        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 shadow-xs'
    }`}>
      {/* Encabezado */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="px-2.5 py-1 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-heading font-extrabold text-xs sm:text-sm border border-sky-300 dark:border-sky-800">
            {pregunta.codigo}
          </span>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Dimensión {pregunta.dimension_codigo}
          </span>
        </div>

        {currentRespuesta && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-2xl text-[10px] sm:text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Check className="w-3 h-3" /> Evaluada ({currentRespuesta.valor_nivel}.0 pts)
          </span>
        )}
      </div>

      <h3 className="font-heading text-sm sm:text-base md:text-lg font-bold text-slate-900 dark:text-white leading-snug mb-3">
        {pregunta.enunciado}
      </h3>

      {/* Guía y Explicación */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3 sm:p-4 mb-4 text-[11px] sm:text-xs space-y-1.5">
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
          <span className="font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wide mr-1.5">Explicación:</span>
          {pregunta.explicacion}
        </div>
        <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mr-1.5">Resultados Esperados:</span>
          {pregunta.resultados_esperados}
        </div>
      </div>

      {/* Grid de Rúbricas (Niveles 0 a 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
        {pregunta.opciones.map((opt) => {
          const isSelected = selectedNivel === opt.nivel;
          return (
            <div
              key={opt.nivel}
              onClick={() => setSelectedNivel(opt.nivel)}
              className={`p-3 sm:p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${getBadgeStyle(
                opt.nivel,
                isSelected
              )}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[10px] sm:text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 shadow-xs">
                  {opt.etiqueta}
                </span>
                <span className="font-heading font-extrabold text-xs sm:text-sm">
                  {opt.nivel}.0 pts
                </span>
              </div>
              <p className="text-[11px] sm:text-xs leading-relaxed line-clamp-3 sm:line-clamp-4 font-normal">
                {opt.descripcion}
              </p>
            </div>
          );
        })}
      </div>

      {/* Justificación y Acciones */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="block text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Comentarios y Justificación Técnica de la Entidad:
          </label>
          <textarea
            value={comentarios}
            onChange={(e) => setComentarios(e.target.value)}
            rows={2}
            placeholder="Sustente el nivel marcado y señale el documento de sustento..."
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => onOpenEvidencias(pregunta.codigo)}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-200 transition-all"
          >
            <Paperclip className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Evidencias ({pregunta.total_evidencias})</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
