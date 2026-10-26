import React, { useState, useEffect, useMemo } from 'react';
import { UsuarioItem, Pregunta, Dimension } from '../types';
import { toast } from 'react-toastify';
import {
  Users,
  UserPlus,
  Key,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Layers,
  ArrowRightLeft,
  RefreshCw,
  Lock,
  Building2,
  Shield,
  ShieldAlert,
  Save,
  X,
  FileCheck2,
  AlertCircle
} from 'lucide-react';
import { CustomSelect, SelectOption } from './CustomSelect';

interface AdminUsersModuleProps {
  onRefreshAllData?: () => void;
}

const AVAILABLE_AREAS = [
  { value: 'OTI', label: 'OTI - Oficina de Tecnologías de la Información' },
  { value: 'OAJ', label: 'OAJ - Oficina de Asesoría Jurídica' },
  { value: 'UPM', label: 'UPM - Unidad de Planeamiento y Modernización' },
  { value: 'UP', label: 'UP - Unidad de Presupuesto' },
  { value: 'UE', label: 'UE - Unidad de Estadística' },
  { value: 'URH', label: 'URH - Unidad de Recursos Humanos' },
  { value: 'ADMIN', label: 'ADMIN - Administración General' }
];

const AREA_SELECT_OPTIONS: SelectOption[] = [
  { value: 'OTI', label: 'OTI', subtitle: 'Oficina de Tecnologías de la Información' },
  { value: 'OAJ', label: 'OAJ', subtitle: 'Oficina de Asesoría Jurídica' },
  { value: 'UPM', label: 'UPM', subtitle: 'Unidad de Planeamiento y Modernización' },
  { value: 'UP', label: 'UP', subtitle: 'Unidad de Presupuesto' },
  { value: 'UE', label: 'UE', subtitle: 'Unidad de Estadística' },
  { value: 'URH', label: 'URH', subtitle: 'Unidad de Recursos Humanos' },
  { value: 'ADMIN', label: 'ADMIN', subtitle: 'Administración General' }
];

const ROL_SELECT_OPTIONS: SelectOption[] = [
  { value: 'AREA_RESPONSABLE', label: 'Área Responsable', subtitle: 'Responde y evalúa preguntas designadas' },
  { value: 'ADMINISTRADOR', label: 'Administrador', subtitle: 'Control total de usuarios y asignaciones' }
];

