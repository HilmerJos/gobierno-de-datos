# SGD-Madurez: Sistema de Evaluación de Madurez y Plan de Acción de Gobierno de Datos
**Frontend: React + Tailwind CSS | Backend: FastAPI | Base de Datos: PostgreSQL**

Plataforma digital integral desarrollada para la **Oficina de Tecnologías de la Información (OTI)** en cumplimiento de la **Estrategia Nacional de Gobierno de Datos (ENGD) 2026–2030 (PCM / SGTD / CND)**.

---

## 🌟 Características de la Nueva Arquitectura

1. **Frontend en React con Tailwind CSS**:
   - Desarrollado con **React 19**, **TypeScript** y **Tailwind CSS**.
   - **Diseño Responsive para Móviles y Tablets**: Navegación lateral adaptativa con Drawer / menú hamburguesa y cuadrículas flexibles.
   - **Modo Claro de Alto Contraste**: Colores nítidos (`#0f172a`, fondos blancos limpios, bordes definidos y rúbricas diferenciadas en tonos pastel) y **Modo Oscuro** de alta fidelidad.
   - **Nuevo Componente Custom Select (Estilo Oficial)**: Rediseño total de todos los selectores de la aplicación con marco de esquinas redondeadas (`rounded-2xl`), títulos en negrita con tracking, subtítulos explicativos y opción activa destacada en azul marino profundo con icono de verificación (`✓`), idéntico al requerimiento visual institucional.

2. **Backend en FastAPI con Soporte PostgreSQL**:
   - SQLAlchemy ORM con compatibilidad completa para **PostgreSQL 15–18** (vía variable `DATABASE_URL` en `.env`).
   - Fallback automático y transparente a SQLite local para garantizar ejecución inmediata sin bloqueos.
   - Generadores oficiales de Microsoft Office (`openpyxl` y `python-docx`) para descarga de la Matriz Oficial (`.xlsx`), Inventario de Evidencias (`.xlsx`) y Plan de Acción (`.docx`).

---

## 🚀 Inicio Rápido

### Lanzador Automático Windows (1 Clic)
Haz doble clic sobre:
```
INICIAR_SISTEMA.bat
```
La aplicación abrirá automáticamente en tu navegador web en: **`http://127.0.0.1:8000`**

### Modo Desarrollo Frontend (Vite HMR)
Si deseas trabajar con recarga en vivo del frontend:
```bash
cd "d:\OTI 2026\GOBIERNO DE DATOS\sgd_sistema\frontend"
npm run dev
```

### Configuración de PostgreSQL
Edita el archivo `sgd_sistema/backend/.env` (o define la variable de entorno):
```env
DATABASE_URL=postgresql+psycopg2://postgres:tu_password@localhost:5432/sgd_madurez
```

---

## 🏛️ Módulos de la Plataforma

| Módulo | Funcionalidades |
| :--- | :--- |
| **📊 Dashboard Ejecutivo** | Radar de Madurez (Spider Chart) interactivo de las 8 dimensiones PCM, KPIs de puntaje global, avance, brechas y semaforización. |
| **📝 Matriz de Diagnóstico (75 Preguntas)** | Evaluación de 6 niveles (0 a 5) con rúbricas oficiales completas, justificación técnica y selector de dimensiones moderno. |
| **📁 Inventario de Evidencias Digitales** | Gestión centralizada de medios de verificación auditables con los 10 campos requeridos por la PCM, carga de archivos o enlaces web y estados de validación. |
| **🎯 Plan de Acción (ENGD 2026–2030)** | Consolidado de iniciativas alineadas a los 5 ejes nacionales, cálculo de índice ponderado, costos proyectados y metas. |
| **⚡ Exportación Oficial** | Generación y descarga directa en 1 clic de archivos oficiales `.xlsx` y `.docx` para el Comité de Gobierno y Transformación Digital (CGTD). |
