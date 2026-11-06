import React, { useState } from 'react';
import { UserSession } from '../types';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  Sun,
  Moon,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Check,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'react-toastify';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  isDark,
  onToggleTheme
}) => {
  // Estados para inicio de sesión estándar
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para el flujo de cambio obligatorio de contraseña en primer ingreso
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserSession | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);

  // Validación de inicio de sesión estándar
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      toast.warning('Por favor ingrese su usuario y contraseña institucional.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || 'Credenciales inválidas');
      }

      // Si el usuario requiere cambio de contraseña por primer ingreso
      if (data.debe_cambiar_password) {
        setPendingUser(data.user);
        setCurrentPassword(p);
        setNewPassword('');
        setConfirmPassword('');
        setMustChangePassword(true);
        toast.info('Primer acceso detectado: Debe actualizar su contraseña para continuar.');
      } else {
        toast.success(`Bienvenido(a), ${data.user.nombre_completo}`);
        localStorage.setItem('sgd_session_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error de autenticación. Verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  // Validación y envío del cambio de contraseña por primer ingreso
  const handleFirstPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;

    const cur = currentPassword.trim();
    const np = newPassword.trim();
    const cp = confirmPassword.trim();

    if (!cur || !np || !cp) {
      toast.warning('Complete todos los campos obligatorios.');
      return;
    }

    if (np.length < 6) {
      toast.warning('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (np === cur) {
      toast.warning('La nueva contraseña no puede ser idéntica a su contraseña actual.');
      return;
    }

    if (np !== cp) {
      toast.error('La confirmación de la contraseña no coincide.');
      return;
    }

    setIsSubmittingChange(true);
    try {
      const res = await fetch('/api/auth/cambiar-password-primer-ingreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: pendingUser.username,
          current_password: cur,
          new_password: np
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || 'Error al actualizar contraseña');
      }

      toast.success('¡Contraseña actualizada exitosamente! Bienvenido(a) al sistema.');
      localStorage.setItem('sgd_session_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar contraseña.');
    } finally {
      setIsSubmittingChange(false);
    }
  };

  const handleCancelFirstChange = () => {
    setMustChangePassword(false);
    setPendingUser(null);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPassword('');
  };

  // Criterios de validación visual para la nueva contraseña
  const hasMinLength = newPassword.length >= 6;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-x-hidden selection:bg-sky-500 selection:text-white">
      {/* Botón flotante cambio de tema */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer"
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      {/* Fondo decorativo con luces sutiles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-500/10 dark:bg-sky-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl" />
      </div>

      {/* Contenido Central */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 z-10">

        {/* Cabecera Institucional */}
        <div className="text-center max-w-xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xl shadow-sky-500/25 mb-4 ring-4 ring-sky-500/20">
            <Building2 className="w-8 h-8" />
          </div>

          {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800/80 text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
            <span>Presidencia del Consejo de Ministros</span>
            <span className="text-slate-400">•</span>
            <span className="text-sky-600 dark:text-sky-400">SGTD</span>
          </div> */}

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Sistema de Gobierno de Datos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium max-w-md mx-auto">
            Modelo Oficial de Evaluación de Madurez (MEMGD v1.1)
          </p>
        </div>

        {/* ======================================================== */}
        {/* VISTA 1: FORMULARIO PRINCIPAL DE LOGIN                   */}
        {/* ======================================================== */}
        {!mustChangePassword ? (
          <div className="w-full max-w-md bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
            {/* Barra superior decorativa */}
            <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                    Iniciar Sesión
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Acceda con sus credenciales institucionales
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-800/60">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Campo Usuario */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Usuario Institucional
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej. admin, oti, oaj, upm..."
                      required
                      autoFocus
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botón de Acceso */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verificando credenciales...</span>
                    </div>
                  ) : (
                    <>
                      <span>Ingresar al Sistema</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Aviso de Seguridad */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[11px] text-slate-400 font-medium">
                  Canal seguro y cifrado con PBKDF2-SHA256
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VISTA 2: CAMBIO OBLIGATORIO DE CONTRASEÑA EN PRIMER INGRESO*/
          /* ======================================================== */
          <div className="w-full max-w-md bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
            {/* Barra superior con color de advertencia / seguridad */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-sky-500" />

            <div className="p-6 sm:p-8 space-y-5">
              {/* Encabezado del Cambio Obligatorio */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/70 text-[10px] font-black uppercase tracking-wider mb-2.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Primer Inicio de Sesión • Obligatorio</span>
                </div>

                <h2 className="font-heading font-black text-xl text-slate-900 dark:text-white">
                  Actualice su Contraseña
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Por políticas de seguridad de la PCM, debe sustituir su contraseña temporal por una clave personal y segura.
                </p>
              </div>

              {/* Ficha resumen del usuario autenticado */}
              {pendingUser && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cuenta</span>
                    <strong className="text-slate-900 dark:text-white font-mono">@{pendingUser.username}</strong>
                    <span className="text-slate-400 text-[11px] ml-1.5">({pendingUser.siglas})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rol</span>
                    <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">{pendingUser.rol}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleFirstPasswordChange} className="space-y-4">
                {/* 1. Contraseña Actual */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Contraseña Actual (Temporal)
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Ingrese su contraseña actual..."
                      className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 2. Nueva Contraseña */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres..."
                      className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* 3. Confirmar Nueva Contraseña */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Vuelva a escribir la nueva contraseña..."
                      className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Lista de Requisitos Dinámica */}
                <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-950/50 space-y-1.5 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1 mr-1" />}
                    <span>Mínimo 6 caracteres</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isDifferentFromCurrent ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {isDifferentFromCurrent ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1 mr-1" />}
                    <span>Diferente a la contraseña actual</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1 mr-1" />}
                    <span>Las contraseñas coinciden</span>
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isSubmittingChange || !hasMinLength || !passwordsMatch || !isDifferentFromCurrent}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingChange ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Actualizando contraseña...</span>
                      </div>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Guardar Contraseña y Continuar</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelFirstChange}
                    className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Volver al inicio de sesión</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Pie de Página Oficial */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 z-10">
        SGD-Madurez • Universidad Nacional de Moquegua (UNAM) • Marco de Gobierno Digital PCM
      </footer>
    </div>
  );
};