export const AdminUsersModule: React.FC<AdminUsersModuleProps> = ({ onRefreshAllData }) => {
  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'asignaciones'>('usuarios');

  // Estados de datos
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [dimensiones, setDimensiones] = useState<Dimension[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filtros de asignaciones
  const [filtroDim, setFiltroDim] = useState<string>('TODAS');
  const [filtroArea, setFiltroArea] = useState<string>('TODAS');
  const [filtroSearch, setFiltroSearch] = useState<string>('');
  const [selectedCodigos, setSelectedCodigos] = useState<string[]>([]);
  const [masivoTargetArea, setMasivoTargetArea] = useState<string>('OTI');
  const [isApplyingMasivo, setIsApplyingMasivo] = useState<boolean>(false);

  // Opciones formateadas estilo Imagen 2 para los filtros
  const filtroDimOptions: SelectOption[] = useMemo(() => [
    { value: 'TODAS', label: 'Todas las Dimensiones (D1 a D8)', subtitle: 'Ver preguntas de todas las dimensiones' },
    ...dimensiones.map(d => ({
      value: d.codigo,
      label: `${d.codigo} - ${d.nombre}`,
      subtitle: `Dimensión ${d.codigo}`
    }))
  ], [dimensiones]);

  const filtroAreaOptions: SelectOption[] = useMemo(() => [
    { value: 'TODAS', label: 'Todas las Áreas Responsables', subtitle: 'Sin filtrar por área' },
    ...AREA_SELECT_OPTIONS
  ], []);

  // Modales de Usuarios
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioItem | null>(null);

  // Formulario de Usuario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre_completo: '',
    siglas: 'OTI',
    rol: 'AREA_RESPONSABLE',
    area: '',
    activo: 1
  });
  const [newPassword, setNewPassword] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resUsers, resPregs, resDims] = await Promise.all([
        fetch('/api/auth/usuarios').then(r => r.json()),
        fetch('/api/preguntas').then(r => r.json()),
        fetch('/api/dimensiones').then(r => r.json())
      ]);
      setUsuarios(resUsers || []);
      setPreguntas(resPregs || []);
      setDimensiones(resDims || []);
    } catch (err) {
      console.error(err);
      toast.error('Error al cargar la información de administración');
    } finally {
      setLoading(false);
    }
  };

  // Resumen de distribución de preguntas por área
  const areaDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      OTI: 0,
      OAJ: 0,
      UPM: 0,
      UP: 0,
      UE: 0,
      URH: 0,
      ADMIN: 0
    };
    preguntas.forEach(p => {
      const a = (p.area_responsable || 'OTI').toUpperCase();
      counts[a] = (counts[a] || 0) + 1;
    });
    return counts;
  }, [preguntas]);

  // Preguntas filtradas para la tabla de asignaciones
  const filteredPreguntas = useMemo(() => {
    return preguntas.filter(p => {
      if (filtroDim !== 'TODAS' && p.dimension_codigo !== filtroDim) return false;
      if (filtroArea !== 'TODAS' && (p.area_responsable || 'OTI') !== filtroArea) return false;
      if (filtroSearch.trim()) {
        const q = filtroSearch.toLowerCase();
        const matchCode = p.codigo.toLowerCase().includes(q);
        const matchTitle = (p.titulo || '').toLowerCase().includes(q);
        const matchEnunciado = p.enunciado.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchEnunciado) return false;
      }
      return true;
    });
  }, [preguntas, filtroDim, filtroArea, filtroSearch]);

  // Manejador: Asignación individual
  const handleAssignSingle = async (codigo: string, nuevaArea: string) => {
    try {
      const res = await fetch(`/api/preguntas/${codigo}/asignar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area_responsable: nuevaArea })
      });
      if (!res.ok) throw new Error('Error al asignar el área');

      // Actualización optimista local
      setPreguntas(prev => prev.map(p => p.codigo === codigo ? { ...p, area_responsable: nuevaArea } : p));
      toast.success(`Pregunta ${codigo} asignada a ${nuevaArea}`);

      // Refrescar lista de usuarios para actualizar contadores
      fetch('/api/auth/usuarios')
        .then(r => r.json())
        .then(data => setUsuarios(data))
        .catch(() => { });

      if (onRefreshAllData) onRefreshAllData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al reasignar pregunta');
    }
  };

  // Manejador: Asignación Masiva
  const handleApplyMasivo = async () => {
    if (selectedCodigos.length === 0) {
      toast.warning('Selecciona al menos una pregunta para reasignar');
      return;
    }

    setIsApplyingMasivo(true);
    try {
      const res = await fetch('/api/preguntas/asignacion-masiva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigos: selectedCodigos,
          area_responsable: masivoTargetArea
        })
      });
      if (!res.ok) throw new Error('Error en la asignación masiva');
      const data = await res.json();

      toast.success(`${data.total_actualizadas || selectedCodigos.length} preguntas asignadas a ${masivoTargetArea}`);
      setSelectedCodigos([]);
      await loadData();
      if (onRefreshAllData) onRefreshAllData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al aplicar asignación masiva');
    } finally {
      setIsApplyingMasivo(false);
    }
  };

  // Manejador selección checkboxes
  const handleToggleSelectAll = () => {
    if (selectedCodigos.length === filteredPreguntas.length) {
      setSelectedCodigos([]);
    } else {
      setSelectedCodigos(filteredPreguntas.map(p => p.codigo));
    }
  };

  const handleToggleSelectOne = (codigo: string) => {
    setSelectedCodigos(prev =>
      prev.includes(codigo) ? prev.filter(c => c !== codigo) : [...prev, codigo]
    );
  };

  // Manejador: Crear Usuario
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim() || !formData.nombre_completo.trim()) {
      toast.warning('Completa los campos obligatorios');
      return;
    }

    try {
      const res = await fetch('/api/auth/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al crear usuario');
      }
      toast.success(`Usuario @${formData.username} registrado exitosamente`);
      setIsCreateModalOpen(false);
      setFormData({
        username: '',
        password: '',
        nombre_completo: '',
        siglas: 'OTI',
        rol: 'AREA_RESPONSABLE',
        area: '',
        activo: 1
      });
      await loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al registrar usuario');
    }
  };

  // Manejador: Editar Usuario
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/auth/usuarios/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_completo: formData.nombre_completo,
          siglas: formData.siglas,
          rol: formData.rol,
          area: formData.area,
          activo: formData.activo
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al actualizar usuario');
      }
      toast.success(`Datos del usuario @${selectedUser.username} actualizados`);
      setIsEditModalOpen(false);
      setSelectedUser(null);
      await loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al actualizar usuario');
    }
  };

  // Manejador: Cambiar Contraseña
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword.trim()) {
      toast.warning('Ingresa la nueva contraseña');
      return;
    }

    try {
      const res = await fetch(`/api/auth/usuarios/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      if (!res.ok) throw new Error('Error al actualizar contraseña');
      toast.success(`Contraseña de @${selectedUser.username} cambiada correctamente`);
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setSelectedUser(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al cambiar contraseña');
    }
  };

  // Manejador: Activar/Desactivar
  const handleToggleActivo = async (user: UsuarioItem) => {
    if (user.username === 'admin') {
      toast.info('No es posible desactivar la cuenta del Administrador principal');
      return;
    }

    try {
      const res = await fetch(`/api/auth/usuarios/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al cambiar estado del usuario');
      const data = await res.json();
      toast.info(data.activo === 1 ? `Usuario @${user.username} reactivado` : `Usuario @${user.username} desactivado`);
      await loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al actualizar estado');
    }
  };

  const openEditModal = (user: UsuarioItem) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      nombre_completo: user.nombre_completo,
      siglas: user.siglas,
      rol: user.rol,
      area: user.area,
      activo: user.activo
    });
    setIsEditModalOpen(true);
  };

  const openPasswordModal = (user: UsuarioItem) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ENCABEZADO DEL MÓDULO ADMINISTRATIVO */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-sky-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-amber-300" />
                Módulo Exclusivo de Administrador
              </span>
              <span className="text-xs text-slate-400">• Modelo ENGD PCM</span>
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
              Gestión de Usuarios, Roles y Asignación de Preguntas
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Administra los accesos institucionales, habilita o revoca cuentas de usuario y designa formalmente la responsabilidad de las 75 preguntas de evaluación a cada área competente.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setFormData({
                  username: '',
                  password: '',
                  nombre_completo: '',
                  siglas: 'OTI',
                  rol: 'AREA_RESPONSABLE',
                  area: '',
                  activo: 1
                });
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
            <button
              onClick={loadData}
              title="Refrescar datos"
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* NAVEGACIÓN ENTRE SUB-PESTAÑAS */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('usuarios')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'usuarios'
                ? 'bg-white text-slate-900 shadow-md font-black'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuarios y Accesos Institucionales ({usuarios.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('asignaciones')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${activeSubTab === 'asignaciones'
                ? 'bg-white text-slate-900 shadow-md font-black'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Matriz de Asignación de Preguntas (75)</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: USUARIOS Y ACCESOS */}
      {/* ======================================================== */}
      {activeSubTab === 'usuarios' && (
        <div className="space-y-6">

          {/* TARJETAS RESUMEN KPIS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Cuentas</span>
                <span className="font-heading font-black text-xl text-slate-900 dark:text-white">{usuarios.length}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Administradores</span>
                <span className="font-heading font-black text-xl text-slate-900 dark:text-white">
                  {usuarios.filter(u => u.rol === 'ADMINISTRADOR').length}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Áreas Evaluadoras</span>
                <span className="font-heading font-black text-xl text-slate-900 dark:text-white">
                  {usuarios.filter(u => u.rol === 'AREA_RESPONSABLE').length}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Usuarios Activos</span>
                <span className="font-heading font-black text-xl text-emerald-600 dark:text-emerald-400">
                  {usuarios.filter(u => u.activo === 1).length}
                </span>
              </div>
            </div>
          </div>

          {/* TABLA PRINCIPAL DE USUARIOS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                  Listado de Usuarios y Responsables Institucionales
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Credenciales y permisos para el acceso al sistema de diagnóstico.
                </p>
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Mostrando <span className="font-bold text-sky-600 dark:text-sky-400">{usuarios.length}</span> usuarios
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Nombre Completo y Área</th>
                    <th className="py-3 px-4">Siglas</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4 text-center">Preguntas</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs">
                            {u.siglas.slice(0, 3)}
                          </span>
                          <span>@{u.username}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white leading-tight">
                          {u.nombre_completo}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {u.area}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {u.siglas}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${u.rol === 'ADMINISTRADOR'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                          }`}>
                          {u.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Área Responsable'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                          {u.total_preguntas || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActivo(u)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all ${u.activo === 1
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                          title={u.activo === 1 ? 'Clic para desactivar' : 'Clic para activar'}
                        >
                          {u.activo === 1 ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Inactivo</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openPasswordModal(u)}
                            title="Cambiar contraseña"
                            className="p-1.5 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            title="Editar datos de usuario"
                            className="p-1.5 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: ASIGNACIÓN DE PREGUNTAS POR ÁREA */}
      {/* ======================================================== */}
      {activeSubTab === 'asignaciones' && (
        <div className="space-y-6">

          {/* DISTRIBUCIÓN DE PREGUNTAS POR ÁREA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Distribución de las 75 Preguntas por Competencia Institucional
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {[
                { siglas: 'OTI', label: 'Tecnologías', count: areaDistribution.OTI || 0, color: 'sky' },
                { siglas: 'OAJ', label: 'Asesoría Jurídica', count: areaDistribution.OAJ || 0, color: 'purple' },
                { siglas: 'UPM', label: 'Planeamiento', count: areaDistribution.UPM || 0, color: 'blue' },
                { siglas: 'UP', label: 'Presupuesto', count: areaDistribution.UP || 0, color: 'emerald' },
                { siglas: 'UE', label: 'Estadística', count: areaDistribution.UE || 0, color: 'teal' },
                { siglas: 'URH', label: 'Recursos Humanos', count: areaDistribution.URH || 0, color: 'amber' },
                { siglas: 'ADMIN', label: 'Comité / Admin', count: areaDistribution.ADMIN || 0, color: 'rose' }
              ].map((item) => (
                <div
                  key={item.siglas}
                  onClick={() => setFiltroArea(filtroArea === item.siglas ? 'TODAS' : item.siglas)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${filtroArea === item.siglas
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/60 shadow-sm scale-102'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-slate-300'
                    }`}
                >
                  <span className="font-mono font-black text-xs text-slate-800 dark:text-slate-200 block">
                    {item.siglas}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                    {item.label}
                  </span>
                  <div className="font-heading font-black text-base text-sky-700 dark:text-sky-400 mt-1">
                    {item.count} <span className="text-[10px] text-slate-400 font-normal">preg.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HERRAMIENTAS DE FILTRADO Y ASIGNACIÓN MASIVA */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4">

            {/* FILTROS SUPERIORES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Buscador */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={filtroSearch}
                  onChange={(e) => setFiltroSearch(e.target.value)}
                  placeholder="Buscar código (ej. 1.1) o enunciado..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Filtro Dimensión */}
              <CustomSelect
                value={filtroDim}
                onChange={setFiltroDim}
                options={filtroDimOptions}
                icon={<Layers className="w-4 h-4 text-sky-500" />}
                prefixLabel="DIM:"
                compact={true}
              />

              {/* Filtro Área */}
              <CustomSelect
                value={filtroArea}
                onChange={setFiltroArea}
                options={filtroAreaOptions}
                icon={<Filter className="w-4 h-4 text-sky-500" />}
                prefixLabel="ÁREA:"
                compact={true}
              />
            </div>

            {/* BARRA DE ASIGNACIÓN MASIVA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleToggleSelectAll}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {selectedCodigos.length === filteredPreguntas.length && filteredPreguntas.length > 0
                    ? 'Deseleccionar todas'
                    : `Seleccionar visibles (${filteredPreguntas.length})`}
                </button>
                <span className="text-xs font-semibold text-slate-500">
                  <span className="font-black text-sky-600 dark:text-sky-400">{selectedCodigos.length}</span> seleccionadas
                </span>
              </div>

              {selectedCodigos.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Reasignar a:</span>
                  <div className="w-48">
                    <CustomSelect
                      value={masivoTargetArea}
                      onChange={setMasivoTargetArea}
                      options={AREA_SELECT_OPTIONS}
                      compact={true}
                      dropdownAlign="left"
                      menuClassName="w-64"
                    />
                  </div>
                  <button
                    onClick={handleApplyMasivo}
                    disabled={isApplyingMasivo}
                    className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>{isApplyingMasivo ? 'Aplicando...' : 'Aplicar a Selección'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TABLA DE PREGUNTAS Y DESIGNACIÓN */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/40">
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCodigos.length > 0 && selectedCodigos.length === filteredPreguntas.length}
                        onChange={handleToggleSelectAll}
                        className="rounded text-sky-600 cursor-pointer"
                      />
                    </th>
                    <th className="py-3 px-3 w-16">Cód.</th>
                    <th className="py-3 px-3 w-20">Dim.</th>
                    <th className="py-3 px-4">Pregunta / Enunciado Oficial PCM</th>
                    <th className="py-3 px-4 w-44">Área Responsable</th>
                    <th className="py-3 px-4 w-32 text-center">Reasignar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredPreguntas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                        No se encontraron preguntas con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredPreguntas.map((p) => {
                      const isSelected = selectedCodigos.includes(p.codigo);
                      return (
                        <tr
                          key={p.codigo}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${isSelected ? 'bg-sky-50/40 dark:bg-sky-950/20' : ''
                            }`}
                        >
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectOne(p.codigo)}
                              className="rounded text-sky-600 cursor-pointer"
                            />
                          </td>

                          <td className="py-3 px-3 font-mono font-black text-slate-900 dark:text-white">
                            {p.codigo}
                          </td>

                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              {p.dimension_codigo}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            {p.titulo && (
                              <div className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                                {p.titulo}
                              </div>
                            )}
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {p.enunciado}
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                              <Building2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                              <span>{p.area_responsable || 'OTI'}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <div className="inline-block min-w-[105px]">
                              <CustomSelect
                                value={p.area_responsable || 'OTI'}
                                onChange={(val) => handleAssignSingle(p.codigo, val)}
                                options={AREA_SELECT_OPTIONS}
                                compact={true}
                                dropdownAlign="right"
                                menuClassName="w-64 text-left"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: REGISTRAR NUEVO USUARIO */}
      {/* ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                    Registrar Nuevo Usuario Institucional
                  </h3>
                  <p className="text-xs text-slate-500">Crea credenciales de acceso para un evaluador o área.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                  Nombre Completo u Oficina *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  placeholder="Ej. Oficina de Asesoría Jurídica"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                    Usuario de Acceso *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="ej. oaj_evaluador"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                    Contraseña Inicial *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <CustomSelect
                    label="Siglas Institucionales *"
                    value={formData.siglas}
                    onChange={(val) => setFormData({ ...formData, siglas: val })}
                    options={AREA_SELECT_OPTIONS}
                    compact={true}
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Rol en el Sistema *"
                    value={formData.rol}
                    onChange={(val) => setFormData({ ...formData, rol: val })}
                    options={ROL_SELECT_OPTIONS}
                    compact={true}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                  Área / Unidad Orgánica Detallada
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Ej. Oficina de Asesoría Jurídica (OAJ)"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Usuario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDITAR USUARIO */}
      {/* ======================================================== */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base text-slate-900 dark:text-white">
                    Editar Datos: @{selectedUser.username}
                  </h3>
                  <p className="text-xs text-slate-500">Actualiza las asignaciones y permisos de este perfil.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                  Nombre Completo u Oficina
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_completo}
                  onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <CustomSelect
                    label="Siglas"
                    value={formData.siglas}
                    onChange={(val) => setFormData({ ...formData, siglas: val })}
                    options={AREA_SELECT_OPTIONS}
                    compact={true}
                  />
                </div>

                <div>
                  <CustomSelect
                    label="Rol"
                    value={formData.rol}
                    onChange={(val) => setFormData({ ...formData, rol: val })}
                    options={ROL_SELECT_OPTIONS}
                    compact={true}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1 uppercase tracking-wider">
                  Área / Unidad Orgánica
                </label>
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Actualizar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CAMBIAR CONTRASEÑA */}
      {/* ======================================================== */}
      {isPasswordModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-500" />
                <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white">
                  Restablecer Contraseña
                </h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Ingresa la nueva clave para el usuario <strong className="text-slate-800 dark:text-slate-200 font-mono">@{selectedUser.username}</strong> ({selectedUser.siglas}):
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Guardar Clave</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
