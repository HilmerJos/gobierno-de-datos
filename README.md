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

