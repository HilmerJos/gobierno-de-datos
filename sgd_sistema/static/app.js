/* =====================================================================
   SGD-MADUREZ - LÓGICA DE APLICACIÓN FRONTEND
   Integración con API FastAPI, Chart.js Radar y Gestión de Diagnóstico
   ===================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Estado global de la aplicación
  const state = {
    currentTab: 'dashboard',
    currentDimension: 'D1',
    dimensions: [],
    questions: [],
    stats: null,
    radarChart: null,
    barChart: null,
    planData: null
  };

  // Referencias a elementos DOM
  const navItems = document.querySelectorAll('.nav-item');
  const tabViews = document.querySelectorAll('.tab-view');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const dimTabsContainer = document.getElementById('dim-tabs-container');
  const questionsContainer = document.getElementById('questions-container');

  // Inicialización
  initApp();

  async function initApp() {
    setupNavigation();
    setupThemeToggle();
    setupModals();
    await loadInitialData();
  }

  // -------------------------------------------------------------
  // NAVEGACIÓN Y PESTAÑAS
  // -------------------------------------------------------------
  function setupNavigation() {
    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // Botones de acceso rápido
    document.getElementById('btn-ir-matriz')?.addEventListener('click', () => switchTab('matriz'));
    document.getElementById('btn-nueva-evidencia-top')?.addEventListener('click', () => abrirModalEvidencia());
    document.getElementById('btn-quick-export')?.addEventListener('click', () => switchTab('exportar'));
  }

  function switchTab(tabId) {
    state.currentTab = tabId;
    navItems.forEach(n => n.classList.toggle('active', n.getAttribute('data-tab') === tabId));
    tabViews.forEach(v => v.classList.toggle('active', v.id === `tab-${tabId}`));

    const titles = {
      dashboard: { title: 'Dashboard Ejecutivo de Madurez', sub: 'Monitoreo continuo de las 8 dimensiones y nivel institucional de gobierno de datos' },
      matriz: { title: 'Matriz de Diagnóstico y Evaluación (75 Preguntas)', sub: 'Rúbricas oficiales de la Presidencia del Consejo de Ministros (PCM / CND)' },
      evidencias: { title: 'Inventario Centralizado de Evidencias Digitales', sub: 'Medios de verificación auditables asociados a cada componente del modelo' },
      plan: { title: 'Plan de Acción de Gobierno de Datos (ENGD 2026–2030)', sub: 'Iniciativas priorizadas, cronogramas, responsables y seguimiento presupuestal' },
      exportar: { title: 'Centro de Exportación de Documentos Oficiales', sub: 'Descarga en 1-clic de archivos oficiales en formatos Excel (.xlsx) y Word (.docx)' }
    };

    if (titles[tabId]) {
      pageTitle.textContent = titles[tabId].title;
      pageSubtitle.textContent = titles[tabId].sub;
    }

    if (tabId === 'matriz') {
      loadQuestions(state.currentDimension);
    } else if (tabId === 'evidencias') {
      loadEvidencias();
    } else if (tabId === 'plan') {
      loadPlanAccion();
    } else if (tabId === 'dashboard') {
      loadStats();
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function setupThemeToggle() {
    const btnToggle = document.getElementById('btn-toggle-theme');
    const themeText = document.getElementById('theme-text');
    let isDark = true;

    btnToggle.addEventListener('click', () => {
      isDark = !isDark;
      document.body.classList.toggle('theme-light', !isDark);
      document.body.classList.toggle('theme-dark', isDark);
      themeText.textContent = isDark ? 'Modo Claro' : 'Modo Oscuro';
      btnToggle.querySelector('i').setAttribute('data-lucide', isDark ? 'moon' : 'sun');
      if (window.lucide) window.lucide.createIcons();

      // Actualizar tema de gráficos
      if (state.radarChart) state.radarChart.update();
      if (state.barChart) state.barChart.update();
    });
  }

  // -------------------------------------------------------------
  // CARGA DE DATOS INICIALES Y DASHBOARD
  // -------------------------------------------------------------
  async function loadInitialData() {
    try {
      await loadDimensions();
      await loadStats();
      await loadEvidencias();
      await loadPlanAccion();
      renderDimTabs();
    } catch (err) {
      console.error('Error al inicializar:', err);
      showToast('Error conectando con la API local', 'error');
    }
  }

  async function loadDimensions() {
    const res = await fetch('/api/dimensiones');
    state.dimensions = await res.json();
  }

  async function loadStats() {
    const res = await fetch('/api/estadisticas');
    state.stats = await res.json();

    // Actualizar KPIs
    document.getElementById('kpi-puntaje-final').textContent = state.stats.puntaje_final.toFixed(2);
    document.getElementById('kpi-nivel-texto').textContent = state.stats.nivel_descriptivo;
    document.getElementById('kpi-brecha-global').textContent = state.stats.brecha_global.toFixed(2);
    document.getElementById('kpi-avance-porcentaje').textContent = `${state.stats.porcentaje_avance}%`;
    document.getElementById('kpi-preguntas-respondidas').textContent = `${state.stats.total_respondidas} de ${state.stats.total_preguntas} evaluadas`;
    document.getElementById('kpi-total-evidencias').textContent = state.stats.total_evidencias;
    document.getElementById('kpi-evidencias-validadas').textContent = `${state.stats.total_validadas} validadas`;

    // Badges en sidebar
    document.getElementById('nav-badge-respuestas').textContent = `${state.stats.total_respondidas}/${state.stats.total_preguntas}`;
    document.getElementById('nav-badge-evidencias').textContent = state.stats.total_evidencias;

    // Renderizar tabla resumen en Dashboard
    renderTablaResumenDimensiones();

    // Renderizar gráficos Chart.js
    renderRadarChart();
    renderBarBrechasChart();
  }

  function getNivelBadgeHtml(score) {
    if (score < 0.5) return `<span class="badge badge-lvl lvl-0">0 - No Iniciado</span>`;
    if (score < 1.5) return `<span class="badge badge-lvl lvl-1">1 - Inicial</span>`;
    if (score < 2.5) return `<span class="badge badge-lvl lvl-2">2 - En Progreso</span>`;
    if (score < 3.5) return `<span class="badge badge-lvl lvl-3">3 - Definido</span>`;
    if (score < 4.5) return `<span class="badge badge-lvl lvl-4">4 - Gestionado</span>`;
    return `<span class="badge badge-lvl lvl-5">5 - Optimizado</span>`;
  }

  function renderTablaResumenDimensiones() {
    const tbody = document.getElementById('tabla-resumen-dimensiones');
    if (!tbody || !state.stats) return;

    tbody.innerHTML = state.stats.dimensiones.map(d => {
      const pct = Math.round((d.respondidas / d.total_preguntas) * 100);
      return `
        <tr>
          <td><strong class="accent-val">${d.codigo}</strong></td>
          <td><strong>${d.nombre}</strong></td>
          <td>${d.respondidas} / ${d.total_preguntas}</td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <div style="background:var(--bg-surface); width:70px; height:6px; border-radius:3px; overflow:hidden;">
                <div style="background:#38bdf8; width:${pct}%; height:100%;"></div>
              </div>
              <span style="font-size:0.75rem;">${pct}%</span>
            </div>
          </td>
          <td><strong style="font-size:1.1rem; color:#38bdf8;">${d.puntaje.toFixed(2)}</strong></td>
          <td>${getNivelBadgeHtml(d.puntaje)}</td>
          <td><span style="color:${d.brecha > 1 ? '#f43f5e' : '#34d399'}">${d.brecha.toFixed(2)} pts</span></td>
          <td>
            <button class="btn btn-sm btn-outline btn-eval-dim" data-dim="${d.codigo}">
              Evaluar
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Listener para botones Evaluar
    tbody.querySelectorAll('.btn-eval-dim').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dimCode = e.currentTarget.getAttribute('data-dim');
        state.currentDimension = dimCode;
        switchTab('matriz');
      });
    });
  }

  // -------------------------------------------------------------
  // CHART.JS: RADAR Y BARRAS
  // -------------------------------------------------------------
  function renderRadarChart() {
    const ctx = document.getElementById('radarChart')?.getContext('2d');
    if (!ctx || !state.stats) return;

    const labels = state.stats.dimensiones.map(d => `${d.codigo}`);
    const actualScores = state.stats.dimensiones.map(d => d.puntaje);
    const targetScores = state.stats.dimensiones.map(() => 3.0); // Meta oficial PCM

    if (state.radarChart) {
      state.radarChart.destroy();
    }

    state.radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Nivel Obtenido',
            data: actualScores,
            fill: true,
            backgroundColor: 'rgba(56, 189, 248, 0.25)',
            borderColor: '#38bdf8',
            pointBackgroundColor: '#38bdf8',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#38bdf8',
            borderWidth: 2
          },
          {
            label: 'Nivel Meta PCM (3.00)',
            data: targetScores,
            fill: false,
            borderColor: '#f59e0b',
            borderDash: [5, 5],
            pointBackgroundColor: '#f59e0b',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              font: { size: 12, weight: '600' },
              color: '#94a3b8'
            },
            ticks: {
              stepSize: 1,
              backdropColor: 'transparent',
              color: '#64748b'
            },
            min: 0,
            max: 5
          }
        },
        plugins: {
          legend: {
            labels: { color: '#cbd5e1', font: { size: 12, family: 'Inter' } }
          }
        }
      }
    });
  }

  function renderBarBrechasChart() {
    const ctx = document.getElementById('barBrechasChart')?.getContext('2d');
    if (!ctx || !state.stats) return;

    const labels = state.stats.dimensiones.map(d => `${d.codigo} - ${d.nombre.substring(0, 20)}...`);
    const scores = state.stats.dimensiones.map(d => d.puntaje);

    if (state.barChart) {
      state.barChart.destroy();
    }

    state.barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Puntaje Alcanzado (0 - 5)',
            data: scores,
            backgroundColor: scores.map(s => s >= 3.0 ? '#10b981' : (s >= 1.5 ? '#f59e0b' : '#f43f5e')),
            borderRadius: 6
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            min: 0,
            max: 5,
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { size: 11 } }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  // -------------------------------------------------------------
  // MATRIZ DE DIAGNÓSTICO (75 PREGUNTAS)
  // -------------------------------------------------------------
  function renderDimTabs() {
    dimTabsContainer.innerHTML = state.dimensions.map(d => `
      <button class="dim-tab-btn ${d.codigo === state.currentDimension ? 'active' : ''}" data-dim="${d.codigo}">
        <span>${d.codigo}</span>
        <span>${d.nombre.split(' ')[0]}</span>
      </button>
    `).join('');

    dimTabsContainer.querySelectorAll('.dim-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dimCode = e.currentTarget.getAttribute('data-dim');
        state.currentDimension = dimCode;
        renderDimTabs();
        loadQuestions(dimCode);
      });
    });
  }

  async function loadQuestions(dimCode) {
    try {
      const dim = state.dimensions.find(d => d.codigo === dimCode);
      if (dim) {
        document.getElementById('dim-banner-code').textContent = dim.codigo;
        document.getElementById('dim-banner-title').textContent = dim.nombre;
        document.getElementById('dim-banner-score').textContent = dim.puntaje.toFixed(2);
      }

      questionsContainer.innerHTML = '<div style="text-align:center; padding:3rem; color:var(--text-dim);">Cargando preguntas de la dimensión...</div>';

      const res = await fetch(`/api/preguntas?dim=${dimCode}`);
      const questions = await res.json();
      state.questions = questions;

      renderQuestions(questions);
    } catch (err) {
      console.error('Error cargando preguntas:', err);
    }
  }

  function renderQuestions(questions) {
    if (!questions || questions.length === 0) {
      questionsContainer.innerHTML = '<div style="text-align:center; padding:3rem;">No se encontraron preguntas.</div>';
      return;
    }

    questionsContainer.innerHTML = questions.map(q => {
      const isAnswered = q.respuesta !== null;
      const currentLevel = isAnswered ? q.respuesta.valor_nivel : null;
      const comentarios = isAnswered ? (q.respuesta.comentarios || '') : '';

      return `
        <div class="question-card ${isAnswered ? 'answered' : ''}" id="q-card-${q.codigo}">
          <div class="question-header">
            <span class="q-code-badge">${q.codigo}</span>
            <div class="q-enunciado">${q.enunciado}</div>
          </div>

          <div class="q-guidance-box">
            <div class="q-guidance-row">
              <strong>Explicación:</strong> ${q.explicacion || 'No disponible'}
            </div>
            <div class="q-guidance-row">
              <strong>Resultados Esperados:</strong> ${q.resultados_esperados || 'No disponible'}
            </div>
          </div>

          <!-- SELECTOR DE NIVELES (0 A 5) -->
          <div class="options-grid">
            ${q.opciones.map(opt => {
              const isSelected = currentLevel === opt.nivel;
              return `
                <div class="option-choice ${isSelected ? 'selected' : ''}" 
                     data-qcode="${q.codigo}" 
                     data-level="${opt.nivel}" 
                     data-text="${encodeURIComponent(opt.descripcion)}">
                  <div class="option-header">
                    <span class="option-lvl-tag lvl-${opt.nivel}">${opt.etiqueta}</span>
                    <span class="option-pts">${opt.nivel}.0 pts</span>
                  </div>
                  <div class="option-desc">${opt.descripcion}</div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- FOOTER CON JUSTIFICACIÓN Y BOTÓN -->
          <div class="q-footer-row">
            <div class="form-group flex-1">
              <label>Comentarios y Justificación Técnica de la Entidad:</label>
              <textarea class="form-textarea q-comentario-input" rows="2" 
                        placeholder="Justifique el nivel seleccionado y señale el sustento correspondiente...">${comentarios}</textarea>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem; justify-content:flex-end;">
              <button class="btn btn-sm btn-outline btn-vincular-evidencia" data-qcode="${q.codigo}">
                <i data-lucide="paperclip"></i> Evidencias (${q.total_evidencias})
              </button>
              <button class="btn btn-sm btn-primary btn-guardar-respuesta" data-qcode="${q.codigo}">
                <i data-lucide="check"></i> Guardar
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();

    // Eventos de selección de opción
    questionsContainer.querySelectorAll('.option-choice').forEach(choice => {
      choice.addEventListener('click', (e) => {
        const parentCard = e.currentTarget.closest('.question-card');
        parentCard.querySelectorAll('.option-choice').forEach(c => c.classList.remove('selected'));
        e.currentTarget.classList.add('selected');
      });
    });

    // Eventos de guardar respuesta
    questionsContainer.querySelectorAll('.btn-guardar-respuesta').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const qCode = e.currentTarget.getAttribute('data-qcode');
        const card = document.getElementById(`q-card-${qCode}`);
        const selectedChoice = card.querySelector('.option-choice.selected');

        if (!selectedChoice) {
          showToast('Seleccione un nivel de madurez para responder', 'error');
          return;
        }

        const level = parseFloat(selectedChoice.getAttribute('data-level'));
        const opcionTexto = decodeURIComponent(selectedChoice.getAttribute('data-text'));
        const comentarios = card.querySelector('.q-comentario-input').value;

        try {
          const resp = await fetch('/api/respuestas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pregunta_codigo: qCode,
              valor_nivel: level,
              opcion_texto: opcionTexto,
              comentarios: comentarios
            })
          });

          if (resp.ok) {
            card.classList.add('answered');
            showToast(`Respuesta guardada para pregunta ${qCode}`, 'success');
            await loadDimensions();
            const updatedDim = state.dimensions.find(d => d.codigo === state.currentDimension);
            if (updatedDim) {
              document.getElementById('dim-banner-score').textContent = updatedDim.puntaje.toFixed(2);
            }
            loadStats();
          }
        } catch (err) {
          console.error(err);
          showToast('Error al guardar respuesta', 'error');
        }
      });
    });

    // Evento vincular evidencia
    questionsContainer.querySelectorAll('.btn-vincular-evidencia').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const qCode = e.currentTarget.getAttribute('data-qcode');
        abrirModalEvidencia(qCode);
      });
    });
  }

  // -------------------------------------------------------------
  // INVENTARIO DE EVIDENCIAS
  // -------------------------------------------------------------
  async function loadEvidencias() {
    try {
      const dimFilter = document.getElementById('filtro-evidencia-dim')?.value || '';
      const estadoFilter = document.getElementById('filtro-evidencia-estado')?.value || '';
      const searchFilter = document.getElementById('filtro-evidencia-search')?.value.toLowerCase() || '';

      const res = await fetch('/api/evidencias');
      const evidencias = await res.json();

      const filtered = evidencias.filter(ev => {
        if (dimFilter && ev.dimension_codigo !== dimFilter) return false;
        if (estadoFilter && ev.estado_validacion !== estadoFilter) return false;
        if (searchFilter) {
          const text = `${ev.nombre_evidencia} ${ev.pregunta_codigo} ${ev.responsable}`.toLowerCase();
          if (!text.includes(searchFilter)) return false;
        }
        return true;
      });

      renderTablaEvidencias(filtered);
    } catch (err) {
      console.error(err);
    }
  }

  function renderTablaEvidencias(evidencias) {
    const tbody = document.getElementById('tabla-evidencias-body');
    if (!tbody) return;

    if (evidencias.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2rem; color:var(--text-dim);">No hay evidencias registradas con los filtros actuales.</td></tr>`;
      return;
    }

    tbody.innerHTML = evidencias.map(ev => {
      const isUrl = ev.ruta_o_enlace.startsWith('http');
      const linkHtml = isUrl
        ? `<a href="${ev.ruta_o_enlace}" target="_blank" class="btn btn-sm btn-outline"><i data-lucide="external-link"></i> Abrir</a>`
        : `<a href="${ev.ruta_o_enlace}" download class="btn btn-sm btn-outline"><i data-lucide="download"></i> Descargar</a>`;

      return `
        <tr>
          <td><strong class="accent-val">${ev.pregunta_codigo}</strong></td>
          <td>
            <strong>${ev.nombre_evidencia}</strong>
            <div style="font-size:0.75rem; color:var(--text-dim);">${ev.descripcion.substring(0, 60)}...</div>
          </td>
          <td><span class="badge lvl-3">${ev.tipo_evidencia}</span></td>
          <td>${ev.area_unidad}</td>
          <td>${ev.responsable}</td>
          <td>${linkHtml}</td>
          <td><span class="badge ${ev.estado_validacion === 'Validado' ? 'badge-pulse' : 'lvl-2'}">${ev.estado_validacion}</span></td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline btn-validar-ev" data-id="${ev.id}" title="Marcar como Validado">
                <i data-lucide="check-circle-2"></i>
              </button>
              <button class="btn btn-sm btn-outline btn-eliminar-ev" data-id="${ev.id}" style="color:var(--accent-rose);" title="Eliminar">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();

    // Eventos de validar y eliminar
    tbody.querySelectorAll('.btn-validar-ev').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        await cambiarEstadoEvidencia(id, 'Validado');
      });
    });

    tbody.querySelectorAll('.btn-eliminar-ev').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('¿Está seguro de eliminar esta evidencia?')) {
          await eliminarEvidencia(id);
        }
      });
    });
  }

  // Filtros de evidencias listeners
  document.getElementById('filtro-evidencia-dim')?.addEventListener('change', loadEvidencias);
  document.getElementById('filtro-evidencia-estado')?.addEventListener('change', loadEvidencias);
  document.getElementById('filtro-evidencia-search')?.addEventListener('input', loadEvidencias);

  // -------------------------------------------------------------
  // PLAN DE ACCIÓN
  // -------------------------------------------------------------
  async function loadPlanAccion() {
    try {
      const res = await fetch('/api/plan-accion');
      state.planData = await res.json();

      const cfg = state.planData.configuracion;
      if (cfg) {
        document.getElementById('plan-entidad-nombre').value = cfg.entidad_nombre || '';
        document.getElementById('plan-siglas').value = cfg.siglas || '';
        document.getElementById('plan-periodo').value = cfg.periodo || '';
        document.getElementById('plan-ogd-nombre').value = cfg.ogd_nombre || '';
        document.getElementById('plan-ogd-puesto').value = cfg.ogd_puesto || '';
        document.getElementById('plan-resolucion').value = cfg.resolucion_cgtd || '';
        document.getElementById('sidebar-entity-name').textContent = `${cfg.siglas || 'OTI'} - ${cfg.entidad_nombre || 'Oficina de TI'}`;
      }

      renderTablaIniciativas(state.planData.iniciativas);
    } catch (err) {
      console.error(err);
    }
  }

  function renderTablaIniciativas(iniciativas) {
    const tbody = document.getElementById('tabla-iniciativas-body');
    if (!tbody || !iniciativas) return;

    let totalCosto = 0;
    let totalPeso = 0;

    tbody.innerHTML = iniciativas.map((init, idx) => {
      totalCosto += init.costo_proyectado || 0;
      totalPeso += init.peso_relativo || 0;

      return `
        <tr>
          <td><strong class="accent-val">${init.codigo}</strong></td>
          <td>
            <strong>${init.nombre}</strong>
            <div style="font-size:0.75rem; color:var(--text-dim);">${init.descripcion}</div>
          </td>
          <td><span class="badge lvl-4">${init.eje_engd.split(':')[0]}</span></td>
          <td>${init.plazo}</td>
          <td>${init.responsable} (${init.unidad_organica})</td>
          <td>${init.peso_relativo}%</td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <div style="background:var(--bg-surface); width:60px; height:6px; border-radius:3px; overflow:hidden;">
                <div style="background:#10b981; width:${init.avance_porcentaje}%; height:100%;"></div>
              </div>
              <span>${init.avance_porcentaje}%</span>
            </div>
          </td>
          <td>S/ ${init.costo_proyectado.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
          <td><strong class="accent-val">${init.indice_ponderado}%</strong></td>
          <td>
            <button class="btn btn-sm btn-outline btn-eliminar-init" data-id="${init.id}" style="color:var(--accent-rose);">
              <i data-lucide="trash-2"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    document.getElementById('tfoot-total-peso').textContent = `${totalPeso}%`;
    document.getElementById('tfoot-total-costo').textContent = `S/ ${totalCosto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
    document.getElementById('tfoot-total-indice').textContent = `${state.planData.indice_cumplimiento_total}%`;
    document.getElementById('nav-badge-iniciativas').textContent = iniciativas.length;

    if (window.lucide) window.lucide.createIcons();

    tbody.querySelectorAll('.btn-eliminar-init').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('¿Eliminar esta iniciativa del Plan de Acción?')) {
          await fetch(`/api/iniciativas/${id}`, { method: 'DELETE' });
          showToast('Iniciativa eliminada', 'info');
          loadPlanAccion();
        }
      });
    });
  }

  // Guardar configuración del plan
  document.getElementById('btn-guardar-config-plan')?.addEventListener('click', async () => {
    try {
      const payload = {
        entidad_nombre: document.getElementById('plan-entidad-nombre').value,
        siglas: document.getElementById('plan-siglas').value,
        periodo: document.getElementById('plan-periodo').value,
        ogd_nombre: document.getElementById('plan-ogd-nombre').value,
        ogd_puesto: document.getElementById('plan-ogd-puesto').value,
        presidente_cgtd: 'Director General',
        resolucion_cgtd: document.getElementById('plan-resolucion').value,
        nivel_objetivo: 3.0
      };

      const res = await fetch('/api/plan-accion/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('Datos institucionales actualizados', 'success');
        document.getElementById('sidebar-entity-name').textContent = `${payload.siglas} - ${payload.entidad_nombre}`;
      }
    } catch (err) {
      console.error(err);
      showToast('Error al guardar configuración', 'error');
    }
  });

  // -------------------------------------------------------------
  // GESTIÓN DE MODALES (EVIDENCIAS)
  // -------------------------------------------------------------
  function setupModals() {
    const modalEvidencia = document.getElementById('modal-evidencia');
    const btnCerrar = document.getElementById('btn-cerrar-modal-evidencia');
    const btnCancelar = document.getElementById('btn-cancelar-modal-evidencia');
    const formEvidencia = document.getElementById('form-evidencia');

    btnCerrar?.addEventListener('click', () => modalEvidencia.classList.remove('show'));
    btnCancelar?.addEventListener('click', () => modalEvidencia.classList.remove('show'));

    document.getElementById('btn-abrir-modal-evidencia')?.addEventListener('click', () => abrirModalEvidencia());

    formEvidencia?.addEventListener('submit', async (e) => {
      e.preventDefault();

      let rutaOEnlace = document.getElementById('evidencia-url').value;
      const fileInput = document.getElementById('evidencia-file');

      // Si subió archivo, enviar multipart primero
      if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
          const uploadRes = await fetch('/api/evidencias/upload', {
            method: 'POST',
            body: formData
          });
          const uploadData = await uploadRes.json();
          if (uploadData.url) {
            rutaOEnlace = uploadData.url;
          }
        } catch (err) {
          console.error('Error subiendo archivo:', err);
          showToast('Error al subir archivo de evidencia', 'error');
          return;
        }
      }

      if (!rutaOEnlace) {
        showToast('Adjunte un archivo o ingrese una URL de sustento', 'error');
        return;
      }

      const payload = {
        pregunta_codigo: document.getElementById('evidencia-pregunta').value,
        origen: document.getElementById('evidencia-origen').value,
        tipo_evidencia: document.getElementById('evidencia-tipo').value,
        nombre_evidencia: document.getElementById('evidencia-nombre').value,
        ruta_o_enlace: rutaOEnlace,
        descripcion: document.getElementById('evidencia-desc').value,
        responsable: document.getElementById('evidencia-responsable').value,
        area_unidad: document.getElementById('evidencia-area').value,
        estado_validacion: document.getElementById('evidencia-estado').value,
        comentarios_revision: document.getElementById('evidencia-comentarios-rev').value
      };

      try {
        const res = await fetch('/api/evidencias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          modalEvidencia.classList.remove('show');
          formEvidencia.reset();
          showToast('Evidencia registrada exitosamente', 'success');
          loadEvidencias();
          loadStats();
        }
      } catch (err) {
        console.error(err);
        showToast('Error al guardar evidencia', 'error');
      }
    });
  }

  async function abrirModalEvidencia(codigoPregunta = null) {
    const modal = document.getElementById('modal-evidencia');
    const selectPregunta = document.getElementById('evidencia-pregunta');

    // Llenar select con las 75 preguntas
    if (selectPregunta.options.length <= 1) {
      const res = await fetch('/api/preguntas');
      const allQ = await res.json();
      selectPregunta.innerHTML = allQ.map(q => `
        <option value="${q.codigo}">[${q.codigo}] ${q.enunciado.substring(0, 80)}...</option>
      `).join('');
    }

    if (codigoPregunta) {
      selectPregunta.value = codigoPregunta;
    }

    modal.classList.add('show');
  }

  async function cambiarEstadoEvidencia(id, nuevoEstado) {
    try {
      const res = await fetch(`/api/evidencias`);
      const all = await res.json();
      const current = all.find(e => e.id == id);
      if (current) {
        current.estado_validacion = nuevoEstado;
        await fetch(`/api/evidencias/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        });
        showToast(`Evidencia marcada como ${nuevoEstado}`, 'success');
        loadEvidencias();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function eliminarEvidencia(id) {
    try {
      await fetch(`/api/evidencias/${id}`, { method: 'DELETE' });
      showToast('Evidencia eliminada', 'info');
      loadEvidencias();
      loadStats();
    } catch (err) {
      console.error(err);
    }
  }

  // -------------------------------------------------------------
  // NOTIFICACIONES TOAST
  // -------------------------------------------------------------
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconName = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : 'info');
    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
