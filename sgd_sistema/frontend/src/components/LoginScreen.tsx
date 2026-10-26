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
  CheckCircle2, 
  Scale, 
  Layers, 
  Coins, 
  BarChart3, 
  Users2, 
  Laptop
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const predefinedAccounts = [
    {
      username: 'admin',
      password: 'admin123',
      siglas: 'ADMIN',
      title: 'Administrador General',
      desc: 'Control total de las 75 preguntas, reasignación de áreas y gestión global',
      icon: ShieldCheck,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-500',
      badge: 'Control Total'
    },
    {
      username: 'oti',
      password: 'oti123',
      siglas: 'OTI',
      title: 'Oficina de Tecnologías de la Información',
      desc: 'Arquitectura técnica, calidad, seguridad e infraestructura de datos',
      icon: Laptop,
      color: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800/80 hover:border-sky-500',
      badge: '43 preguntas'
    },
    {
      username: 'oaj',
      password: 'oaj123',
      siglas: 'OAJ',
      title: 'Oficina de Asesoría Jurídica',
      desc: 'Marco legal, protección de datos personales y resoluciones oficiales',
      icon: Scale,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80 hover:border-emerald-500',
      badge: '11 preguntas'
    },
    {
      username: 'upm',
      password: 'upm123',
      siglas: 'UPM',
      title: 'Unidad de Planeamiento y Modernización',
      desc: 'PAGD, articulación con PEI/POI y organización de la función de datos',
      icon: Layers,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/80 hover:border-purple-500',
      badge: '5 preguntas'
    },
    {
      username: 'up',
      password: 'up123',
      siglas: 'UP',
      title: 'Unidad de Presupuesto',
      desc: 'Financiamiento y asignación presupuestal para iniciativas del PAGD',
      icon: Coins,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/80 hover:border-amber-500',
      badge: '3 preguntas'
    },
    {
      username: 'ue',
      password: 'ue123',
      siglas: 'UE',
      title: 'Unidad de Estadística',
      desc: 'Indicadores de gestión, analítica y publicación de Datos Abiertos',
      icon: BarChart3,
      color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/80 hover:border-rose-500',
      badge: '7 preguntas'
    },
    {
      username: 'urh',
      password: 'urh123',
      siglas: 'URH',
      title: 'Unidad de Recursos Humanos',
      desc: 'Capacitación, perfiles de custodios y cultura institucional de datos',
      icon: Users2,
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/80 hover:border-teal-500',
      badge: '6 preguntas'
    }
  ];

  const handleSubmit = async (e?: React.FormEvent, customUser?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const u = (customUser || username).trim();
    const p = (customPass || password).trim();

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

      toast.success(`Bienvenido(a), ${data.user.nombre_completo}`);
      localStorage.setItem('sgd_session_user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err: any) {
      toast.error(err.message || 'Error de autenticación. Verifique sus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    handleSubmit(undefined, u, p);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-[#070b12] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-x-hidden">
      {/* Botón flotante cambio tema */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition-all"
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12">
        {/* Cabecera Institucional */}
        <div className="text-center max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xl shadow-sky-500/25 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight">
            Sistema de Gobierno de Datos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Modelo Oficial de Evaluación de Madurez (MEMGD) • PCM / Secretaría de Gobierno y Transformación Digital
          </p>
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 text-[11px] font-bold text-sky-700 dark:text-sky-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Control de Acceso por Roles y Áreas Responsables
          </div>
        </div>

        {/* Contenedor Principal: Formulario + Tarjetas de Roles */}
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* 1. Formulario de Login */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
            <div className="mb-6">
              <h2 className="font-heading font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                Iniciar Sesión
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Ingrese con su cuenta de Administrador o de Área Asignada
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Usuario
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Autenticando...' : 'Acceder al Sistema'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <span className="text-[11px] text-slate-400 font-medium">
                ¿No recuerdas tus accesos? Selecciona tu área en el panel derecho.
              </span>
            </div>
          </div>

          {/* 2. Selector Rápido de Áreas y Roles */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Acceso Rápido por Área / Rol Institucional
              </span>
              <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold">
                1 Clic para Ingresar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {predefinedAccounts.map((acc) => {
                const IconComponent = acc.icon;
                return (
                  <div
                    key={acc.username}
                    onClick={() => handleQuickSelect(acc.username, acc.password)}
                    className={`p-3.5 rounded-2xl border bg-white dark:bg-slate-900/70 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between group ${acc.color}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span className="font-heading font-black text-xs sm:text-sm">
                            {acc.siglas}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                          {acc.badge}
                        </span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mb-0.5">
                        {acc.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {acc.desc}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>usr: <strong className="text-slate-600 dark:text-slate-300">{acc.username}</strong></span>
                      <span className="text-sky-600 dark:text-sky-400 font-sans font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Ingresar <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80">
        SGD-Madurez • Universidad Nacional de Moquegua (UNAM) • Marco de Gobierno Digital PCM
      </footer>
    </div>
  );
};
