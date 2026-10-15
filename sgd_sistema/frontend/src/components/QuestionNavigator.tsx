import React from 'react';
import { Pregunta } from '../types';
import { Layers } from 'lucide-react';

interface QuestionNavigatorProps {
  preguntas: Pregunta[];
  activeCodigo: string;
  onSelectPregunta: (codigo: string) => void;
  dimensionCodigo: string;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  preguntas,
  activeCodigo,
  onSelectPregunta,
  dimensionCodigo
}) => {
  // Estadísticas del semáforo para la dimensión actual
  let verdes = 0;     // >= 3.0 pts (Cumple / Óptimo)
  let ambars = 0;     // 2.0 pts (En progreso)
  let rojos = 0;      // 0.0 o 1.0 pts (No iniciado / Inicial)
  let pendientes = 0; // Sin respuesta

  preguntas.forEach(q => {
    if (!q.respuesta) {
      pendientes++;
    } else {
      const v = q.respuesta.valor_nivel;
      if (v >= 3) verdes++;
      else if (v === 2) ambars++;
      else rojos++;
    }
  });

  const evaluadas = preguntas.length - pendientes;
  const porcentaje = preguntas.length > 0 ? Math.round((evaluadas / preguntas.length) * 100) : 0;

  // Determinar el color del semáforo de una pregunta
  const getSemaforoStatus = (q: Pregunta) => {
    if (!q.respuesta) return 'pendiente';
    const v = q.respuesta.valor_nivel;
    if (v >= 3) return 'verde';
    if (v === 2) return 'ambar';
    return 'rojo';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs space-y-3.5">
      
      {/* 1. ENCABEZADO VERTICAL: DIMENSIÓN, PROGRESO Y SEMÁFORO */}
      <div className="space-y-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white block truncate">
                Preguntas {dimensionCodigo}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                {evaluadas} de {preguntas.length} respondidas
              </span>
            </div>
          </div>
          <span className="text-xs font-black text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
            {porcentaje}%
          </span>
        </div>

        {/* Mini barra de progreso */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        {/* Resumen Semáforo Compacto */}
        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
          <div className="px-1.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="block font-black text-xs text-emerald-700 dark:text-emerald-300">{verdes}</span>
            <span className="text-[9px]">Verde</span>
          </div>
          <div className="px-1.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="block font-black text-xs text-amber-700 dark:text-amber-300">{ambars}</span>
            <span className="text-[9px]">Ámbar</span>
          </div>
          <div className="px-1.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="block font-black text-xs text-rose-700 dark:text-rose-300">{rojos + pendientes}</span>
            <span className="text-[9px]">Rojo</span>
          </div>
        </div>
      </div>

      {/* 2. LISTA VERTICAL DE PREGUNTAS CON BOTONES TIPO SEMÁFORO (SIN SCROLL HORIZONTAL) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5 lg:max-h-[calc(100vh-270px)] lg:overflow-y-auto lg:pr-1 scrollbar-thin">
        {preguntas.map((q) => {
          const semaforo = getSemaforoStatus(q);
          const isSelected = activeCodigo === q.codigo;
          const valor = q.respuesta ? q.respuesta.valor_nivel : null;

          let buttonClasses = '';
          let dotColor = '';

          if (isSelected) {
            // Activo: Fondo sólido y elevado
            if (semaforo === 'verde') {
              buttonClasses = 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400 shadow-md font-black';
              dotColor = 'bg-white';
            } else if (semaforo === 'ambar') {
              buttonClasses = 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 shadow-md font-black';
              dotColor = 'bg-white';
            } else if (semaforo === 'rojo') {
              buttonClasses = 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300 shadow-md font-black';
              dotColor = 'bg-white';
            } else {
              buttonClasses = 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300 shadow-md font-black';
              dotColor = 'bg-white';
            }
          } else {
            // Inactivo: Pasteles suaves
            if (semaforo === 'verde') {
              buttonClasses = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
              dotColor = 'bg-emerald-500';
            } else if (semaforo === 'ambar') {
              buttonClasses = 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
              dotColor = 'bg-amber-500';
            } else if (semaforo === 'rojo') {
              buttonClasses = 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
              dotColor = 'bg-rose-500';
            } else {
              // Pendiente
              buttonClasses = 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700';
              dotColor = 'bg-rose-400';
            }
          }

          return (
            <button
              key={q.codigo}
              type="button"
              onClick={() => onSelectPregunta(q.codigo)}
              className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-left ${buttonClasses}`}
              title={`Pregunta ${q.codigo}: ${q.respuesta ? `${valor}.0 pts` : 'Pendiente de evaluación'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {/* Semáforo Dot */}
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></span>
                
                {/* Código de Pregunta (Ej. 1.1) */}
                <span className="font-heading font-black tracking-tight">{q.codigo}</span>
              </div>

              {/* Puntaje en cápsula mini a la derecha */}
              {valor !== null ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex-shrink-0 ${
                  isSelected ? 'bg-black/25 text-white' : 'bg-white/80 dark:bg-slate-900/60 shadow-xs'
                }`}>
                  {valor}.0 pts
                </span>
              ) : (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 opacity-80 ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-rose-100/70 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                }`}>
                  Pend.
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
