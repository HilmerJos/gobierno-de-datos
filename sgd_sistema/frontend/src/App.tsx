import React, { useState, useEffect, useCallback } from 'react';
import {
  Stats,
  Dimension,
  Pregunta,
  Evidencia,
  Iniciativa,
  ConfigInstitucional,
  UserSession
} from './types';
import { CustomSelect, SelectOption } from './components/CustomSelect';
import { QuestionCard } from './components/QuestionCard';
import { QuestionNavigator, DimensionSummaryCard } from './components/QuestionNavigator';
import { RadarChart } from './components/RadarChart';
import { BrechasChart } from './components/BrechasChart';
import { EvidenciasModal } from './components/EvidenciasModal';
import { LoginScreen } from './components/LoginScreen';
import { AdminUsersModule } from './components/AdminUsersModule';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  ShieldCheck,
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  Target,
  DownloadCloud,
  Moon,
  Sun,
  Menu,
  X,
  FileSpreadsheet,
  FileText,
  PlusCircle,
  ExternalLink,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Award,
  ListChecks,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
  Filter,
  Users,
  UserCheck
} from 'lucide-react';

export const App: React.FC = () => {
  // Estado de sesión de usuario autenticado
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('sgd_session_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Filtro opcional de área para Administradores ('ALL' o 'OTI', 'OAJ', etc.)
  const [adminFiltroArea, setAdminFiltroArea] = useState<string>('ALL');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'matriz' | 'evidencias' | 'plan' | 'exportar' | 'usuarios'>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sgd_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sgd_sidebar_collapsed', String(next));
      } catch { }
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper para obtener parámetro de filtrado estricto por área
  const getActiveAreaParam = useCallback((): string => {
    if (!currentUser) return '';
    if (currentUser.rol === 'AREA_RESPONSABLE') {
      return currentUser.siglas;
    }
    return adminFiltroArea !== 'ALL' ? adminFiltroArea : '';
  }, [currentUser, adminFiltroArea]);

  // Estados de datos
  const [stats, setStats] = useState<Stats | null>(null);
  const [dimensiones, setDimensiones] = useState<Dimension[]>([]);
  const [currentDimension, setCurrentDimension] = useState<string>('D1');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [activePreguntaCodigo, setActivePreguntaCodigo] = useState<string | null>(null);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>([]);
  const [configInst, setConfigInst] = useState<ConfigInstitucional>({
    entidad_nombre: 'Oficina de Tecnologías de la Información',
    siglas: 'OTI',
    ogd_nombre: 'Ing. Oficial de Gobierno de Datos',
    ogd_puesto: 'Jefe de OTI / Oficial de Datos',
    presidente_cgtd: 'Director General',
    resolucion_cgtd: 'Resolución N° 001-2026-CGTD',
    periodo: '2026 - 2030',
    nivel_objetivo: 3.0
  });

  // Filtros de evidencias
  const [filtroEvidenciaDim, setFiltroEvidenciaDim] = useState<string>('TODAS');
  const [filtroEvidenciaEstado, setFiltroEvidenciaEstado] = useState<string>('TODOS');
  const [filtroEvidenciaSearch, setFiltroEvidenciaSearch] = useState<string>('');

  // Modales
  const [isEvidenciaModalOpen, setIsEvidenciaModalOpen] = useState<boolean>(false);
  const [preselectedPreguntaCodigo, setPreselectedPreguntaCodigo] = useState<string>('');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const loadAllData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const area = getActiveAreaParam();
      const query = area ? `?area=${area}` : '';

      const [resStats, resDims, resEvs, resPlan] = await Promise.all([
        fetch(`/api/estadisticas${query}`).then(r => r.json()),
        fetch(`/api/dimensiones${query}`).then(r => r.json()),
        fetch(`/api/evidencias${query}`).then(r => r.json()),
        fetch('/api/plan-accion').then(r => r.json())
      ]);
      setStats(resStats);
      setDimensiones(resDims);
      setEvidencias(resEvs);
      if (resPlan.configuracion) setConfigInst(resPlan.configuracion);
      if (resPlan.iniciativas) setIniciativas(resPlan.iniciativas);

      // Si la dimensión actual tiene 0 preguntas para esta área, seleccionar la primera con preguntas
      if (resDims && resDims.length > 0) {
        setCurrentDimension(prev => {
          const hasQuestions = resDims.some((d: Dimension) => d.codigo === prev && d.total_preguntas > 0);
          if (!hasQuestions) {
            const firstWithQ = resDims.find((d: Dimension) => d.total_preguntas > 0);
            return firstWithQ ? firstWithQ.codigo : prev;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  }, [currentUser, getActiveAreaParam]);

  const loadPreguntas = useCallback(async (dimCode: string) => {
    if (!currentUser) return;
    try {
      const area = getActiveAreaParam();
      const query = area ? `&area=${area}` : '';
      const res = await fetch(`/api/preguntas?dim=${dimCode}${query}`);
      const data: Pregunta[] = await res.json();
      setPreguntas(data);
      if (data && data.length > 0) {
        setActivePreguntaCodigo(prev => {
          if (!prev) return data[0].codigo;
          const exists = data.some(q => q.codigo === prev);
          return exists ? prev : data[0].codigo;
        });
      } else {
        setActivePreguntaCodigo(null);
      }
    } catch (err) {
      console.error("Error cargando preguntas:", err);
    }
  }, [currentUser, getActiveAreaParam]);

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser, adminFiltroArea, loadAllData]);

  useEffect(() => {
    if (currentUser && activeTab === 'matriz') {
      loadPreguntas(currentDimension);
    }
  }, [currentUser, activeTab, currentDimension, adminFiltroArea, loadPreguntas]);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('sgd_session_user', JSON.stringify(user));
    toast.success(`Bienvenido(a), ${user.nombre_completo}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sgd_session_user');
    toast.info("Sesión cerrada correctamente.");
  };

  const handleAssignArea = async (codigo: string, nuevaArea: string) => {
    try {
      const res = await fetch(`/api/preguntas/${codigo}/asignar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_responsable: nuevaArea })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al reasignar área");
      }
      toast.success(`Pregunta ${codigo} asignada a ${nuevaArea}`);
      await loadPreguntas(currentDimension);
      await loadAllData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al reasignar la pregunta");
    }
  };

  const handleSaveRespuesta = async (
    codigo: string,
    nivel: number,
    texto: string,
    comentarios: string
  ) => {
    try {
      const res = await fetch('/api/respuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregunta_codigo: codigo,
          valor_nivel: nivel,
          opcion_texto: texto,
          comentarios
        })
      });
      if (!res.ok) throw new Error("Error en servidor al guardar respuesta");
      toast.success(`Respuesta registrada para ${codigo}`);
      await loadPreguntas(currentDimension);
      const area = getActiveAreaParam();
      const query = area ? `?area=${area}` : '';
      const [resStats, resDims] = await Promise.all([
        fetch(`/api/estadisticas${query}`).then(r => r.json()),
        fetch(`/api/dimensiones${query}`).then(r => r.json())
      ]);
      setStats(resStats);
      setDimensiones(resDims);
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar la respuesta en el servidor.");
    }
  };

  const handleSaveEvidencia = async (data: any, file: File | null) => {
    let finalRuta = data.ruta_o_enlace;
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const resUpload = await fetch('/api/evidencias/upload', {
        method: 'POST',
        body: formData
      });
      const uploadData = await resUpload.json();
      if (uploadData.url) finalRuta = uploadData.url;
    }

    await fetch('/api/evidencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, ruta_o_enlace: finalRuta })
    });

    const area = getActiveAreaParam();
    const query = area ? `?area=${area}` : '';
    const [resEvs, resStats] = await Promise.all([
      fetch(`/api/evidencias${query}`).then(r => r.json()),
      fetch(`/api/estadisticas${query}`).then(r => r.json())
    ]);
    setEvidencias(resEvs);
    setStats(resStats);
    if (activeTab === 'matriz') loadPreguntas(currentDimension);
  };

  const handleEliminarEvidencia = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar esta evidencia?")) return;
    try {
      const res = await fetch(`/api/evidencias/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Error al eliminar evidencia");
      const area = getActiveAreaParam();
      const query = area ? `?area=${area}` : '';
      const [resEvs, resStats] = await Promise.all([
        fetch(`/api/evidencias${query}`).then(r => r.json()),
        fetch(`/api/estadisticas${query}`).then(r => r.json())
      ]);
      setEvidencias(resEvs);
      setStats(resStats);
      if (activeTab === 'matriz') loadPreguntas(currentDimension);
      toast.info("Evidencia eliminada correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al eliminar la evidencia seleccionada.");
    }
  };

  const handleValidarEvidencia = async (ev: Evidencia, nuevoEstado: string) => {
    try {
      const res = await fetch(`/api/evidencias/${ev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ev, estado_validacion: nuevoEstado })
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      const area = getActiveAreaParam();
      const query = area ? `?area=${area}` : '';
      const [resEvs, resStats] = await Promise.all([
        fetch(`/api/evidencias${query}`).then(r => r.json()),
        fetch(`/api/estadisticas${query}`).then(r => r.json())
      ]);
      setEvidencias(resEvs);
      setStats(resStats);
      toast.success(`Evidencia actualizada a estado: ${nuevoEstado}`);
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar la validación de la evidencia.");
    }
  };

  const handleGuardarConfigPlan = async () => {
    try {
      const res = await fetch('/api/plan-accion/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configInst)
      });
      if (!res.ok) throw new Error("Error al guardar datos institucionales");
      toast.success("Configuración institucional guardada correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar datos institucionales.");
    }
  };

  // Opciones para CustomSelect de Dimensiones (Estilo Imagen 3)
  const dimensionSelectOptions: SelectOption[] = dimensiones.map(d => ({
    value: d.codigo,
    label: `${d.codigo} - ${d.nombre}`,
    sublabel: `${d.total_preguntas} preguntas • Puntaje: ${d.puntaje.toFixed(2)} pts`
  }));

  // Opciones para CustomSelect de Filtro de Área (Estilo Imagen 2)
  const areaFiltroOptions: SelectOption[] = [
    { value: 'ALL', label: 'Todas las Áreas (75)', sublabel: 'Evaluación institucional consolidada' },
    { value: 'OTI', label: 'OTI - Tecnologías (43)', sublabel: 'Oficina de Tecnologías de la Información' },
    { value: 'OAJ', label: 'OAJ - Asesoría Jurídica (11)', sublabel: 'Oficina de Asesoría Jurídica' },
    { value: 'UPM', label: 'UPM - Planeamiento (5)', sublabel: 'Unidad de Planeamiento y Modernización' },
    { value: 'UP', label: 'UP - Presupuesto (3)', sublabel: 'Unidad de Presupuesto' },
    { value: 'UE', label: 'UE - Estadística (8)', sublabel: 'Unidad de Estadística' },
    { value: 'URH', label: 'URH - Rec. Humanos (5)', sublabel: 'Unidad de Recursos Humanos' },
  ];

  // Opciones para filtros de evidencias (Estilo Imagen 3)
  const filtroDimOptions: SelectOption[] = [
    { value: 'TODAS', label: 'TODAS LAS DIMENSIONES', sublabel: 'Ver inventario consolidado completo' },
    ...dimensiones.map(d => ({
      value: d.codigo,
      label: `${d.codigo} - ${d.nombre}`,
      sublabel: `Dimensión de evaluación ${d.codigo}`
    }))
  ];

  const filtroEstadoOptions: SelectOption[] = [
    { value: 'TODOS', label: 'TODOS LOS ESTADOS', sublabel: 'Sin discriminación de validación' },
    { value: 'Validado', label: 'VALIDADO', sublabel: 'Medios aprobados formalmente' },
    { value: 'En Revisión', label: 'EN REVISIÓN', sublabel: 'Pendientes de revisión por evaluadores' },
    { value: 'Observado', label: 'OBSERVADO', sublabel: 'Con subsanaciones pendientes' }
  ];

  const evidenciasFiltradas = evidencias.filter(ev => {
    if (filtroEvidenciaDim !== 'TODAS' && ev.dimension_codigo !== filtroEvidenciaDim) return false;
    if (filtroEvidenciaEstado !== 'TODOS' && ev.estado_validacion !== filtroEvidenciaEstado) return false;
    if (filtroEvidenciaSearch) {
      const q = filtroEvidenciaSearch.toLowerCase();
      const txt = `${ev.nombre_evidencia} ${ev.pregunta_codigo} ${ev.responsable} ${ev.area_unidad}`.toLowerCase();
      if (!txt.includes(q)) return false;
    }
    return true;
  });

  const curDimObj = dimensiones.find(d => d.codigo === currentDimension);

  // PANTALLA DE ACCESO INSTITUCIONAL (SI NO HAY SESIÓN ACTIVA)
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={isDark ? 'dark' : 'light'}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* SIDEBAR DE ESCRITORIO COLAPSABLE */}
      <aside
        className={`hidden lg:flex flex-col h-full z-30 bg-white dark:bg-[#0c121e] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out shadow-xs select-none flex-shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-72'
          }`}
      >
        {/* CABECERA SIDEBAR CON LOGO Y BOTÓN DE COLAPSAR */}
        <div className={`p-4 border-b border-slate-200 dark:border-slate-800 flex items-center ${isSidebarCollapsed ? 'justify-center flex-col gap-2.5' : 'justify-between gap-3'
          }`}>
          <div className={`flex items-center gap-3 min-w-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-sky-500/20 flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => isSidebarCollapsed && setIsSidebarCollapsed(false)}
              title="SGD-Madurez - Sistema de Evaluación de Madurez"
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 animate-in fade-in duration-200">
                <div className="font-heading font-black text-base text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  SGD-Madurez
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 truncate">
                  PCM • SGTD • CND
                </div>
              </div>
            )}
          </div>

          {/* BOTÓN COLAPSAR / EXPANDIR */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Expandir menú lateral (Ctrl+B)' : 'Contraer menú lateral (Ctrl+B)'}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex-shrink-0"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* TARJETA USUARIO INSTITUCIONAL AUTENTICADO */}
        {!isSidebarCollapsed ? (
          <div className="m-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${currentUser.rol === 'ADMINISTRADOR'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                }`}>
                {currentUser.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Área Responsable'}
              </span>
              <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400">
                {currentUser.siglas}
              </span>
            </div>
            <div className="font-bold text-xs text-slate-900 dark:text-white truncate" title={currentUser.nombre_completo}>
              {currentUser.nombre_completo}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={currentUser.area}>
              {currentUser.area}
            </div>
          </div>
        ) : (
          <div
            className="mx-2 my-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center cursor-default text-center group relative shadow-xs"
            title={`Usuario: ${currentUser.nombre_completo} (${currentUser.siglas} - ${currentUser.rol})`}
          >
            <span className="font-black text-[10px] text-sky-600 dark:text-sky-400">
              {currentUser.siglas}
            </span>
          </div>
        )}

        {/* NAVEGACIÓN */}
        <nav className={`flex-1 px-2.5 space-y-1.5 overflow-y-auto ${isSidebarCollapsed ? 'flex flex-col items-center py-1' : ''}`}>
          {[
            { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: LayoutDashboard },
            { id: 'matriz', label: 'Matriz de Diagnóstico', icon: CheckSquare, badge: stats ? `${stats.total_respondidas}/${stats.total_preguntas}` : '0/75' },
            { id: 'evidencias', label: 'Inventario Evidencias', icon: FolderGit2, badge: stats ? `${stats.total_evidencias}` : '0' },
            { id: 'plan', label: 'Plan de Acción', icon: Target, badge: iniciativas.length.toString() },
            { id: 'exportar', label: 'Exportación Oficial', icon: DownloadCloud },
            ...(currentUser?.rol === 'ADMINISTRADOR' ? [
              { id: 'usuarios', label: 'Usuarios y Asignaciones', icon: Users, badge: 'Admin' }
            ] : [])
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            if (isSidebarCollapsed) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  title={`${item.label}${item.badge ? ` (${item.badge})` : ''}`}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all cursor-pointer ${isActive
                    ? 'bg-[#1a4066] text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-[9px] font-black rounded-full bg-sky-600 text-white border-2 border-white dark:border-[#0c121e] flex items-center justify-center shadow-xs">
                      {item.badge.includes('/') ? item.badge.split('/')[0] : item.badge}
                    </span>
                  )}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all cursor-pointer ${isActive
                  ? 'bg-[#1a4066] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* PIE DEL SIDEBAR */}
        <div className={`p-3 border-t border-slate-200 dark:border-slate-800 ${isSidebarCollapsed ? 'flex flex-col items-center gap-2.5' : 'space-y-2'
          }`}>
          {!isSidebarCollapsed ? (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 px-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
                <span className="truncate">Motor PCM ({currentUser.siglas})</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Cambiar tema visual"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                  <span>{isDark ? 'Claro' : 'Oscuro'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                  title="Cerrar sesión institucional"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsDark(!isDark)}
                title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* DRAWER MÓVIL (< lg) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#0c121e] border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-heading font-black text-sm text-slate-900 dark:text-white leading-tight">
                    SGD-Madurez
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                    PCM • SGTD • CND
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* USUARIO EN DRAWER MÓVIL */}
            <div className="m-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${currentUser.rol === 'ADMINISTRADOR'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                  }`}>
                  {currentUser.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Área Responsable'}
                </span>
                <span className="font-mono font-bold text-xs text-slate-400">{currentUser.siglas}</span>
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                {currentUser.nombre_completo}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {currentUser.area}
              </div>
            </div>

            <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
              {[
                { id: 'dashboard', label: 'Dashboard Ejecutivo', icon: LayoutDashboard },
                { id: 'matriz', label: 'Matriz de Diagnóstico', icon: CheckSquare, badge: stats ? `${stats.total_respondidas}/${stats.total_preguntas}` : '0/75' },
                { id: 'evidencias', label: 'Inventario Evidencias', icon: FolderGit2, badge: stats ? `${stats.total_evidencias}` : '0' },
                { id: 'plan', label: 'Plan de Acción', icon: Target, badge: iniciativas.length.toString() },
                { id: 'exportar', label: 'Exportación Oficial', icon: DownloadCloud },
                ...(currentUser?.rol === 'ADMINISTRADOR' ? [
                  { id: 'usuarios', label: 'Usuarios y Asignaciones', icon: Users, badge: 'Admin' }
                ] : [])
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all ${isActive
                      ? 'bg-[#1a4066] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <button
                onClick={() => setIsDark(!isDark)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-900 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL: HEADER ESTÁTICO FIJO + MAIN CON SCROLL INDEPENDIENTE */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* TOPBAR ESTÁTICA / FIJA EN TODOS LOS MENÚS */}
        <header className="relative z-40 flex-shrink-0 min-h-[64px] sm:min-h-[70px] bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Botón menú móvil (< lg) */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0"
              title="Abrir menú"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="font-heading font-black text-sm sm:text-lg lg:text-xl text-slate-900 dark:text-white leading-tight truncate">
                {activeTab === 'dashboard' && 'Dashboard Ejecutivo'}
                {activeTab === 'matriz' && 'Matriz de Diagnóstico'}
                {activeTab === 'evidencias' && 'Inventario de Evidencias'}
                {activeTab === 'plan' && 'Plan de Acción'}
                {activeTab === 'exportar' && 'Exportación Oficial'}
                {activeTab === 'usuarios' && 'Gestión de Usuarios y Asignaciones'}
              </h1>
              <p className="hidden md:block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {activeTab === 'usuarios'
                  ? 'Panel Exclusivo de Administrador • Control de accesos y designación de preguntas'
                  : currentUser.rol === 'ADMINISTRADOR'
                    ? 'Vista Global de Administración • 75 preguntas institucionales'
                    : `Evaluando como: ${currentUser.area} (${currentUser.siglas})`}
              </p>
            </div>
          </div>

          {/* DERECHA DEL HEADER: SELECTORES Y USUARIO */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* SELECTOR DE FILTRO DE ÁREA CON DISEÑO CUSTOMSELECT IDÉNTICO A IMAGEN 1 */}
            {activeTab === 'matriz' && currentUser.rol === 'ADMINISTRADOR' && (
              <div className="hidden md:block w-52 sm:w-60 flex-shrink-0 relative z-40">
                <CustomSelect
                  icon={<Filter className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />}
                  prefixLabel="ÁREA:"
                  triggerClassName="w-full bg-white dark:bg-[#0c121e] border border-sky-500 hover:border-sky-400 dark:border-sky-400/90 rounded-full px-3 sm:px-3.5 py-1.5 flex items-center justify-between text-left transition-all shadow-xs cursor-pointer text-xs sm:text-sm"
                  compact={true}
                  dropdownAlign="right"
                  options={areaFiltroOptions}
                  value={adminFiltroArea}
                  onChange={(val) => setAdminFiltroArea(val)}
                  placeholder="Filtrar área..."
                />
              </div>
            )}

            {/* SELECTOR DE DIMENSIÓN A EVALUAR (EN MATRIZ) */}
            {activeTab === 'matriz' && (
              <div className="w-48 sm:w-64 md:w-72 lg:w-80 flex-shrink-0 relative z-40 animate-in fade-in duration-150">
                <CustomSelect
                  triggerClassName="w-full bg-white dark:bg-[#0c121e] border border-sky-500 hover:border-sky-400 dark:border-sky-400/90 rounded-full px-3 sm:px-3.5 py-1.5 flex items-center justify-between text-left transition-all shadow-xs cursor-pointer text-xs sm:text-sm"
                  options={dimensionSelectOptions}
                  value={currentDimension}
                  onChange={(val) => setCurrentDimension(val)}
                  placeholder="Seleccionar dimensión..."
                />
              </div>
            )}

            {/* CHIP DE USUARIO Y LOGOUT EN HEADER */}
            {/* <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] text-white shadow-xs ${
                  currentUser.rol === 'ADMINISTRADOR'
                    ? 'bg-gradient-to-tr from-rose-600 to-amber-600'
                    : 'bg-gradient-to-tr from-sky-600 to-blue-700'
                }`}>
                  {currentUser.siglas.slice(0, 3)}
                </div>
                <div className="text-left min-w-0 max-w-[110px] lg:max-w-[150px]">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                    {currentUser.siglas}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate leading-tight">
                    {currentUser.rol === 'ADMINISTRADOR' ? 'Admin' : 'Área'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión institucional"
                className="p-2 sm:px-2.5 sm:py-1.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-500 hover:text-white hover:bg-rose-600 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div> */}
          </div>
        </header>

        {/* CONTENIDO DE PESTAÑAS (SCROLL INDEPENDIENTE EN TODOS LOS MENÚS) */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 w-full">

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-4 sm:space-y-6">

              {/* KPIS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Puntaje Global</span>
                    <div className="font-heading font-black text-lg sm:text-2xl text-slate-900 dark:text-white">
                      {stats.puntaje_final.toFixed(2)} <span className="text-xs text-slate-400">/ 5.00</span>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-sky-700 dark:text-sky-400 truncate block">
                      {stats.nivel_descriptivo}
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Brecha vs Meta</span>
                    <div className="font-heading font-black text-lg sm:text-2xl text-slate-900 dark:text-white">
                      {stats.brecha_global.toFixed(2)} <span className="text-xs text-slate-400">pts</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate">
                      Meta Oficial: 3.00
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <ListChecks className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avance Diagnóstico</span>
                    <div className="font-heading font-black text-lg sm:text-2xl text-slate-900 dark:text-white">
                      {stats.porcentaje_avance}%
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate">
                      {stats.total_respondidas} de {stats.total_preguntas} respondidas
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Evidencias</span>
                    <div className="font-heading font-black text-lg sm:text-2xl text-slate-900 dark:text-white">
                      {stats.total_evidencias}
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate">
                      {stats.total_validadas} validadas formalmente
                    </span>
                  </div>
                </div>
              </div>

              {/* GRÁFICOS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        Radar de Madurez (8 Dimensiones PCM)
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Capacidades frente a la meta (3.00)</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-2xl text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                      En vivo
                    </span>
                  </div>
                  <RadarChart dimensions={stats.dimensiones} isDark={isDark} />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
                  <div className="mb-3">
                    <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      Desempeño y Brechas por Dimensión
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Puntajes promedio de 0.00 a 5.00</p>
                  </div>
                  <BrechasChart dimensions={stats.dimensiones} isDark={isDark} />
                </div>
              </div>

              {/* DIMENSIONES: VISTA ESCRITORIO (TABLA) + VISTA MÓVIL (CARDS) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      Estado de las 8 Dimensiones del Modelo
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Consolidado oficial de avance y brechas</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('matriz')}
                    className="px-3.5 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold transition-colors"
                  >
                    Ir a Matriz &rarr;
                  </button>
                </div>

                {/* VISTA MÓVIL EN CARDS */}
                <div className="block md:hidden space-y-2.5">
                  {stats.dimensiones.map((d) => {
                    const pct = Math.round((d.respondidas / d.total_preguntas) * 100);
                    return (
                      <div key={d.codigo} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-2xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800">
                            {d.codigo}
                          </span>
                          <span className="font-heading font-black text-sm text-sky-700 dark:text-sky-400">
                            {d.puntaje.toFixed(2)} <span className="text-[10px] text-slate-400">/ 5.00</span>
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {d.nombre}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800">
                          <span>{d.respondidas} de {d.total_preguntas} ({pct}%)</span>
                          <span className={`font-semibold ${d.brecha > 1 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            Brecha: {d.brecha.toFixed(2)} pts
                          </span>
                          <button
                            onClick={() => {
                              setCurrentDimension(d.codigo);
                              setActiveTab('matriz');
                            }}
                            className="px-2.5 py-1 rounded-2xl bg-sky-600 text-white font-bold text-[11px] hover:bg-sky-700"
                          >
                            Evaluar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* VISTA ESCRITORIO EN TABLA */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="pb-3">Cód</th>
                        <th className="pb-3">Dimensión</th>
                        <th className="pb-3">Progreso</th>
                        <th className="pb-3">Puntaje</th>
                        <th className="pb-3">Brecha (Meta 3.0)</th>
                        <th className="pb-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {stats.dimensiones.map((d) => {
                        const pct = Math.round((d.respondidas / d.total_preguntas) * 100);
                        return (
                          <tr key={d.codigo} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 font-bold text-sky-700 dark:text-sky-400">{d.codigo}</td>
                            <td className="py-3 font-bold text-slate-900 dark:text-white">{d.nombre}</td>
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-sky-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-slate-500">{pct}%</span>
                              </div>
                            </td>
                            <td className="py-3 font-heading font-extrabold text-sm sm:text-base text-sky-700 dark:text-sky-400">
                              {d.puntaje.toFixed(2)}
                            </td>
                            <td className="py-3">
                              <span className={`font-semibold ${d.brecha > 1 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {d.brecha.toFixed(2)} pts
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  setCurrentDimension(d.codigo);
                                  setActiveTab('matriz');
                                }}
                                className="px-3 py-1.5 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 font-bold text-xs hover:bg-sky-100 transition-colors"
                              >
                                Evaluar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATRIZ DE DIAGNÓSTICO */}
          {activeTab === 'matriz' && (
            <div className="space-y-4 sm:space-y-6">

              {/* LAYOUT FLUIDO A PANTALLA COMPLETA: PANEL IZQUIERDO VERTICAL + TARJETA DE PREGUNTA A LA DERECHA */}
              <div className="flex flex-col lg:flex-row gap-5 items-start w-full">

                {/* 1. PANEL IZQUIERDO VERTICAL: BANNER DIMENSIÓN + RESUMEN SEMÁFORO + ÍNDICE DE PREGUNTAS */}
                <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 lg:sticky lg:top-0 space-y-3.5">

                  {/* TARJETA DE RESUMEN DE LA DIMENSIÓN ACTUAL */}
                  {curDimObj && (
                    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-3.5 flex items-center justify-between gap-3 transition-all">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-heading font-black text-sm shadow-md shadow-blue-500/20 flex-shrink-0">
                          {curDimObj.codigo}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/60">
                              Dimensión Activa
                            </span>
                          </div>
                          <h2 className="font-heading font-bold text-xs sm:text-sm text-slate-800 dark:text-white truncate leading-snug">
                            {curDimObj.nombre}
                          </h2>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {curDimObj.total_preguntas} componentes obligatorios PCM
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 px-2.5 py-1.5 rounded-2xl text-center flex-shrink-0 shadow-xs">
                        <span className="font-heading font-black text-sm sm:text-base text-blue-600 dark:text-blue-400 block leading-none">
                          {curDimObj.puntaje.toFixed(2)}
                        </span>
                        <span className="text-[8px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider mt-0.5">
                          / 5.00 pts
                        </span>
                      </div>
                    </div>
                  )}

                  {/* RESUMEN DE PROGRESO Y SEMÁFORO */}
                  <DimensionSummaryCard
                    preguntas={preguntas}
                    dimensionCodigo={currentDimension}
                  />

                  {/* NAVEGADOR DE PREGUNTAS SEMÁFORO */}
                  <QuestionNavigator
                    preguntas={preguntas}
                    activeCodigo={activePreguntaCodigo || preguntas[0]?.codigo || '1.1'}
                    onSelectPregunta={(cod) => setActivePreguntaCodigo(cod)}
                    dimensionCodigo={currentDimension}
                  />
                </div>

                {/* 2. PANEL DERECHO: TARJETA DE PREGUNTA OCUPA EL 100% DEL ESPACIO RESTANTE */}
                <div className="flex-1 min-w-0 w-full">
                  {preguntas.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 sm:p-14 text-center shadow-xs space-y-3 animate-in fade-in duration-200">
                      <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto shadow-inner">
                        <ShieldCheck className="w-7 h-7" />
                      </div>
                      <h3 className="font-heading font-black text-base text-slate-800 dark:text-white">
                        Sin preguntas asignadas en esta dimensión
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                        El área <span className="font-bold text-sky-600 dark:text-sky-400">{currentUser?.siglas}</span> no cuenta con preguntas de evaluación asignadas en <span className="font-semibold text-slate-700 dark:text-slate-300">{curDimObj?.nombre || currentDimension}</span>. Selecciona otra dimensión activa en el selector superior para continuar con tu diagnóstico.
                      </p>
                    </div>
                  ) : (() => {
                    const currentIdx = Math.max(0, preguntas.findIndex(q => q.codigo === (activePreguntaCodigo || preguntas[0]?.codigo)));
                    const currentQ = preguntas[currentIdx] || preguntas[0];
                    if (!currentQ) return null;

                    return (
                      <div className="transition-all duration-200 w-full">
                        <QuestionCard
                          key={currentQ.codigo}
                          pregunta={currentQ}
                          onSaveRespuesta={handleSaveRespuesta}
                          onOpenEvidencias={(codigo) => {
                            setPreselectedPreguntaCodigo(codigo);
                            setIsEvidenciaModalOpen(true);
                          }}
                          onPrevQuestion={() => {
                            if (currentIdx > 0) setActivePreguntaCodigo(preguntas[currentIdx - 1].codigo);
                          }}
                          onNextQuestion={() => {
                            if (currentIdx < preguntas.length - 1) setActivePreguntaCodigo(preguntas[currentIdx + 1].codigo);
                          }}
                          hasPrev={currentIdx > 0}
                          hasNext={currentIdx < preguntas.length - 1}
                          currentIndex={currentIdx}
                          totalInDimension={preguntas.length}
                          isSingleMode={true}
                          userRole={currentUser?.rol}
                          onAssignArea={handleAssignArea}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTARIO DE EVIDENCIAS */}
          {activeTab === 'evidencias' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">

                {/* FILTROS CON CUSTOMSELECT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <CustomSelect
                    label="FILTRAR POR DIMENSIÓN *"
                    options={filtroDimOptions}
                    value={filtroEvidenciaDim}
                    onChange={setFiltroEvidenciaDim}
                  />

                  <CustomSelect
                    label="ESTADO DE VALIDACIÓN *"
                    options={filtroEstadoOptions}
                    value={filtroEvidenciaEstado}
                    onChange={setFiltroEvidenciaEstado}
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                  <input
                    type="text"
                    value={filtroEvidenciaSearch}
                    onChange={(e) => setFiltroEvidenciaSearch(e.target.value)}
                    placeholder="Buscar evidencia por título, responsable o código..."
                    className="w-full sm:w-80 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400"
                  />
                  <a
                    href="/api/exportar/evidencias-excel"
                    download
                    onClick={() => toast.info("Generando archivo Excel consolidado de evidencias...")}
                    className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Descargar Excel Oficial (8 Pestañas)</span>
                  </a>
                </div>

                {/* VISTA MÓVIL EN CARDS (SOLUCIONA IMAGEN 2) */}
                <div className="block md:hidden space-y-3">
                  {evidenciasFiltradas.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No hay evidencias registradas con los filtros actuales.
                    </div>
                  ) : (
                    evidenciasFiltradas.map((ev) => (
                      <div key={ev.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-2xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800">
                            Pregunta {ev.pregunta_codigo}
                          </span>
                          <span className={`px-2 py-0.5 rounded-2xl text-[10px] font-bold ${ev.estado_validacion === 'Validado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : ev.estado_validacion === 'Observado'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                            {ev.estado_validacion}
                          </span>
                        </div>

                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {ev.nombre_evidencia}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">
                          {ev.descripcion}
                        </div>

                        <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                          <span>{ev.area_unidad}</span>
                          <span className="font-semibold">{ev.responsable}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1.5">
                          <a
                            href={ev.ruta_o_enlace}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 font-bold text-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Abrir archivo / enlace</span>
                          </a>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleValidarEvidencia(ev, 'Validado')}
                              title="Marcar como Validado"
                              className="p-1.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminarEvidencia(ev.id)}
                              title="Eliminar"
                              className="p-1.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* VISTA ESCRITORIO EN TABLA */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="pb-3">Cód.</th>
                        <th className="pb-3">Nombre de la Evidencia</th>
                        <th className="pb-3">Tipo</th>
                        <th className="pb-3">Área / Unidad</th>
                        <th className="pb-3">Responsable</th>
                        <th className="pb-3">Enlace</th>
                        <th className="pb-3">Estado</th>
                        <th className="pb-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {evidenciasFiltradas.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-slate-400">
                            No se encontraron evidencias registradas.
                          </td>
                        </tr>
                      ) : (
                        evidenciasFiltradas.map((ev) => (
                          <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-3 font-bold text-sky-700 dark:text-sky-400">{ev.pregunta_codigo}</td>
                            <td className="py-3">
                              <div className="font-bold text-slate-900 dark:text-white">{ev.nombre_evidencia}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">{ev.descripcion}</div>
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-2xl text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {ev.tipo_evidencia}
                              </span>
                            </td>
                            <td className="py-3 text-slate-600 dark:text-slate-400">{ev.area_unidad}</td>
                            <td className="py-3 text-slate-700 dark:text-slate-300">{ev.responsable}</td>
                            <td className="py-3">
                              <a
                                href={ev.ruta_o_enlace}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-bold text-xs"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Ver</span>
                              </a>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-2xl text-[10px] font-bold ${ev.estado_validacion === 'Validado'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : ev.estado_validacion === 'Observado'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                {ev.estado_validacion}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleValidarEvidencia(ev, 'Validado')}
                                  title="Marcar como Validado"
                                  className="p-1.5 rounded-2xl text-emerald-600 hover:bg-emerald-50"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEliminarEvidencia(ev.id)}
                                  title="Eliminar"
                                  className="p-1.5 rounded-2xl text-rose-600 hover:bg-rose-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PLAN DE ACCIÓN */}
          {activeTab === 'plan' && (
            <div className="space-y-4 sm:space-y-6">

              {/* CONFIGURACIÓN INSTITUCIONAL */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 gap-2">
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-lg text-slate-900 dark:text-white">
                      Identificación Institucional y OGD
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Datos inyectados en la carátula y cuerpo del Plan de Acción
                    </p>
                  </div>
                  <button
                    onClick={handleGuardarConfigPlan}
                    className="px-4 py-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                  >
                    Guardar Datos
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Nombre de la Entidad
                    </label>
                    <input
                      type="text"
                      value={configInst.entidad_nombre}
                      onChange={(e) => setConfigInst({ ...configInst, entidad_nombre: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Siglas Institucionales
                    </label>
                    <input
                      type="text"
                      value={configInst.siglas}
                      onChange={(e) => setConfigInst({ ...configInst, siglas: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Período de Vigencia
                    </label>
                    <input
                      type="text"
                      value={configInst.periodo}
                      onChange={(e) => setConfigInst({ ...configInst, periodo: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Oficial de Gobierno de Datos (OGD)
                    </label>
                    <input
                      type="text"
                      value={configInst.ogd_nombre}
                      onChange={(e) => setConfigInst({ ...configInst, ogd_nombre: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Puesto del OGD
                    </label>
                    <input
                      type="text"
                      value={configInst.ogd_puesto}
                      onChange={(e) => setConfigInst({ ...configInst, ogd_puesto: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Resolución CGTD
                    </label>
                    <input
                      type="text"
                      value={configInst.resolucion_cgtd}
                      onChange={(e) => setConfigInst({ ...configInst, resolucion_cgtd: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* INICIATIVAS: VISTA ESCRITORIO (TABLA) + VISTA MÓVIL (CARDS) (SOLUCIONA IMAGEN 2) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800 mb-4 gap-2">
                  <div>
                    <h3 className="font-heading font-bold text-sm sm:text-lg text-slate-900 dark:text-white">
                      Iniciativas Priorizadas (ENGD 2026–2030)
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Matriz de ponderaciones, costos y cumplimiento institucional
                    </p>
                  </div>
                  <a
                    href="/api/exportar/plan-docx"
                    download
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-sky-600" />
                    <span>Descargar Word Oficial (.docx)</span>
                  </a>
                </div>

                {/* VISTA MÓVIL EN CARDS (SOLUCIONA IMAGEN 2 AL 100%) */}
                <div className="block md:hidden space-y-3">
                  {iniciativas.map((init) => (
                    <div key={init.id} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-sky-700 dark:text-sky-400 px-2 py-0.5 rounded-2xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-800">
                          {init.codigo}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-2xl text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {init.plazo}
                          </span>
                          <span className="px-2 py-0.5 rounded-2xl text-[10px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300">
                            {init.eje_engd.split(':')[0]}
                          </span>
                        </div>
                      </div>

                      <div className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                        {init.nombre}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {init.descripcion}
                      </div>

                      {/* Barra de progreso */}
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-semibold">
                          <span>Avance real: {init.avance_porcentaje}%</span>
                          <span>Peso relativo: {init.peso_relativo}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${init.avance_porcentaje}%` }} />
                        </div>
                      </div>

                      {/* Footer con Métricas */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Responsable</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block max-w-[150px]">
                            {init.responsable}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Costo Proy.</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            S/ {init.costo_proyectado.toLocaleString('es-PE')}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[9px] uppercase font-bold">Índice Pond.</span>
                          <span className="font-heading font-black text-xs text-sky-600 dark:text-sky-400">
                            {init.indice_ponderado}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VISTA ESCRITORIO EN TABLA */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <th className="pb-3">Cód</th>
                        <th className="pb-3">Iniciativa / Proyecto</th>
                        <th className="pb-3">Eje ENGD</th>
                        <th className="pb-3">Plazo</th>
                        <th className="pb-3">Responsable</th>
                        <th className="pb-3">Peso (%)</th>
                        <th className="pb-3">Avance (%)</th>
                        <th className="pb-3">Costo Proy. (S/)</th>
                        <th className="pb-3 text-right">Índice Pond.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                      {iniciativas.map((init) => (
                        <tr key={init.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 font-bold text-sky-700 dark:text-sky-400">{init.codigo}</td>
                          <td className="py-3">
                            <div className="font-bold text-slate-900 dark:text-white">{init.nombre}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{init.descripcion}</div>
                          </td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">{init.eje_engd.split(':')[0]}</td>
                          <td className="py-3 text-slate-600 dark:text-slate-400">{init.plazo}</td>
                          <td className="py-3 text-slate-700 dark:text-slate-300">{init.responsable}</td>
                          <td className="py-3 font-bold">{init.peso_relativo}%</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${init.avance_porcentaje}%` }} />
                              </div>
                              <span className="text-xs font-bold">{init.avance_porcentaje}%</span>
                            </div>
                          </td>
                          <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                            S/ {init.costo_proyectado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-right font-heading font-black text-sky-700 dark:text-sky-400">
                            {init.indice_ponderado}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EXPORTACIÓN OFICIAL */}
          {activeTab === 'exportar' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs text-center flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                  Matriz de Evaluación Oficial PCM
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                  Plantilla Excel oficial con las 75 preguntas evaluadas, fórmulas nativas de promedios y justificaciones inyectadas.
                </p>
                <a
                  href="/api/exportar/matriz-excel"
                  download
                  onClick={() => toast.info("Iniciando descarga de la Matriz de Evaluación Oficial PCM en Excel...")}
                  className="w-full py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Descargar Matriz Excel</span>
                </a>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs text-center flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-3">
                  <FolderGit2 className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                  Inventario de Evidencias Digitales
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                  Plantilla Excel consolidada con las 8 pestañas temáticas (D1 a D8) y todos los medios de verificación registrados.
                </p>
                <a
                  href="/api/exportar/evidencias-excel"
                  download
                  onClick={() => toast.info("Iniciando descarga del Inventario Consolidado de Evidencias...")}
                  className="w-full py-2.5 sm:py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Descargar Inventario Excel</span>
                </a>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xs text-center flex flex-col items-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1.5">
                  Plan de Acción Formal (Word .docx)
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                  Documento formal en plantilla Word de la PCM con diagnóstico, tablas de brechas y cronograma de iniciativas listo para firma.
                </p>
                <a
                  href="/api/exportar/plan-docx"
                  download
                  onClick={() => toast.info("Generando y descargando Plan de Acción Formal en Word (.docx)...")}
                  className="w-full py-2.5 sm:py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <DownloadCloud className="w-4 h-4" />
                  <span>Descargar Plan de Acción Word</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 6: GESTIÓN DE USUARIOS Y ASIGNACIONES (SOLO ADMINISTRADOR) */}
          {activeTab === 'usuarios' && currentUser?.rol === 'ADMINISTRADOR' && (
            <AdminUsersModule
              onRefreshAllData={() => {
                loadAllData();
                loadPreguntas(currentDimension);
              }}
            />
          )}
        </main>
      </div>

      {/* MODAL DE EVIDENCIAS */}
      <EvidenciasModal
        isOpen={isEvidenciaModalOpen}
        onClose={() => setIsEvidenciaModalOpen(false)}
        preguntas={preguntas}
        initialCodigo={preselectedPreguntaCodigo}
        onSaveEvidencia={handleSaveEvidencia}
      />

      {/* CONTENEDOR GLOBAL REACT-TOASTIFY */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
      />
    </div>
  );
};

export default App;
