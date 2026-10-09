import React, { useState } from 'react';
import { CustomSelect, SelectOption } from './CustomSelect';
import { Pregunta } from '../types';
import { X, Upload, Link2 } from 'lucide-react';

interface EvidenciasModalProps {
  isOpen: boolean;
  onClose: () => void;
  preguntas: Pregunta[];
  initialCodigo?: string;
  onSaveEvidencia: (data: any, file: File | null) => Promise<void>;
}

export const EvidenciasModal: React.FC<EvidenciasModalProps> = ({
  isOpen,
  onClose,
  preguntas,
  initialCodigo = '',
  onSaveEvidencia
}) => {
  const [preguntaCodigo, setPreguntaCodigo] = useState(initialCodigo || (preguntas[0]?.codigo || '1.1'));
  const [origen, setOrigen] = useState('Interno');
  const [tipoEvidencia, setTipoEvidencia] = useState('Documento normativo / Directiva');
  const [nombreEvidencia, setNombreEvidencia] = useState('');
  const [rutaOEnlace, setRutaOEnlace] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [responsable, setResponsable] = useState('');
  const [areaUnidad, setAreaUnidad] = useState('');
  const [estadoValidacion, setEstadoValidacion] = useState('En Revisión');
  const [comentariosRevision] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const preguntaOptions: SelectOption[] = preguntas.map(q => ({
    value: q.codigo,
    label: `[${q.codigo}] ${q.enunciado.substring(0, 70)}...`,
    sublabel: `Dimensión ${q.dimension_codigo}`
  }));

  const origenOptions: SelectOption[] = [
    { value: 'Interno', label: 'Interno', sublabel: 'Producido o emitido por la entidad institucional' },
    { value: 'Externo', label: 'Externo', sublabel: 'Contratos, convenios o terceros vinculados' },
    { value: 'Normativo', label: 'Normativo', sublabel: 'Resoluciones, leyes o mandatos del Estado' }
  ];

  const tipoOptions: SelectOption[] = [
    { value: 'Documento normativo / Directiva', label: 'Documento normativo / Directiva', sublabel: 'Políticas, resoluciones y lineamientos aprobados' },
    { value: 'Plan o Estrategia Formal', label: 'Plan o Estrategia Formal', sublabel: 'EGD, Plan de Gobierno Digital o planes operativos' },
    { value: 'Acta de Comité / Reunión', label: 'Acta de Comité / Reunión', sublabel: 'Actas del CGTD o sesiones de comités de datos' },
    { value: 'Informe Técnico / Reporte', label: 'Informe Técnico / Reporte', sublabel: 'Diagnósticos, auditorías o evaluaciones técnicas' },
    { value: 'Diagrama / Modelo de Arquitectura', label: 'Diagrama / Modelo de Arquitectura', sublabel: 'MRD, modelos entidad-relación y flujos de linaje' },
    { value: 'Enlace a Portal / Repositorio Git', label: 'Enlace a Portal / Repositorio Git', sublabel: 'Plataforma PNDA, APIs o repositorios de código' },
    { value: 'Captura de Pantalla / Sistema', label: 'Captura de Pantalla / Sistema', sublabel: 'Evidencias visuales de sistemas en producción' }
  ];

  const estadoOptions: SelectOption[] = [
    { value: 'En Revisión', label: 'En Revisión', sublabel: 'Pendiente de verificación por el OGD o CND' },
    { value: 'Validado', label: 'Validado', sublabel: 'Medio de verificación formalmente admitido' },
    { value: 'Observado', label: 'Observado', sublabel: 'Requiere subsanación o mayor sustento técnico' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreEvidencia || (!rutaOEnlace && !selectedFile)) {
      alert("Por favor ingrese el nombre y adjunte un archivo o enlace.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveEvidencia({
        pregunta_codigo: preguntaCodigo,
        origen,
        tipo_evidencia: tipoEvidencia,
        nombre_evidencia: nombreEvidencia,
        ruta_o_enlace: rutaOEnlace,
        descripcion,
        responsable,
        area_unidad: areaUnidad,
        estado_validacion: estadoValidacion,
        comentarios_revision: comentariosRevision
      }, selectedFile);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-7 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 sm:mb-5">
          <div>
            <h2 className="font-heading font-extrabold text-base sm:text-xl text-slate-900 dark:text-white">
              Registrar Medio de Verificación
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inventario oficial de evidencias de Gobierno de Datos (PCM / CND)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CustomSelect
            label="Código y Pregunta a Vincular"
            required
            options={preguntaOptions}
            value={preguntaCodigo}
            onChange={setPreguntaCodigo}
            placeholder="Seleccionar pregunta vinculada..."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <CustomSelect
              label="Origen de la Evidencia"
              required
              options={origenOptions}
              value={origen}
              onChange={setOrigen}
            />

            <CustomSelect
              label="Tipo de Evidencia"
              required
              options={tipoOptions}
              value={tipoEvidencia}
              onChange={setTipoEvidencia}
            />
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Evidencia <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombreEvidencia}
              onChange={(e) => setNombreEvidencia(e.target.value)}
              placeholder="Ej: Directiva de Seguridad de Información OTI-DIR-002"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-700 space-y-2.5">
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Adjuntar Archivo o Enlace Externo
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-sky-500 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all">
                <Upload className="w-4 h-4 text-sky-600" />
                <span className="truncate">{selectedFile ? selectedFile.name : 'Subir archivo (PDF, DOCX, XLSX, PNG)'}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                />
              </label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={rutaOEnlace}
                onChange={(e) => setRutaOEnlace(e.target.value)}
                placeholder="O pegar URL institucional: https://sharepoint.entidad.gob.pe/..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 pl-8"
              />
              <Link2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Descripción del Contenido <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explique el contenido del documento y su relación con la pregunta..."
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Responsable <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                placeholder="Apellidos y Nombres"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Área / Unidad Orgánica <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={areaUnidad}
                onChange={(e) => setAreaUnidad(e.target.value)}
                placeholder="Ej: Base de Datos y Redes"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <CustomSelect
            label="Estado de Validación de la Evidencia"
            options={estadoOptions}
            value={estadoValidacion}
            onChange={setEstadoValidacion}
          />

          {/* Footer Modal con rounded-2xl */}
          <div className="flex items-center justify-end gap-2.5 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Evidencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
