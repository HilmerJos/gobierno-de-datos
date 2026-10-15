import React from 'react';
import { Pregunta } from '../types';
import { Layers, CheckCircle2, AlertTriangle, XCircle, LayoutGrid } from 'lucide-react';

interface QuestionNavigatorProps {
  preguntas: Pregunta[];
  activeCodigo: string | null; // null significa "Ver Todas"
  onSelectPregunta: (codigo: string | null) => void;
  dimensionCodigo: string;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  preguntas,
  activeCodigo,
  onSelectPregunta,
  dimensionCodigo
}) => {
  // Estadísticas del semáforo para la dimensión actual
  let verdes = 0;   // >= 3.0 pts (Cumple / Óptimo)
  let ambars = 0;   // 2.0 pts (En progreso)
  let rojos = 0;    // 0.0 o 1.0 pts (No iniciado / Inicial)
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5">
      
      {/* 1. BARRA SUPERIOR: RESUMEN DE SEMÁFORO Y PROGRESO DE LA DIMENSIÓN */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          <span className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            Navegador de Preguntas — Dimensión {dimensionCodigo}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            ({evaluadas}/{preguntas.length} evaluadas • {porcentaje}%)
          </span>
        </div>

        {/* Leyenda de Semáforo Rápida */}
        <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-bold">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {verdes} Verde (≥3 pts)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            {ambars} Ámbar (2 pts)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {rojos + pendientes} Rojo (≤1 pts)
          </span>
        </div>
      </div>

      {/* 2. BOTONES TIPO PÍLDORA (ESTILO IMAGEN 2 Y 3) PARA NAVEGAR SIN SCROLL */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
        
        {/* Botón "Todo" (Ver todas las preguntas en lista) idéntico a Imagen 2 */}
        <button
          type="button"
          onClick={() => onSelectPregunta(null)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex-shrink-0 cursor-pointer ${
            activeCodigo === null
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400 border border-emerald-700 scale-105'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
          }`}
          title="Ver todas las preguntas de la dimensión en vista continua"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Todo</span>
        </button>

        {/* Botones de Preguntas Individuales (Semáforo Rojo, Ámbar, Verde) */}
        {preguntas.map((q) => {
          const semaforo = getSemaforoStatus(q);
          const isSelected = activeCodigo === q.codigo;
          const valor = q.respuesta ? q.respuesta.valor_nivel : null;

          // Clases dinámicas según estado de semáforo y selección
          let buttonClasses = '';
          let dotColor = '';

          if (isSelected) {
            // Estilo seleccionado (activo): resalta con fondo sólido vibrante
            if (semaforo === 'verde') {
              buttonClasses = 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-400 shadow-md scale-105';
              dotColor = 'bg-white';
            } else if (semaforo === 'ambar') {
              buttonClasses = 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 shadow-md scale-105';
              dotColor = 'bg-white';
            } else if (semaforo === 'rojo') {
              buttonClasses = 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-300 shadow-md scale-105';
              dotColor = 'bg-white';
            } else {
              buttonClasses = 'bg-sky-600 text-white border-sky-700 ring-2 ring-sky-300 shadow-md scale-105';
              dotColor = 'bg-white';
            }
          } else {
            // Estilo normal (no seleccionado): pasteles con bordes diferenciados
            if (semaforo === 'verde') {
              buttonClasses = 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
              dotColor = 'bg-emerald-500';
            } else if (semaforo === 'ambar') {
              buttonClasses = 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
              dotColor = 'bg-amber-500';
            } else if (semaforo === 'rojo') {
              buttonClasses = 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
              dotColor = 'bg-rose-500';
            } else {
              // Pendiente
              buttonClasses = 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300 dark:bg-slate-800/70 dark:text-slate-400 dark:border-slate-700';
              dotColor = 'bg-slate-400';
            }
          }

          return (
            <button
              key={q.codigo}
              type="button"
              onClick={() => onSelectPregunta(q.codigo)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition-all flex-shrink-0 cursor-pointer ${buttonClasses}`}
              title={`Pregunta ${q.codigo}: ${q.respuesta ? `${valor}.0 pts` : 'Pendiente'}`}
            >
              {/* Punto de Semáforo */}
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`}></span>
              
              {/* Código de la Pregunta (Ej. 1.1) */}
              <span>{q.codigo}</span>

              {/* Puntaje o estado en píldora mini */}
              {valor !== null && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-black/20 text-white' : 'bg-white/80 dark:bg-slate-900/60'
                }`}>
                  {valor}.0
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
