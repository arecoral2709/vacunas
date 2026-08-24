(() => {
  "use strict";

  const data = window.SS_DEMO_DATA;
  const app = document.getElementById("app");
  const main = document.getElementById("main-content");
  const pageLabel = document.getElementById("page-label");
  const dialog = document.getElementById("evidence-dialog");
  const dialogContent = document.getElementById("evidence-content");
  const sidebar = document.getElementById("sidebar");
  const toast = document.getElementById("toast");
  let toastTimer;
  let explorerCountry = "";
  let selectedCountry = "";

  if (!data) {
    app.innerHTML = '<section class="view"><div class="pending-panel"><h1>No se pudo cargar el mart</h1><p>Regenera el bundle de producto antes de abrir la demo.</p></div></section>';
    return;
  }

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalize = (value = "") => String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const labelMap = {
    YES: "Relación PAI",
    UNKNOWN: "No verificado",
    VIGENTE: "Vigente",
    RESOLVED: "Resuelto",
    PARTIAL: "Parcial",
    VERIFIED: "Verificado",
    DERIVED: "Derivado",
    AVAILABLE: "Disponible",
    NO_PUBLICADO: "No publicado",
    NO_VERIFICADO: "No verificado",
    NO_DISPONIBLE: "No disponible",
    NO_ESTRUCTURADO: "No estructurado",
    UNRESOLVED: "No resuelto",
    NOT_APPLICABLE: "No aplica",
    EXACT_PRODUCT_MATCH: "Coincidencia exacta",
    STRONG_PRODUCT_MATCH: "Coincidencia fuerte",
    EXPLICIT: "Explícita",
    APPROVED: "Aprobado",
    CONJUGATE: "Conjugada",
    INACTIVATED: "Inactivada",
    LIVE_ATTENUATED: "Viva atenuada",
    MRNA: "ARN mensajero (ARNm)",
    OTHER: "Otra",
    PROTEIN_SUBUNIT: "Subunidad proteica",
    RECOMBINANT: "Recombinante",
    TOXOID: "Toxoide",
    ACTIVE_ANTIGEN: "Antígeno activo",
    ADJUVANT: "Adyuvante",
    BUFFER: "Amortiguador",
    DILUENT: "Diluyente",
    EXCIPIENT: "Excipiente",
    PRESERVATIVE: "Conservante",
    PROCESS_INPUT: "Insumo de proceso",
    PROCESS_RESIDUAL: "Residuo de proceso",
    STABILIZER: "Estabilizante",
    SURFACTANT: "Tensioactivo",
    TRACE_RESIDUAL: "Residuo en traza",
    BIOLOGICAL: "Biológico",
    CHEMICAL: "Químico",
    COMPLEX_MIXTURE: "Mezcla compleja",
    FINAL_FORMULATION: "Formulación final",
    EXACT: "Exacta",
    MAXIMUM: "Máxima",
    MINIMUM: "Mínima",
    BACTERIUM: "Bacteria",
    CELL_LINE: "Línea celular",
    EMBRYONATED_EGG: "Huevo embrionado",
    PRIMARY_CELL: "Célula primaria",
    YEAST: "Levadura",
    AMPOULE: "Ampolla",
    CLOSURE_STOPPER: "Tapón de cierre",
    ORAL_TUBE: "Tubo oral",
    PREFILLED_SYRINGE: "Jeringa prellenada",
    VIAL: "Vial",
    COUNTRY_UNRESOLVED: "País no resuelto",
    MANUFACTURER_SITE_RELATION_AMBIGUOUS: "Relación fabricante–sitio ambigua",
    MULTIPLE_SITES_UNMAPPED: "Múltiples sitios sin correspondencia",
    SITE_SEGMENTATION_AMBIGUOUS: "Segmentación del sitio ambigua",
    SOURCE_ORDINAL_MISMATCH: "Desajuste ordinal en la fuente",
    "Sprint 2 APPROVED": "Sprint 2 aprobado",
    "production system explicitly described": "Sistema de producción descrito explícitamente",
    "conjugate/carrier wording": "Mención explícita de conjugación o proteína transportadora",
    "inactivated wording": "Mención explícita de vacuna inactivada",
    "live attenuated wording": "Mención explícita de vacuna viva atenuada",
    "mRNA explicitly named": "ARN mensajero nombrado explícitamente",
    "official SPL explicit inactivated wording": "El documento oficial SPL indica explícitamente que es inactivada",
    "official SPL identifies purified polysaccharide antigen": "El documento oficial SPL identifica un antígeno polisacárido purificado",
    "protein or OMV antigen wording": "Mención de antígeno proteico o de vesículas de membrana externa",
    "purified polysaccharide antigen explicitly named": "Antígeno polisacárido purificado nombrado explícitamente",
    "recombinant wording": "Mención explícita de tecnología recombinante",
    "toxoid is an explicit antigen, not only a carrier protein": "El toxoide figura como antígeno explícito, no solo como proteína transportadora",
    "whole-cell bacterial antigen explicitly named": "Antígeno bacteriano de célula completa nombrado explícitamente",
  };

  const displayLabel = (value = "") => labelMap[value] || value;
  const displayReasonList = (value = "") => String(value).split("|").map(displayLabel).join(" · ");
  const biologicalSystemNames = (vaccine) => vaccine.biological_systems.map((item) => item.name).join(" · ");
  const biologicalSystemList = (vaccine) => vaccine.biological_systems.length
    ? `<div class="biological-system-list">${vaccine.biological_systems.map((item) => `<span class="biological-system-item"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(displayLabel(item.system_type))}</span></span>`).join("")}</div>`
    : badge("NO_PUBLICADO");

  const statusClass = (status = "") => {
    if (["YES", "RESOLVED", "VERIFIED", "AVAILABLE", "EXACT_PRODUCT_MATCH", "VIGENTE"].includes(status)) return status === "YES" ? "yes" : status.toLowerCase().replaceAll("_", "-");
    if (["PARTIAL", "DERIVED", "STRONG_PRODUCT_MATCH"].includes(status)) return status === "DERIVED" ? "derived" : "partial";
    if (status === "NOT_APPLICABLE") return "not-applicable";
    return "unknown";
  };

  const badge = (status, label = labelMap[status] || status) => `<span class="status-badge ${statusClass(status)}">${escapeHtml(label)}</span>`;
  const iconArrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 5 7 7-7 7-1.4-1.4 4.6-4.6H4v-2h12.2l-4.6-4.6L13 5Z"/></svg>';
  const iconBack = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 5-7 7 7 7 1.4-1.4L7.8 13H20v-2H7.8l4.6-4.6L11 5Z"/></svg>';

  const valueBlock = (field) => field?.status === "AVAILABLE"
    ? `<strong>${escapeHtml(field.value)}</strong>`
    : `<span class="missing-value">${escapeHtml(labelMap[field?.status] || field?.status || "No verificado")}</span>`;
  const formatNumber = (value) => new Intl.NumberFormat("es-CO").format(value);

  const showToast = (message) => {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
  };

  const setActiveNav = (key) => {
    document.querySelectorAll("[data-nav]").forEach((item) => {
      const active = item.dataset.nav === key;
      item.classList.toggle("active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  };

  const countryMeta = {
    "BÉLGICA": { label: "Bélgica", x: 51.2, y: 21.8, accent: "cyan" },
    "FRANCIA": { label: "Francia", x: 50.6, y: 24.3, accent: "teal" },
    "ESTADOS UNIDOS": { label: "Estados Unidos", x: 23.4, y: 31.1, accent: "teal" },
    "ALEMANIA": { label: "Alemania", x: 52.9, y: 21.4, accent: "violet" },
    "INDIA": { label: "India", x: 71.9, y: 38.6, accent: "coral" },
    "IRLANDA": { label: "Irlanda", x: 48.2, y: 20.5, accent: "blue" },
    "ITALIA": { label: "Italia", x: 53.5, y: 27.6, accent: "lime" },
    "HUNGRÍA": { label: "Hungría", x: 55.4, y: 24.1, accent: "coral" },
    "PAÍSES BAJOS": { label: "Países Bajos", x: 51.5, y: 20.3, accent: "blue" },
    "SINGAPUR": { label: "Singapur", x: 78.8, y: 49.5, accent: "violet" },
    "AUSTRIA": { label: "Austria", x: 54.0, y: 24.3, accent: "amber" },
    "CANADÁ": { label: "Canadá", x: 20.5, y: 20.0, accent: "blue" },
    "CUBA": { label: "Cuba", x: 28.4, y: 42.0, accent: "amber" },
    "REPÚBLICA DE COREA": { label: "República de Corea", x: 85.5, y: 31.6, accent: "lime" },
  };

  const countryStats = () => Object.entries(countryMeta).map(([key, meta]) => {
    const vaccines = data.vaccines.filter((vaccine) => vaccine.regulatory.associated_countries.values.includes(key));
    const mentions = data.vaccines.reduce((total, vaccine) => total + vaccine.manufacturer_sites.filter((site) => site.country.value === key).length, 0);
    return { key, ...meta, vaccines, records: vaccines.length, mentions };
  }).filter((item) => item.records > 0).sort((a, b) => b.records - a.records || a.label.localeCompare(b.label, "es"));

  const systemDistribution = () => {
    const order = ["CELL_LINE", "EMBRYONATED_EGG", "PRIMARY_CELL", "YEAST", "BACTERIUM"];
    const counts = data.vaccines.flatMap((vaccine) => vaccine.biological_systems).reduce((acc, item) => {
      acc[item.system_type] = (acc[item.system_type] || 0) + 1;
      return acc;
    }, {});
    return order.map((key, index) => ({ key, label: displayLabel(key), count: counts[key] || 0, color: ["#26c7c9", "#58a9ff", "#8a70ef", "#ffb52f", "#b8df4b"][index] })).filter((item) => item.count);
  };

  const donutStyle = (items) => {
    const total = items.reduce((sum, item) => sum + item.count, 0);
    let cursor = 0;
    const stops = items.map((item) => {
      const start = cursor;
      cursor += (item.count / total) * 100;
      return `${item.color} ${start}% ${cursor}%`;
    });
    return `background:conic-gradient(${stops.join(",")})`;
  };

  const dashboardIcon = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
  const dashboardIcons = {
    records: dashboardIcon("M5 3h14v18H5V3Zm2 2v14h10V5H7Zm2 3h6v2H9V8Zm0 4h6v2H9v-2Zm0 4h4v2H9v-2Z"),
    pai: dashboardIcon("M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8 13c-4 0-6 2-6 5v2h8v-2c0-1.7.6-3.1 1.7-4.1A8.5 8.5 0 0 0 8 13Zm8 0c-2.8 0-5 1.4-5 5v2h11v-2c0-3-2-5-6-5Z"),
    evidence: dashboardIcon("M8.6 14.6a4 4 0 0 1 0-5.7l3-3a4 4 0 0 1 5.7 5.7l-1.7 1.7-1.4-1.4 1.7-1.7a2 2 0 1 0-2.9-2.8l-3 3a2 2 0 0 0 0 2.8l.7.7-1.4 1.4-.7-.7Zm6.8-5.2.7.7-1.4 1.4-.7-.7a2 2 0 0 0-2.8 0l-3 3A2 2 0 1 0 11 17.6l1.7-1.7 1.4 1.4-1.7 1.7a4 4 0 1 1-5.7-5.7l3-3a4 4 0 0 1 5.7 0Z"),
    sources: dashboardIcon("M12 3 3 7v2h18V7l-9-4Zm-6 8h2v6H6v-6Zm5 0h2v6h-2v-6Zm5 0h2v6h-2v-6ZM3 19h18v2H3v-2Z"),
  };

  const coverageRows = () => data.summary.coverage_dimensions.map((item) => `
    <div class="coverage-item">
      <div class="coverage-label"><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.origin)}</span></div>
      <div class="bar-track" role="img" aria-label="${escapeHtml(item.label)}: ${item.available} de ${item.total}"><span class="bar-fill" style="width:${item.percent}%"></span></div>
      <div class="coverage-value"><strong>${item.available}/${item.total}</strong><span>${item.percent}%</span></div>
    </div>
  `).join("");

  const platformRows = () => {
    const max = Math.max(...data.summary.platform_distribution.map((item) => item.relations));
    const colors = ["#39c6ef", "#638cff", "#b8df4b", "#ff7470", "#ffb52f", "#36c2ad", "#9b73e8", "#477df4"];
    return data.summary.platform_distribution.map((item, index) => `
      <div class="mini-bar" style="--bar-color:${colors[index]}">
        <span>${escapeHtml(displayLabel(item.platform))}</span>
        <div class="bar-track" role="img" aria-label="${escapeHtml(displayLabel(item.platform))}: ${item.relations} relaciones"><span class="bar-fill" style="width:${(item.relations / max) * 100}%"></span></div>
        <strong>${item.relations}</strong>
      </div>
    `).join("");
  };

  const renderCountryDetail = (countryKey = selectedCountry) => {
    const country = countryStats().find((item) => item.key === countryKey);
    if (!country) return "";
    const productRows = country.vaccines.slice(0, 3).map((vaccine) => `<li>${escapeHtml(vaccine.regulatory.product_name)}</li>`).join("");
    return `<button class="country-detail-close" type="button" data-action="close-country" aria-label="Cerrar detalle de ${escapeHtml(country.label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z"/></svg></button>
      <div class="country-detail-heading"><span class="country-flag" aria-hidden="true"></span><div><span>País seleccionado</span><h3>${escapeHtml(country.label)}</h3></div></div>
      <div class="country-detail-metrics"><strong>${country.records}</strong><span>registros relacionados</span><strong>${country.mentions}</strong><span>menciones de fabricante o ubicación</span></div>
      <ul class="country-products" aria-label="Ejemplos de registros relacionados">${productRows}</ul>
      <button class="map-cta" type="button" data-action="explore-country" data-country="${escapeHtml(country.key)}">Ver registros ${iconArrow}</button>
      <p class="map-caution">País asociado en la evidencia; no equivale a país de fabricación.</p>`;
  };

  const mapMarkers = () => {
    const stats = countryStats();
    const max = Math.max(...stats.map((item) => item.records));
    return stats.map((item) => {
      const size = 16 + Math.round((item.records / max) * 18);
      return `<button class="map-marker ${item.accent} ${item.key === selectedCountry ? "active" : ""}" style="--x:${item.x}%;--y:${item.y}%;--marker-size:${size}px" type="button" data-action="select-country" data-country="${escapeHtml(item.key)}" aria-label="${escapeHtml(item.label)}: ${item.records} registros relacionados"><span class="marker-tooltip">${escapeHtml(item.label)} · ${item.records}</span></button>`;
    }).join("");
  };

  const countryLegend = () => countryStats().slice(0, 5).map((item) => `<button class="country-legend-item" type="button" data-action="select-country" data-country="${escapeHtml(item.key)}"><span class="legend-dot ${item.accent}" aria-hidden="true"></span><span>${escapeHtml(item.label)}</span><strong>${item.records}</strong></button>`).join("");

  const systemsLegend = () => systemDistribution().map((item) => `<div class="system-legend-row"><span class="legend-dot" style="background:${item.color}" aria-hidden="true"></span><span>${escapeHtml(item.label)}</span><strong>${item.count}</strong></div>`).join("");

  const updateCountrySelection = (countryKey) => {
    if (!countryMeta[countryKey]) return;
    selectedCountry = countryKey;
    document.querySelectorAll(".map-marker").forEach((marker) => marker.classList.toggle("active", marker.dataset.country === countryKey));
    document.querySelectorAll(".country-legend-item").forEach((item) => item.classList.toggle("active", item.dataset.country === countryKey));
    const detail = document.getElementById("country-detail");
    if (detail) {
      detail.innerHTML = renderCountryDetail(countryKey);
      detail.hidden = false;
    }
  };

  const closeCountryDetail = () => {
    selectedCountry = "";
    document.querySelectorAll(".map-marker, .country-legend-item").forEach((item) => item.classList.remove("active"));
    const detail = document.getElementById("country-detail");
    if (detail) {
      detail.hidden = true;
      detail.innerHTML = "";
    }
  };

  const renderHome = () => {
    selectedCountry = "";
    setActiveNav("inicio");
    pageLabel.textContent = "Inicio";
    const systems = systemDistribution();
    const systemTotal = systems.reduce((sum, item) => sum + item.count, 0);
    app.innerHTML = `
      <section class="dashboard-view" aria-labelledby="home-title">
        <header class="dashboard-heading">
          <button class="icon-button dashboard-menu" type="button" aria-label="Abrir navegación" aria-controls="sidebar" aria-expanded="false" data-action="toggle-menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z"/></svg></button>
          <div><span class="dashboard-kicker">Avance científico aprobado</span><h1 id="home-title">Panorama del conocimiento disponible</h1><p>Vacunas autorizadas en Colombia y evidencia tecnológica disponible hasta el corte vigente.</p></div>
          <button class="evidence-button dashboard-evidence" type="button" data-action="open-evidence">${dashboardIcons.records}<span>Evidencia y método</span></button>
        </header>

        <div class="dashboard-kpis" aria-label="Indicadores principales">
          <article class="dashboard-kpi teal"><div class="kpi-icon">${dashboardIcons.records}</div><div><strong>${data.summary.regulatory_records}</strong><span>registros regulatorios</span></div></article>
          <article class="dashboard-kpi cyan"><div class="kpi-icon">${dashboardIcons.pai}</div><div><strong>${data.summary.pai.YES}</strong><span>vinculados al PAI por tipo</span></div></article>
          <article class="dashboard-kpi violet"><div class="kpi-icon">${dashboardIcons.evidence}</div><div><strong>${formatNumber(data.summary.evidence_links)}</strong><span>vínculos de evidencia</span></div></article>
          <article class="dashboard-kpi coral"><div class="kpi-icon">${dashboardIcons.sources}</div><div><strong>${data.sources.length}</strong><span>fuentes oficiales</span></div></article>
        </div>

        <div class="dashboard-primary-grid">
          <section class="dashboard-card geo-card" aria-labelledby="geo-title">
            <div class="dashboard-card-heading"><div><h2 id="geo-title">Países citados en la evidencia regulatoria</h2><p>${countryStats().length} países · el tamaño del círculo representa registros relacionados</p></div><span class="info-mark" title="El mapa muestra países asociados en la evidencia fabricante/sitio.">i</span></div>
            <div class="geo-map-stage">
              <div class="map-markers">${mapMarkers()}</div>
              <aside class="country-detail" id="country-detail" aria-live="polite" hidden></aside>
            </div>
            <div class="country-ranking-label">5 países con más registros relacionados</div>
            <div class="country-legend" aria-label="Países con más registros relacionados">${countryLegend()}</div>
          </section>

          <section class="dashboard-card platform-card" aria-labelledby="platform-title">
            <div class="dashboard-card-heading"><div><h2 id="platform-title">Tecnologías publicadas</h2><p>${data.summary.technology_relations} relaciones · ${data.summary.platform_distribution.length} categorías</p></div></div>
            <div class="mini-bars dashboard-bars">${platformRows()}</div>
            <a class="dashboard-link" href="#explorador">Ver registros por tecnología ${iconArrow}</a>
          </section>
        </div>

        <div class="dashboard-secondary-grid">
          <section class="dashboard-card pai-card" aria-labelledby="pai-title">
            <div class="dashboard-card-heading"><div><h2 id="pai-title">Relación PAI</h2><p>${data.summary.regulatory_records} registros en el universo científico vigente</p></div></div>
            <div class="pai-split" role="img" aria-label="${data.summary.pai.YES} vinculados al PAI por tipo y ${data.summary.pai.UNKNOWN} no verificados"><span style="flex:${data.summary.pai.YES}"><strong>${data.summary.pai.YES}</strong><small>vinculados al PAI</small></span><span class="unknown" style="flex:${data.summary.pai.UNKNOWN}"><strong>${data.summary.pai.UNKNOWN}</strong><small>no verificados</small></span></div>
            <div class="compact-legend"><span><i class="legend-dot teal"></i>Vinculados por tipo</span><span><i class="legend-dot slate"></i>No verificados</span></div>
          </section>

          <section class="dashboard-card systems-card" aria-labelledby="systems-title-home">
            <div class="dashboard-card-heading"><div><h2 id="systems-title-home">Sistemas biológicos</h2><p>${systemTotal} relaciones publicadas en ${data.summary.coverage_dimensions.find((item) => item.key === "biological_systems").available} registros</p></div></div>
            <div class="systems-visual"><div class="systems-donut" style="${donutStyle(systems)}" role="img" aria-label="${systems.map((item) => `${item.label}: ${item.count}`).join(", ")}"><span><strong>${systemTotal}</strong>relaciones</span></div><div class="systems-legend">${systemsLegend()}</div></div>
            <a class="dashboard-link" href="#explorador">Ver líneas y sustratos ${iconArrow}</a>
          </section>
        </div>

        <p class="dashboard-footnote">Cobertura de conocimiento aprobada: lectura ejecutiva del universo de vacunas autorizado en Colombia. La ausencia de información no se interpreta como cero.</p>
      </section>`;
  };

  const technologyOptions = [...new Set(data.vaccines.flatMap((item) => item.technologies.map((technology) => technology.platform)))].sort();

  const renderExplorer = () => {
    setActiveNav("explorador");
    pageLabel.textContent = "Explorador";
    app.innerHTML = `
      <section class="view" aria-labelledby="explorer-title">
        <div class="page-heading"><div><span class="eyebrow">Catálogo regulatorio</span><h1 id="explorer-title">Explorador de vacunas</h1><p>Navegue los 50 registros sin consolidar marcas ni inferir equivalencias. Cada ficha conserva el registro INVIMA como unidad de análisis.</p></div></div>
        <form class="filters" id="explorer-filters" role="search">
          <div class="field"><label for="search-vaccine">Buscar</label><div class="input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 4a6.5 6.5 0 1 0 3.94 11.67L19.77 21 21 19.77l-5.33-5.33A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"/></svg><input id="search-vaccine" name="search" type="search" autocomplete="off" placeholder="Producto, registro o titular"></div></div>
          <div class="field"><label for="filter-pai">Relación PAI</label><select id="filter-pai" name="pai"><option value="">Todos</option><option value="YES">Con relación PAI</option><option value="UNKNOWN">No verificado</option></select></div>
          <div class="field"><label for="filter-platform">Tecnología</label><select id="filter-platform" name="platform"><option value="">Todas</option>${technologyOptions.map((item) => `<option value="${escapeHtml(item)}">${escapeHtml(displayLabel(item))}</option>`).join("")}<option value="NO_PUBLICADO">Sin tecnología publicada</option></select></div>
          <div class="field"><label for="filter-country">País citado</label><select id="filter-country" name="country"><option value="">Todos</option>${countryStats().map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)} · ${item.records}</option>`).join("")}</select></div>
          <div class="field"><label for="filter-coverage">Cobertura</label><select id="filter-coverage" name="coverage"><option value="">Cualquier cobertura</option><option value="biological_systems">Con línea o sustrato biológico</option><option value="quantities">Con cantidades</option><option value="diluent">Con diluyente</option><option value="strong_external_composition">Con composición externa fuerte</option></select></div>
        </form>
        <div class="results-meta"><div class="results-summary"><span id="results-count" aria-live="polite"></span><span class="results-instruction" id="explorer-row-help">(Haga clic en cualquier fila para abrir la ficha del producto.)</span></div><button class="ghost-button" type="button" data-action="reset-filters">Limpiar filtros</button></div>
        <div class="data-table-wrap" id="results-table"></div>
      </section>`;
    const filterForm = document.getElementById("explorer-filters");
    filterForm.addEventListener("input", updateExplorerResults);
    if (explorerCountry) filterForm.elements.country.value = explorerCountry;
    updateExplorerResults();
  };

  const updateExplorerResults = () => {
    const form = document.getElementById("explorer-filters");
    if (!form) return;
    const fields = new FormData(form);
    const query = normalize(fields.get("search"));
    const pai = fields.get("pai");
    const platform = fields.get("platform");
    const country = fields.get("country");
    const coverage = fields.get("coverage");
    explorerCountry = country;
    const results = data.vaccines.filter((vaccine) => {
      const searchable = normalize([vaccine.regulatory.product_name, vaccine.regulatory.registration, vaccine.regulatory.holder.value, vaccine.regulatory.target_disease.value, biologicalSystemNames(vaccine)].join(" "));
      if (query && !searchable.includes(query)) return false;
      if (pai && vaccine.regulatory.pai.status !== pai) return false;
      if (platform === "NO_PUBLICADO" && vaccine.technologies.length) return false;
      if (platform && platform !== "NO_PUBLICADO" && !vaccine.technologies.some((item) => item.platform === platform)) return false;
      if (country && !vaccine.regulatory.associated_countries.values.includes(country)) return false;
      if (coverage && !vaccine.coverage[coverage]) return false;
      return true;
    });
    document.getElementById("results-count").innerHTML = `<strong>${results.length}</strong> de ${data.vaccines.length} registros`;
    const target = document.getElementById("results-table");
    if (!results.length) {
      target.innerHTML = '<div class="empty-results"><strong>No hay coincidencias.</strong><br>Ajuste los filtros; no se eliminó ningún registro del mart.</div>';
      return;
    }
    target.innerHTML = `<table class="data-table"><thead><tr><th>Producto / registro</th><th>PAI</th><th>Tecnología</th><th>Línea o sustrato biológico</th><th>Coberturas visibles</th><th>Evidencia</th><th><span class="sr-only">Acción</span></th></tr></thead><tbody>${results.map((vaccine) => `
      <tr class="record-row">
        <td class="product-cell"><strong>${escapeHtml(vaccine.regulatory.product_name)}</strong><span>${escapeHtml(vaccine.regulatory.registration)}</span><span class="product-system-mobile"><strong>Línea o sustrato:</strong> ${vaccine.biological_systems.length ? escapeHtml(biologicalSystemNames(vaccine)) : "No publicado"}</span></td>
        <td>${badge(vaccine.regulatory.pai.status)}</td>
        <td>${vaccine.technologies.length ? escapeHtml(vaccine.technologies.map((item) => displayLabel(item.platform)).join(" · ")) : badge("NO_PUBLICADO")}</td>
        <td class="system-cell">${biologicalSystemList(vaccine)}</td>
        <td><div class="coverage-dots" aria-label="Tecnología, componentes, sistema y empaque"><span class="coverage-dot ${vaccine.coverage.technology ? "on" : ""}" title="Tecnología">T</span><span class="coverage-dot ${vaccine.coverage.structured_components ? "on" : ""}" title="Componentes">C</span><span class="coverage-dot ${vaccine.coverage.biological_systems ? "on" : ""}" title="Sistema biológico">S</span><span class="coverage-dot ${vaccine.coverage.primary_packaging ? "on" : ""}" title="Empaque">E</span></div></td>
        <td>${formatNumber(vaccine.evidence_summary.evidence_count)} vínculos</td>
        <td><a class="link-button row-link" href="#vacuna/${encodeURIComponent(vaccine.record_id)}" aria-label="Ver ficha de ${escapeHtml(vaccine.regulatory.product_name)}">Ver ficha ${iconArrow}</a></td>
      </tr>`).join("")}</tbody></table>`;
  };

  const relationTrace = (item) => {
    const identifiers = [item.technology_id, item.relation_id, item.component_id, item.system_id, item.site_id, item.packaging_id].filter(Boolean);
    return `<details class="lineage-disclosure"><summary>Ver trazabilidad</summary>${identifiers.map((id) => `<code>ID: ${escapeHtml(id)}</code>`).join("")}${item.source_id ? `<code>ID de fuente: ${escapeHtml(item.source_id)}</code>` : ""}${item.evidence_id ? `<code>ID de evidencia: ${escapeHtml(item.evidence_id)}</code>` : ""}</details>`;
  };

  const relationCards = (items, type) => {
    if (!items.length) return `<div class="empty-results">${badge("NO_PUBLICADO")}<br>No existe información positiva para este registro.</div>`;
    return `<div class="relation-list">${items.map((item) => {
      if (type === "technology") return `<article class="relation-card"><div class="relation-card-header"><h3>${escapeHtml(displayLabel(item.platform))}</h3>${badge(item.data_status)}</div><p>${escapeHtml(displayLabel(item.detail || item.original_value))}</p><div class="relation-meta">${badge(item.match_status)}</div>${relationTrace(item)}</article>`;
      if (type === "system") return `<article class="relation-card"><div class="relation-card-header"><h3>${escapeHtml(item.name)}</h3>${badge(item.data_status)}</div><p>${escapeHtml(displayLabel(item.production_role))} · ${escapeHtml(displayLabel(item.system_type))}</p>${relationTrace(item)}</article>`;
      if (type === "packaging") return `<article class="relation-card"><div class="relation-card-header"><h3>${escapeHtml(displayLabel(item.container_type))}</h3>${badge(item.data_status)}</div><p>${item.material.status === "AVAILABLE" ? escapeHtml(item.material.value) : escapeHtml(labelMap[item.material.status] || item.material.status)}</p><div class="relation-meta">${item.volume.status === "AVAILABLE" ? `<span class="status-badge available">${escapeHtml(item.volume.value)} ${escapeHtml(item.volume_unit)}</span>` : badge(item.volume.status)}</div>${relationTrace(item)}</article>`;
      return "";
    }).join("")}</div>`;
  };

  const componentSection = (vaccine) => {
    const classes = Object.entries(vaccine.components.reduce((acc, item) => { acc[item.component_class] = (acc[item.component_class] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]);
    if (!vaccine.components.length) return '<div class="empty-results">No hay componentes estructurados para este registro.</div>';
    return `<div class="class-summary">${classes.map(([name, count]) => `<span class="class-chip">${escapeHtml(displayLabel(name))} · ${count}</span>`).join("")}</div>
      <div class="data-table-wrap"><table class="component-table"><thead><tr><th>Componente</th><th>Clase / estado</th><th>Cantidad</th><th>Origen</th></tr></thead><tbody>${vaccine.components.map((item) => `
        <tr><td>${escapeHtml(item.name)}${item.identifiers.length ? `<div class="relation-meta">${item.identifiers.map((id) => `<span class="status-badge verified">${escapeHtml(id.type)} ${escapeHtml(id.value)}</span>`).join("")}</div>` : ""}</td><td>${escapeHtml(displayLabel(item.component_class))}<br>${badge(item.data_status)}</td><td>${item.amount.status === "AVAILABLE" ? `<span class="amount-value">${escapeHtml(item.amount.value)} ${escapeHtml(item.amount_unit)} · ${escapeHtml(displayLabel(item.amount_qualifier))}</span>` : badge(item.amount.status)}</td><td>${relationTrace(item)}</td></tr>`).join("")}</tbody></table></div>`;
  };

  const siteSection = (vaccine) => {
    if (!vaccine.manufacturer_sites.length) return '<div class="empty-results">No hay evidencia fabricante/sitio.</div>';
    return `<div class="relation-list">${vaccine.manufacturer_sites.map((site) => `
      <article class="relation-card"><div class="relation-card-header"><h3>${site.manufacturer.status === "AVAILABLE" ? escapeHtml(site.manufacturer.value) : escapeHtml(labelMap[site.manufacturer.status] || site.manufacturer.status)}</h3>${badge(site.relation_status)}</div><p>${site.site.status === "AVAILABLE" ? escapeHtml(site.site.value) : escapeHtml(labelMap[site.site.status] || site.site.status)} · ${site.country.status === "AVAILABLE" ? escapeHtml(site.country.value) : escapeHtml(labelMap[site.country.status] || site.country.status)}</p>${site.resolution_reasons ? `<div class="relation-meta">${badge("PARTIAL", displayReasonList(site.resolution_reasons))}</div>` : ""}${relationTrace(site)}</article>`).join("")}</div>`;
  };

  const coverageMatrix = (coverage) => {
    const labels = { technology: "Tecnología", structured_components: "Componentes", strong_external_composition: "Composición externa fuerte", biological_systems: "Sistema biológico", quantities: "Cantidades", diluent: "Diluyente", primary_packaging: "Empaque primario" };
    return Object.entries(labels).map(([key, label]) => `<div class="coverage-status"><span>${label}</span><strong class="${coverage[key] ? "on" : "off"}">${coverage[key] ? "DISPONIBLE" : "SIN COBERTURA POSITIVA"}</strong></div>`).join("");
  };

  const renderDetail = (recordId) => {
    const vaccine = data.vaccines.find((item) => item.record_id === recordId);
    if (!vaccine) { window.location.hash = "explorador"; showToast("El registro solicitado no existe en Demo v0.1."); return; }
    setActiveNav("explorador");
    pageLabel.textContent = "Ficha de vacuna";
    const r = vaccine.regulatory;
    app.innerHTML = `
      <article class="view" aria-labelledby="detail-title">
        <a class="link-button back-link" href="#explorador">${iconBack} Volver al explorador</a>
        <header class="detail-header"><div class="detail-title"><span class="eyebrow">Registro regulatorio · ${escapeHtml(r.observed_at)}</span><h1 id="detail-title">${escapeHtml(r.product_name)}</h1><p>${escapeHtml(r.registration)} · ${r.holder.status === "AVAILABLE" ? escapeHtml(r.holder.value) : "Titular no verificado"}</p><div class="badge-row">${badge(r.registration_status)} ${badge(r.pai.status)} ${badge(r.resolution_status)}</div></div><div class="detail-fact"><span>Vínculos de evidencia</span><strong>${formatNumber(vaccine.evidence_summary.evidence_count)}</strong></div></header>
        <div class="detail-grid">
          <div class="detail-main">
            <section class="detail-section" aria-labelledby="regulatory-title"><div class="detail-section-header"><div><h2 id="regulatory-title">Identidad regulatoria</h2><p>Datos del catálogo INVIMA vigente del proyecto.</p></div></div><div class="fact-grid"><div class="fact-item"><span>Enfermedad objetivo</span>${valueBlock(r.target_disease)}</div><div class="fact-item"><span>Vía de administración</span>${valueBlock(r.administration_route)}</div><div class="fact-item"><span>Forma farmacéutica</span>${valueBlock(r.dosage_form)}</div><div class="fact-item"><span>Grupo PAI</span>${valueBlock(r.pai.group)}</div><div class="fact-item wide"><span>Presentación</span>${valueBlock(r.presentation)}</div><div class="fact-item wide"><span>Países asociados en evidencia fabricante/sitio</span><strong>${r.associated_countries.values.length ? escapeHtml(r.associated_countries.values.join(" · ")) : escapeHtml(labelMap[r.associated_countries.status] || r.associated_countries.status)}</strong><span class="scope-note">${escapeHtml(r.associated_countries.label_scope)}</span></div></div><p class="scope-note">${escapeHtml(r.pai.scope)}</p></section>
            <section class="detail-section" aria-labelledby="technology-title"><div class="detail-section-header"><div><h2 id="technology-title">Tecnología publicada</h2><p>Clasificación no exclusiva; no implica proceso, equipo o capacidad no publicados.</p></div><span class="count-pill">${vaccine.technologies.length}</span></div>${relationCards(vaccine.technologies, "technology")}</section>
            <section class="detail-section" aria-labelledby="components-title"><div class="detail-section-header"><div><h2 id="components-title">Componentes</h2><p>Formulación, proceso, residuos y trazas conservan su rol de ciclo de vida.</p></div><span class="count-pill">${vaccine.components.length}</span></div>${componentSection(vaccine)}<p class="scope-note">La composición externa con coincidencia fuerte conserva estado derivado y no constituye equivalencia regulatoria exacta ni lista industrial de materiales.</p></section>
            <section class="detail-section" aria-labelledby="systems-title"><div class="detail-section-header"><div><h2 id="systems-title">Líneas y sustratos biológicos</h2><p>Incluye líneas celulares, células primarias, huevos embrionados, levaduras o bacterias solo cuando la relación es explícita; no se extrapola entre productos.</p></div><span class="count-pill">${vaccine.biological_systems.length}</span></div>${relationCards(vaccine.biological_systems, "system")}</section>
            <section class="detail-section" aria-labelledby="packaging-title"><div class="detail-section-header"><div><h2 id="packaging-title">Empaque primario</h2><p>Contenedor y material cuando fueron publicados o estructurados.</p></div><span class="count-pill">${vaccine.primary_packaging.length}</span></div>${relationCards(vaccine.primary_packaging, "packaging")}</section>
            <section class="detail-section" aria-labelledby="sites-title"><div class="detail-section-header"><div><h2 id="sites-title">Evidencia fabricante / sitio</h2><p>Fabricante, domicilio, país y relación se evalúan por separado.</p></div><span class="count-pill">${vaccine.manufacturer_sites.length}</span></div>${siteSection(vaccine)}<p class="scope-note">Un fabricante no equivale automáticamente a un sitio; un sitio asociado no prueba que allí se realicen todas las etapas.</p></section>
          </div>
          <aside class="detail-aside" aria-label="Resumen de la ficha"><section class="aside-panel"><h2>Cobertura de esta ficha</h2><div class="coverage-matrix">${coverageMatrix(vaccine.coverage)}</div></section><section class="aside-panel"><h2>Linaje</h2><div class="trace-list"><div class="trace-row"><span>Registro</span><strong>${escapeHtml(vaccine.record_id.slice(0, 10))}…</strong></div><div class="trace-row"><span>Fuentes vinculadas</span><strong>${vaccine.evidence_summary.source_ids.length}</strong></div><div class="trace-row"><span>Origen</span><strong>S1 + S2</strong></div></div><button class="secondary-button" type="button" data-action="open-record-evidence" data-record-id="${escapeHtml(vaccine.record_id)}" style="width:100%;margin-top:18px">Ver trazabilidad completa</button></section></aside>
        </div>
      </article>`;
  };

  const renderPending = (key) => {
    const module = data.future_modules.find((item) => item.key === key);
    const navKey = key === "historical" ? "historico" : "capacidad";
    setActiveNav(navKey);
    pageLabel.textContent = module.label;
    app.innerHTML = `<section class="view pending-view" aria-labelledby="pending-title"><div class="pending-panel"><div class="pending-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 8.95 10H19a7 7 0 1 1-2.05-5L14 11h7V4l-2.63 2.63A8.96 8.96 0 0 0 12 3Zm-1 4v6h5v-2h-3V7h-2Z"/></svg></div><span class="eyebrow">Próxima fase</span><h1 id="pending-title">${escapeHtml(module.label)}</h1><p>${escapeHtml(module.message)}</p><span class="pending-label">Investigación en curso</span><div class="hero-actions" style="justify-content:center"><a class="secondary-button" href="#inicio">Volver al inicio</a></div></div></section>`;
  };

  const renderEvidenceDialog = (vaccine = null) => {
    const sources = vaccine ? data.sources.filter((source) => vaccine.evidence_summary.source_ids.includes(source.source_id)) : data.sources;
    dialogContent.innerHTML = `
      <p class="dialog-intro">${vaccine ? `Procedencia de <strong>${escapeHtml(vaccine.regulatory.product_name)}</strong>.` : "Demo v0.1 presenta exclusivamente conocimiento aprobado científicamente."} La interfaz resume la información sin cambiar su significado ni completar vacíos.</p>
      ${vaccine ? `<section class="dialog-section"><h3>Identificador del registro</h3><div class="artifact-item"><code>${escapeHtml(vaccine.record_id)}</code><span>${formatNumber(vaccine.evidence_summary.evidence_count)} vínculos de evidencia · ${vaccine.evidence_summary.source_ids.length} fuentes</span></div></section>` : ""}
      <section class="dialog-section"><h3>Cómo llega la evidencia a esta pantalla</h3><div class="lineage-flow"><div class="lineage-step"><span class="lineage-number">01</span><strong>Datos científicos aprobados</strong><p>Fuentes institucionales y controles de calidad.</p></div><div class="lineage-step"><span class="lineage-number">02</span><strong>Preparación para presentación</strong><p>Resumen reproducible sin inventar valores.</p></div><div class="lineage-step"><span class="lineage-number">03</span><strong>Interfaz interactiva</strong><p>Consulta local y sin conexión.</p></div></div></section>
      <section class="dialog-section"><h3>${vaccine ? "Fuentes vinculadas a esta ficha" : `${sources.length} fuentes oficiales vinculadas`}</h3><div class="source-list">${sources.map((source) => `<div class="source-item"><strong>${escapeHtml(source.organization || source.dataset || "Fuente institucional")}</strong><span>${escapeHtml(source.dataset || source.document || "Documento oficial")}</span><a href="${escapeHtml(source.public_url)}" target="_blank" rel="noopener noreferrer">Abrir fuente institucional</a></div>`).join("")}</div></section>
      <details class="technical-disclosure"><summary>Ver detalle técnico para auditoría (${data.lineage.length} archivos)</summary><div class="artifact-list">${data.lineage.map((item) => `<div class="artifact-item"><strong>${escapeHtml(item.artifact)}</strong><span>${escapeHtml(item.sprint)} · ${escapeHtml(item.version)} · ${formatNumber(item.rows)} filas · ${escapeHtml(displayLabel(item.gate))}</span><code>SHA-256 ${escapeHtml(item.sha256)}</code></div>`).join("")}</div></details>
      <p class="scope-note">La siguiente fase de investigación no alimenta esta versión. Histórico y Capacidad Nacional permanecen sin resultados hasta que exista evidencia aprobada.</p>`;
  };

  const openDialog = (vaccine = null) => {
    renderEvidenceDialog(vaccine);
    dialog.showModal();
    dialog.querySelector("[data-action='close-evidence']").focus();
  };

  const route = () => {
    const raw = window.location.hash.slice(1) || "inicio";
    const [section, encodedId] = raw.split("/");
    document.body.classList.toggle("dashboard-route", section === "inicio");
    sidebar.classList.remove("open");
    document.querySelector("[data-action='toggle-menu']")?.setAttribute("aria-expanded", "false");
    if (section === "explorador") renderExplorer();
    else if (section === "vacuna" && encodedId) renderDetail(decodeURIComponent(encodedId));
    else if (section === "historico") renderPending("historical");
    else if (section === "capacidad") renderPending("national_capacity");
    else renderHome();
    window.scrollTo({ top: 0, behavior: "auto" });
    main.focus({ preventScroll: true });
  };

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "open-evidence") openDialog();
    if (action === "close-evidence") dialog.close();
    if (action === "open-record-evidence") openDialog(data.vaccines.find((item) => item.record_id === target.dataset.recordId));
    if (action === "toggle-menu") { const open = sidebar.classList.toggle("open"); target.setAttribute("aria-expanded", String(open)); }
    if (action === "select-country") updateCountrySelection(target.dataset.country);
    if (action === "close-country") closeCountryDetail();
    if (action === "explore-country") { explorerCountry = target.dataset.country; window.location.hash = "explorador"; }
    if (action === "reset-filters") { explorerCountry = ""; const form = document.getElementById("explorer-filters"); form?.reset(); updateExplorerResults(); form?.querySelector("input")?.focus(); }
  });

  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sidebar.classList.contains("open")) { sidebar.classList.remove("open"); document.querySelector("[data-action='toggle-menu']")?.setAttribute("aria-expanded", "false"); }
  });
  window.addEventListener("hashchange", route);
  route();
})();
