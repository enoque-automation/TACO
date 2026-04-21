/* ═══════════════════════════════════════════════════════════════
   TACOvis — script.js
   Vanilla JS, zero dependencies
═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── STATE ────────────────────────────────────────────────────
const S = {
  all:        [],       // full dataset
  filtered:   [],       // current filtered+sorted list
  page:       1,
  perPage:    60,
  view:       'grid',   // 'grid' | 'list'
  favorites:  new Set(),
  images:     {},       // id → dataURL/URL
  edits:      {},       // id → {nome, categoria}
  compareSet: new Set(),
  currentId:  null,
  search:     '',
  filterCat:  '',
  filterNutr: '',
  kcalMin:    0,
  kcalMax:    99999,
  sortBy:     'nome',
  theme:      'dark',
};

// ─── PERSISTENCE ──────────────────────────────────────────────
function persist() {
  try {
    localStorage.setItem('taco_favs',   JSON.stringify([...S.favorites]));
    localStorage.setItem('taco_images', JSON.stringify(S.images));
    localStorage.setItem('taco_edits',  JSON.stringify(S.edits));
    localStorage.setItem('taco_theme',  S.theme);
  } catch(e) { /* localStorage quota */ }
}
function loadPersist() {
  try {
    S.favorites = new Set(JSON.parse(localStorage.getItem('taco_favs')  || '[]'));
    S.images    = JSON.parse(localStorage.getItem('taco_images') || '{}');
    S.edits     = JSON.parse(localStorage.getItem('taco_edits')  || '{}');
    S.theme     = localStorage.getItem('taco_theme') || 'dark';
  } catch(e) {}
}

// ─── NUTRIENT LABELS ──────────────────────────────────────────
const LABELS = {
  umidade_pct:      ['Umidade',          '%'],
  energia_kcal:     ['Energia',          'kcal'],
  energia_kj:       ['Energia',          'kJ'],
  proteina_g:       ['Proteína',         'g'],
  lipidios_g:       ['Lipídios',         'g'],
  colesterol_mg:    ['Colesterol',       'mg'],
  carboidrato_g:    ['Carboidrato',      'g'],
  fibra_g:          ['Fibra alimentar',  'g'],
  cinzas_g:         ['Cinzas',           'g'],
  calcio_mg:        ['Cálcio',           'mg'],
  magnesio_mg:      ['Magnésio',         'mg'],
  manganes_mg:      ['Manganês',         'mg'],
  fosforo_mg:       ['Fósforo',          'mg'],
  ferro_mg:         ['Ferro',            'mg'],
  sodio_mg:         ['Sódio',            'mg'],
  potassio_mg:      ['Potássio',         'mg'],
  cobre_mg:         ['Cobre',            'mg'],
  zinco_mg:         ['Zinco',            'mg'],
  retinol_mcg:      ['Retinol',          'µg'],
  re_mcg:           ['Equivalente Retinol','µg'],
  rae_mcg:          ['RAE',              'µg'],
  tiamina_mg:       ['Tiamina (B1)',     'mg'],
  riboflavina_mg:   ['Riboflavina (B2)', 'mg'],
  piridoxina_mg:    ['Piridoxina (B6)',  'mg'],
  niacina_mg:       ['Niacina (B3)',     'mg'],
  vit_c_mg:         ['Vitamina C',       'mg'],
  sat_g:            ['Saturados',        'g'],
  mono_g:           ['Monoinsaturados',  'g'],
  poli_g:           ['Poliinsaturados',  'g'],
  ac_12_0_g:        ['12:0',             'g'],
  ac_14_0_g:        ['14:0',             'g'],
  ac_16_0_g:        ['16:0',             'g'],
  ac_18_0_g:        ['18:0',             'g'],
  ac_20_0_g:        ['20:0',             'g'],
  ac_22_0_g:        ['22:0',             'g'],
  ac_24_0_g:        ['24:0',             'g'],
  ac_14_1_g:        ['14:1',             'g'],
  ac_16_1_g:        ['16:1',             'g'],
  ac_18_1_g:        ['18:1',             'g'],
  ac_20_1_g:        ['20:1',             'g'],
  ac_18_2n6_g:      ['18:2 n-6',         'g'],
  ac_18_3n3_g:      ['18:3 n-3',         'g'],
  ac_20_4_g:        ['20:4',             'g'],
  ac_20_5_g:        ['20:5 (EPA)',        'g'],
  ac_22_5_g:        ['22:5',             'g'],
  ac_22_6_g:        ['22:6 (DHA)',        'g'],
  ac_18_1t_g:       ['18:1t (trans)',    'g'],
  ac_18_2t_g:       ['18:2t (trans)',    'g'],
  triptofano_g:     ['Triptofano',       'g'],
  treonina_g:       ['Treonina',         'g'],
  isoleucina_g:     ['Isoleucina',       'g'],
  leucina_g:        ['Leucina',          'g'],
  lisina_g:         ['Lisina',           'g'],
  metionina_g:      ['Metionina',        'g'],
  cistina_g:        ['Cistina',          'g'],
  fenilalanina_g:   ['Fenilalanina',     'g'],
  tirosina_g:       ['Tirosina',         'g'],
  valina_g:         ['Valina',           'g'],
  arginina_g:       ['Arginina',         'g'],
  histidina_g:      ['Histidina',        'g'],
  alanina_g:        ['Alanina',          'g'],
  ac_aspartico_g:   ['Ác. Aspártico',    'g'],
  ac_glutamico_g:   ['Ác. Glutâmico',   'g'],
  glicina_g:        ['Glicina',          'g'],
  prolina_g:        ['Prolina',          'g'],
  serina_g:         ['Serina',           'g'],
};

const SECTIONS = {
  'Composição centesimal': ['umidade_pct','energia_kcal','energia_kj','proteina_g','lipidios_g','colesterol_mg','carboidrato_g','fibra_g','cinzas_g'],
  'Minerais':              ['calcio_mg','magnesio_mg','manganes_mg','fosforo_mg','ferro_mg','sodio_mg','potassio_mg','cobre_mg','zinco_mg'],
  'Vitaminas':             ['retinol_mcg','re_mcg','rae_mcg','tiamina_mg','riboflavina_mg','piridoxina_mg','niacina_mg','vit_c_mg'],
  'Ácidos graxos — total': ['sat_g','mono_g','poli_g'],
  'Ácidos graxos — específicos': ['ac_12_0_g','ac_14_0_g','ac_16_0_g','ac_18_0_g','ac_20_0_g','ac_22_0_g','ac_24_0_g','ac_14_1_g','ac_16_1_g','ac_18_1_g','ac_20_1_g','ac_18_2n6_g','ac_18_3n3_g','ac_20_4_g','ac_20_5_g','ac_22_5_g','ac_22_6_g','ac_18_1t_g','ac_18_2t_g'],
  'Aminoácidos':           ['triptofano_g','treonina_g','isoleucina_g','leucina_g','lisina_g','metionina_g','cistina_g','fenilalanina_g','tirosina_g','valina_g','arginina_g','histidina_g','alanina_g','ac_aspartico_g','ac_glutamico_g','glicina_g','prolina_g','serina_g'],
};

// ─── FOOD EMOJI MAPPING ───────────────────────────────────────
function getEmoji(nome, cat) {
  const n = (nome || '').toLowerCase();
  const c = (cat  || '').toLowerCase();
  if (n.includes('arroz')) return '🍚';
  if (n.includes('feijão') || n.includes('feijao')) return '🫘';
  if (n.includes('frango') || n.includes('galinha')) return '🍗';
  if (n.includes('bife') || n.includes('bovino') || n.includes('carne')) return '🥩';
  if (n.includes('peixe') || n.includes('atum') || n.includes('salmão') || c.includes('pescado')) return '🐟';
  if (n.includes('leite')) return '🥛';
  if (n.includes('queijo')) return '🧀';
  if (n.includes('ovo')) return '🥚';
  if (n.includes('pão') || n.includes('pao')) return '🍞';
  if (n.includes('banana')) return '🍌';
  if (n.includes('maçã') || n.includes('maca')) return '🍎';
  if (n.includes('laranja')) return '🍊';
  if (n.includes('uva')) return '🍇';
  if (n.includes('manga')) return '🥭';
  if (n.includes('abacate')) return '🥑';
  if (n.includes('limão') || n.includes('limao')) return '🍋';
  if (n.includes('morango')) return '🍓';
  if (n.includes('tomate')) return '🍅';
  if (n.includes('cenoura')) return '🥕';
  if (n.includes('alface')) return '🥬';
  if (n.includes('batata')) return '🥔';
  if (n.includes('abóbora') || n.includes('abobora')) return '🎃';
  if (n.includes('milho')) return '🌽';
  if (n.includes('chocolate')) return '🍫';
  if (n.includes('biscoito') || n.includes('bolacha')) return '🍪';
  if (n.includes('bolo')) return '🎂';
  if (n.includes('sorvete')) return '🍦';
  if (n.includes('café') || n.includes('cafe')) return '☕';
  if (n.includes('cerveja')) return '🍺';
  if (n.includes('vinho')) return '🍷';
  if (n.includes('óleo') || n.includes('oleo') || n.includes('manteiga')) return '🫙';
  if (n.includes('açúcar') || n.includes('acucar')) return '🧂';
  if (c.includes('fruta')) return '🍎';
  if (c.includes('verdura') || c.includes('hortali')) return '🥦';
  if (c.includes('cereal')) return '🌾';
  if (c.includes('peixe') || c.includes('pescado')) return '🐟';
  if (c.includes('carne')) return '🥩';
  if (c.includes('leite')) return '🥛';
  if (c.includes('leguminosa')) return '🫘';
  if (c.includes('bebida')) return '🥤';
  return '🍽️';
}

// ─── CATEGORY CSS CLASS ───────────────────────────────────────
function catClass(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('cereal'))     return 'cat-cereais';
  if (c.includes('verdura') || c.includes('hortali')) return 'cat-verduras';
  if (c.includes('fruta'))      return 'cat-frutas';
  if (c.includes('gordura'))    return 'cat-gorduras';
  if (c.includes('pescado'))    return 'cat-pescados';
  if (c.includes('carne'))      return 'cat-carnes';
  if (c.includes('leite'))      return 'cat-leite';
  if (c.includes('bebida'))     return 'cat-bebidas';
  if (c.includes('ovo'))        return 'cat-ovos';
  if (c.includes('leguminosa')) return 'cat-leguminosas';
  if (c.includes('preparado'))  return 'cat-preparados';
  return 'cat-outros';
}

// ─── PARSE ────────────────────────────────────────────────────
function parseJSON(text) {
  const data = JSON.parse(text);
  // TACO-style: {alimentos: [...]}
  if (data.alimentos && Array.isArray(data.alimentos)) return data.alimentos;
  // Array directly
  if (Array.isArray(data)) return data;
  // Single object with array in any key
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key]) && data[key].length > 0 && typeof data[key][0] === 'object')
      return data[key];
  }
  return [];
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  // Detect separator
  const firstLine = lines[0];
  const sep = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';
  const headers = splitCSVLine(firstLine, sep);
  return lines.slice(1).map(line => {
    const vals = splitCSVLine(line, sep);
    const obj = {};
    headers.forEach((h, i) => {
      const raw = (vals[i] || '').trim();
      obj[h.trim()] = isNaN(raw) || raw === '' ? raw : Number(raw);
    });
    // Normalize common header names
    if (!obj.nome && obj['Descrição dos alimentos']) obj.nome = obj['Descrição dos alimentos'];
    if (!obj.nome && obj['nome_alimento']) obj.nome = obj['nome_alimento'];
    if (!obj.nome && obj['description']) obj.nome = obj['description'];
    if (!obj.categoria && obj['Categoria']) obj.categoria = obj['Categoria'];
    if (!obj.id && obj['Número do Alimento']) obj.id = String(obj['Número do Alimento']);
    if (!obj.id && obj['codigo']) obj.id = String(obj['codigo']);
    return obj;
  }).filter(r => r.nome || Object.keys(r).length > 2);
}

function splitCSVLine(line, sep) {
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === sep && !inQ) { result.push(cur); cur = ''; continue; }
    cur += ch;
  }
  result.push(cur);
  return result;
}

function normalizeFood(raw, idx) {
  const f = { ...raw };
  // Ensure id
  if (!f.id) f.id = String(raw['Número do Alimento'] || raw.codigo || raw.code || idx + 1);
  // Ensure nome
  if (!f.nome) f.nome = raw['Descrição dos alimentos'] || raw.name || raw.description || `Alimento ${f.id}`;
  // Ensure categoria
  if (!f.categoria) f.categoria = raw.category || raw.group || 'Outros';
  return f;
}

function loadDataset(text, filename) {
  let raw = [];
  const ext = (filename || '').split('.').pop().toLowerCase();
  try {
    if (ext === 'csv') raw = parseCSV(text);
    else raw = parseJSON(text);
  } catch(e) {
    // Try other parser
    try { raw = ext === 'json' ? parseCSV(text) : parseJSON(text); }
    catch(e2) { toast('❌ Erro ao parsear arquivo'); return; }
  }

  if (!raw.length) { toast('⚠ Nenhum alimento encontrado'); return; }

  S.all = raw.map(normalizeFood);
  // Apply persisted edits
  S.all.forEach(f => {
    if (S.edits[f.id]) {
      if (S.edits[f.id].nome) f.nome = S.edits[f.id].nome;
      if (S.edits[f.id].categoria) f.categoria = S.edits[f.id].categoria;
    }
  });

  // Save to recent
  saveRecent(filename, S.all.length);

  updateStats();
  populateCatFilter();
  updateKcalRange();
  applyFilters();
  showGallery();
  toast(`✓ ${S.all.length} alimentos carregados`);
}

// ─── STATS ────────────────────────────────────────────────────
function updateStats() {
  const a = S.all;
  if (!a.length) return;
  document.getElementById('statTotal').textContent = a.length;
  document.getElementById('statCats').textContent = new Set(a.map(f => f.categoria)).size;

  const withKcal = a.filter(f => f.energia_kcal != null);
  document.getElementById('statAvgKcal').textContent =
    withKcal.length ? Math.round(withKcal.reduce((s,f) => s + f.energia_kcal, 0) / withKcal.length) : '—';

  const topProt = a.filter(f => f.proteina_g != null).sort((a,b) => b.proteina_g - a.proteina_g)[0];
  document.getElementById('statTopProt').textContent = topProt
    ? truncate(topProt.nome, 18) + ` (${topProt.proteina_g}g)` : '—';

  const lowKcal = withKcal.filter(f => f.energia_kcal > 0).sort((a,b) => a.energia_kcal - b.energia_kcal)[0];
  document.getElementById('statLowKcal').textContent = lowKcal
    ? truncate(lowKcal.nome, 18) + ` (${lowKcal.energia_kcal}kcal)` : '—';

  document.getElementById('statsBar').classList.remove('hidden');
}

// ─── FILTER / SORT ────────────────────────────────────────────
function applyFilters() {
  const q = S.search.toLowerCase();

  S.filtered = S.all.filter(f => {
    // Search
    if (q && !f.nome?.toLowerCase().includes(q) &&
             !f.categoria?.toLowerCase().includes(q) &&
             !String(f.id).includes(q)) return false;
    // Category
    if (S.filterCat && f.categoria !== S.filterCat) return false;
    // Kcal range
    const kcal = f.energia_kcal;
    if (kcal != null && (kcal < S.kcalMin || kcal > S.kcalMax)) return false;
    // Nutrient filter
    switch (S.filterNutr) {
      case 'prot_high': if (!(f.proteina_g >= 20)) return false; break;
      case 'carb_low':  if (!(f.carboidrato_g <= 10)) return false; break;
      case 'fat_low':   if (!(f.lipidios_g <= 5)) return false; break;
      case 'low_kcal':  if (!(f.energia_kcal <= 100)) return false; break;
      case 'with_img':  if (!S.images[f.id] && !f.imagem_url) return false; break;
      case 'favs':      if (!S.favorites.has(String(f.id))) return false; break;
    }
    return true;
  });

  // Sort
  S.filtered.sort((a, b) => {
    switch (S.sortBy) {
      case 'nome':      return (a.nome||'').localeCompare(b.nome||'');
      case 'kcal_asc':  return (a.energia_kcal||0) - (b.energia_kcal||0);
      case 'kcal_desc': return (b.energia_kcal||0) - (a.energia_kcal||0);
      case 'prot':      return (b.proteina_g||0) - (a.proteina_g||0);
      case 'carb':      return (b.carboidrato_g||0) - (a.carboidrato_g||0);
      case 'fat':       return (b.lipidios_g||0) - (a.lipidios_g||0);
      case 'cat':       return (a.categoria||'').localeCompare(b.categoria||'');
      default:          return 0;
    }
  });

  S.page = 1;
  renderGrid();
  updateResultsInfo();
}

function updateResultsInfo() {
  const el = document.getElementById('resultsInfo');
  const cnt = document.getElementById('resultsCount');
  if (S.all.length) {
    el.classList.remove('hidden');
    const active = S.search || S.filterCat || S.filterNutr || S.kcalMin > 0 || S.kcalMax < 99999;
    cnt.textContent = active
      ? `${S.filtered.length} de ${S.all.length} alimentos`
      : `${S.all.length} alimentos`;
  }
}

// ─── RENDER GRID ──────────────────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('foodGrid');
  const start = (S.page - 1) * S.perPage;
  const page  = S.filtered.slice(start, start + S.perPage);

  if (!S.filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <span class="empty-icon">🔍</span>
      <h3>Nenhum alimento encontrado</h3>
      <p>Tente outros termos de busca ou filtros.</p>
    </div>`;
    document.getElementById('pagination').classList.add('hidden');
    return;
  }

  grid.innerHTML = page.map(f => cardHTML(f)).join('');

  // Pagination
  const total = Math.ceil(S.filtered.length / S.perPage);
  const pag = document.getElementById('pagination');
  if (total > 1) {
    pag.classList.remove('hidden');
    document.getElementById('pageInfo').textContent = `Página ${S.page} de ${total}`;
    document.getElementById('prevPage').disabled = S.page === 1;
    document.getElementById('nextPage').disabled = S.page === total;
  } else {
    pag.classList.add('hidden');
  }
}

function cardHTML(f) {
  const id      = String(f.id);
  const nome    = f.nome || 'Sem nome';
  const cat     = f.categoria || '';
  const cls     = catClass(cat);
  const isFav   = S.favorites.has(id);
  const isSel   = S.compareSet.has(id);
  const imgSrc  = S.images[id] || f.imagem_url || '';
  const emoji   = getEmoji(nome, cat);
  const kcal    = f.energia_kcal != null ? `<strong>${f.energia_kcal}</strong> kcal` : '';
  const prot    = f.proteina_g != null ? fmtNum(f.proteina_g) : '—';
  const carb    = f.carboidrato_g != null ? fmtNum(f.carboidrato_g) : '—';
  const fat     = f.lipidios_g != null ? fmtNum(f.lipidios_g) : '—';
  const catShort = truncate(cat, 28);

  const imgHTML = imgSrc
    ? `<img src="${imgSrc}" alt="${nome}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
    : '';
  const placeholderStyle = imgSrc ? 'style="display:none"' : '';

  return `
  <div class="food-card${isSel ? ' selected' : ''}" data-id="${id}" onclick="openSidebar('${id}')">
    <div class="card-img-wrap">
      ${imgHTML}
      <div class="card-placeholder" ${placeholderStyle}>${emoji}</div>
    </div>
    <div class="card-body">
      <div class="card-top">
        <div class="card-name">${nome}</div>
        <button class="card-fav${isFav ? ' active' : ''}" data-id="${id}"
          onclick="event.stopPropagation();toggleFav('${id}',this)" title="Favoritar">
          ${isFav ? '★' : '☆'}
        </button>
      </div>
      <div class="card-badge">
        <span class="cat-badge ${cls}">${catShort}</span>
      </div>
      <div class="card-macros">
        <div class="macro-item">
          <span class="macro-val">${prot}</span>
          <span class="macro-lbl">Prot.</span>
        </div>
        <div class="macro-item">
          <span class="macro-val">${carb}</span>
          <span class="macro-lbl">Carb.</span>
        </div>
        <div class="macro-item">
          <span class="macro-val">${fat}</span>
          <span class="macro-lbl">Gord.</span>
        </div>
      </div>
      <div class="card-kcal">${kcal}</div>
    </div>
    <button class="card-compare-btn${isSel ? ' active' : ''}" data-id="${id}"
      onclick="event.stopPropagation();toggleCompare('${id}',this)" title="Comparar">⊕</button>
  </div>`;
}

// ─── SIDEBAR ──────────────────────────────────────────────────
function openSidebar(id) {
  const f = S.all.find(x => String(x.id) === String(id));
  if (!f) return;
  S.currentId = String(id);

  const imgSrc  = S.images[id] || f.imagem_url || '';
  const emoji   = getEmoji(f.nome, f.categoria);
  const cat     = f.categoria || '';
  const cls     = catClass(cat);
  const isFav   = S.favorites.has(String(id));

  // Image
  const img = document.getElementById('sidebarImg');
  const ph  = document.getElementById('sidebarPlaceholder');
  if (imgSrc) {
    img.src = imgSrc; img.style.display = 'block'; ph.style.display = 'none';
  } else {
    img.style.display = 'none'; ph.textContent = emoji; ph.style.display = 'flex';
  }

  document.getElementById('sidebarId').textContent   = `#${id}`;
  document.getElementById('sidebarCat').textContent  = cat;
  document.getElementById('sidebarCat').className    = `cat-badge ${cls}`;
  document.getElementById('sidebarName').textContent = f.nome || 'Sem nome';

  // Fav button
  const favBtn = document.getElementById('sidebarFav');
  favBtn.textContent = isFav ? '★ Favoritado' : '☆ Favoritar';
  favBtn.classList.toggle('active', isFav);

  // Compare button
  const cmpBtn = document.getElementById('sidebarCompare');
  cmpBtn.textContent = S.compareSet.has(String(id)) ? '✓ Na comparação' : '⊕ Comparar';

  // Nutrients
  document.getElementById('sidebarNutrients').innerHTML = buildNutrientHTML(f);

  // Open
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('main').classList.add('sidebar-open');
}

function buildNutrientHTML(f) {
  let html = '';
  for (const [sectionName, cols] of Object.entries(SECTIONS)) {
    const rows = cols.filter(c => f[c] != null);
    if (!rows.length) continue;
    html += `<div class="nutr-section">
      <div class="nutr-section-title">${sectionName}</div>
      <div class="nutr-grid">`;
    for (const col of rows) {
      const [label, unit] = LABELS[col] || [col, ''];
      const val = fmtNum(f[col]);
      html += `<div class="nutr-row">
        <span class="nutr-label">${label}</span>
        <span class="nutr-value">${val}<span class="nutr-unit">${unit}</span></span>
      </div>`;
    }
    html += `</div></div>`;
  }
  // Extra unknown fields
  const known = new Set(Object.values(SECTIONS).flat().concat(['id','nome','categoria','pagina_origem','imagem_url']));
  const extras = Object.keys(f).filter(k => !known.has(k) && f[k] != null && f[k] !== '' && typeof f[k] !== 'object');
  if (extras.length) {
    html += `<div class="nutr-section">
      <div class="nutr-section-title">Outros campos</div>
      <div class="nutr-grid">`;
    for (const k of extras) {
      const label = k.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase());
      html += `<div class="nutr-row">
        <span class="nutr-label">${label}</span>
        <span class="nutr-value">${f[k]}</span>
      </div>`;
    }
    html += `</div></div>`;
  }
  if (!html) html = '<p style="color:var(--text3);font-size:13px;padding:10px 0">Nenhum dado nutricional disponível.</p>';
  return html;
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('main').classList.remove('sidebar-open');
  S.currentId = null;
}

// ─── FAVORITES ────────────────────────────────────────────────
function toggleFav(id, btn) {
  const sid = String(id);
  if (S.favorites.has(sid)) {
    S.favorites.delete(sid);
    if (btn) { btn.textContent = '☆'; btn.classList.remove('active'); }
  } else {
    S.favorites.add(sid);
    if (btn) { btn.textContent = '★'; btn.classList.add('active'); }
  }
  persist();
  // Update sidebar if open
  if (S.currentId === sid) {
    const favBtn = document.getElementById('sidebarFav');
    favBtn.textContent = S.favorites.has(sid) ? '★ Favoritado' : '☆ Favoritar';
    favBtn.classList.toggle('active', S.favorites.has(sid));
  }
}

// ─── COMPARE ──────────────────────────────────────────────────
function toggleCompare(id, btn) {
  const sid = String(id);
  if (S.compareSet.has(sid)) {
    S.compareSet.delete(sid);
    if (btn) btn.classList.remove('active');
  } else {
    if (S.compareSet.size >= 5) { toast('Máximo 5 alimentos'); return; }
    S.compareSet.add(sid);
    if (btn) btn.classList.add('active');
  }
  // Update compare button in topbar
  const cb = document.getElementById('openCompare');
  const sz = S.compareSet.size;
  if (sz > 0) {
    cb.style.display = 'flex';
    document.getElementById('compareCount').textContent = sz;
  } else {
    cb.style.display = 'none';
  }
  // Update card selection
  document.querySelectorAll(`.food-card[data-id="${sid}"]`).forEach(c => c.classList.toggle('selected', S.compareSet.has(sid)));
  // Update sidebar compare btn
  if (S.currentId === sid) {
    const cmpBtn = document.getElementById('sidebarCompare');
    cmpBtn.textContent = S.compareSet.has(sid) ? '✓ Na comparação' : '⊕ Comparar';
  }
}

function openCompareModal() {
  if (S.compareSet.size < 2) { toast('Selecione ao menos 2 alimentos'); return; }
  const foods = [...S.compareSet].map(id => S.all.find(f => String(f.id) === id)).filter(Boolean);

  // Build all nutrient keys present in any food
  const allCols = Object.values(SECTIONS).flat();
  const presentCols = allCols.filter(col => foods.some(f => f[col] != null));

  // For each col find max/min
  const maxMap = {}, minMap = {};
  for (const col of presentCols) {
    const vals = foods.map(f => f[col]).filter(v => typeof v === 'number');
    if (vals.length > 1) { maxMap[col] = Math.max(...vals); minMap[col] = Math.min(...vals); }
  }

  let html = `<table class="compare-table"><thead><tr>
    <th>Campo</th>
    ${foods.map(f => `<th>${truncate(f.nome,22)}<br><span style="color:var(--text3);font-size:10px">${f.categoria||''}</span></th>`).join('')}
  </tr></thead><tbody>`;

  for (const col of presentCols) {
    const [label, unit] = LABELS[col] || [col, ''];
    html += `<tr><td>${label}${unit ? ` <span style="color:var(--text3)">(${unit})</span>` : ''}</td>`;
    for (const f of foods) {
      const v = f[col];
      let cls = '';
      if (typeof v === 'number' && maxMap[col] != null) {
        if (v === maxMap[col]) cls = 'best-val';
        if (v === minMap[col] && v !== maxMap[col]) cls = 'worst-val';
      }
      html += `<td class="${cls}">${v != null ? fmtNum(v) : '—'}</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table>';

  document.getElementById('compareTable').innerHTML = html;
  document.getElementById('compareModal').classList.remove('hidden');
}

// ─── IMAGE MANAGEMENT ─────────────────────────────────────────
let imgModalId = null;
function openImgModal(id) {
  imgModalId = id || S.currentId;
  const f = S.all.find(x => String(x.id) === String(imgModalId));
  document.getElementById('imgModalFoodName').textContent = f ? f.nome : '';
  document.getElementById('imgUrlInput').value = S.images[imgModalId] || '';
  document.getElementById('imgFileInput').value = '';
  const prev = document.getElementById('imgPreview');
  if (S.images[imgModalId]) { prev.src = S.images[imgModalId]; prev.style.display = 'block'; }
  else prev.style.display = 'none';
  document.getElementById('imgModal').classList.remove('hidden');
}

function saveImage() {
  const url = document.getElementById('imgUrlInput').value.trim();
  if (url) {
    S.images[imgModalId] = url;
    persist();
    refreshCard(imgModalId);
    if (S.currentId === String(imgModalId)) openSidebar(imgModalId);
    document.getElementById('imgModal').classList.add('hidden');
  }
}

function refreshCard(id) {
  const card = document.querySelector(`.food-card[data-id="${id}"]`);
  if (!card) return;
  const f = S.all.find(x => String(x.id) === String(id));
  if (!f) return;
  card.outerHTML = cardHTML(f);
}

// ─── EDIT MODAL ───────────────────────────────────────────────
let editModalId = null;
function openEditModal(id) {
  editModalId = id || S.currentId;
  const f = S.all.find(x => String(x.id) === String(editModalId));
  document.getElementById('editName').value = f ? f.nome : '';
  document.getElementById('editCat').value  = f ? f.categoria : '';
  document.getElementById('editModal').classList.remove('hidden');
}

function saveEdit() {
  const f = S.all.find(x => String(x.id) === String(editModalId));
  if (!f) return;
  f.nome      = document.getElementById('editName').value.trim() || f.nome;
  f.categoria = document.getElementById('editCat').value.trim()  || f.categoria;
  S.edits[editModalId] = { nome: f.nome, categoria: f.categoria };
  persist();
  applyFilters();
  if (S.currentId === String(editModalId)) openSidebar(editModalId);
  document.getElementById('editModal').classList.add('hidden');
}

// ─── EXPORT ───────────────────────────────────────────────────
function doExport(type) {
  switch (type) {
    case 'favs_json': {
      const data = S.all.filter(f => S.favorites.has(String(f.id)));
      downloadJSON(data, 'favoritos_taco.json'); break;
    }
    case 'filtered_csv': {
      downloadCSV(S.filtered, 'lista_filtrada_taco.csv'); break;
    }
    case 'snap_json': {
      downloadJSON({ data: S.filtered, total: S.filtered.length, ts: new Date().toISOString() }, 'snapshot_taco.json'); break;
    }
  }
}

function downloadJSON(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  dl(blob, filename);
}

function downloadCSV(rows, filename) {
  if (!rows.length) { toast('Nenhum dado para exportar'); return; }
  const keys = Object.keys(rows[0]).filter(k => typeof rows[0][k] !== 'object');
  const lines = [keys.join(',')];
  for (const r of rows) {
    lines.push(keys.map(k => {
      const v = r[k]; if (v == null) return '';
      const s = String(v); return s.includes(',') ? `"${s}"` : s;
    }).join(','));
  }
  dl(new Blob([lines.join('\n')], { type: 'text/csv' }), filename);
}

function dl(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
  toast(`↓ ${name}`);
}

// ─── RECENT FILES ─────────────────────────────────────────────
function saveRecent(name, count) {
  try {
    let recents = JSON.parse(localStorage.getItem('taco_recents') || '[]');
    recents = recents.filter(r => r.name !== name);
    recents.unshift({ name, count, ts: new Date().toLocaleDateString('pt-BR') });
    recents = recents.slice(0, 5);
    localStorage.setItem('taco_recents', JSON.stringify(recents));
  } catch(e) {}
}

function loadRecents() {
  try {
    const recents = JSON.parse(localStorage.getItem('taco_recents') || '[]');
    const el = document.getElementById('recentFiles');
    const list = document.getElementById('recentList');
    if (!recents.length) return;
    el.style.display = 'block';
    list.innerHTML = recents.map(r => `
      <div class="recent-item">
        <span class="recent-name">${r.name}</span>
        <span class="recent-meta">${r.count} alimentos · ${r.ts}</span>
      </div>`).join('');
  } catch(e) {}
}

// ─── HELPERS ──────────────────────────────────────────────────
function fmtNum(v) {
  if (v == null) return '—';
  if (typeof v === 'number') return v % 1 === 0 ? v : v.toFixed(1);
  return v;
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function showGallery() {
  document.getElementById('dropZone').classList.add('hidden');
  document.getElementById('foodGrid').classList.remove('hidden');
  document.getElementById('toolbar').classList.remove('hidden');
  document.getElementById('statsBar').classList.remove('hidden');
}

function populateCatFilter() {
  const cats = [...new Set(S.all.map(f => f.categoria).filter(Boolean))].sort();
  const sel  = document.getElementById('filterCat');
  sel.innerHTML = '<option value="">Todas categorias</option>' +
    cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function updateKcalRange() {
  const kcals = S.all.map(f => f.energia_kcal).filter(v => v != null);
  if (!kcals.length) return;
  const max = Math.ceil(Math.max(...kcals) / 10) * 10;
  ['kcalMin','kcalMax'].forEach(id => {
    const el = document.getElementById(id);
    el.max = max;
    if (id === 'kcalMax') { el.value = max; document.getElementById('kcalMaxVal').textContent = max + '+'; }
  });
  S.kcalMax = max;
}

// ─── INIT ─────────────────────────────────────────────────────
function init() {
  loadPersist();
  loadRecents();

  // Theme
  document.documentElement.setAttribute('data-theme', S.theme);

  // File input trigger
  const fi = document.getElementById('fileInput');
  ['btnLoad','btnLoadDrop'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => fi.click());
  });
  fi.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('datasetInfo').innerHTML =
        `<span class="ds-tag">${file.name}</span>`;
      loadDataset(ev.target.result, file.name);
    };
    reader.readAsText(file, 'UTF-8');
    fi.value = '';
  });

  // Drag & drop
  const drop = document.getElementById('dropZone');
  document.addEventListener('dragover', e => { e.preventDefault(); drop.querySelector('.drop-inner').classList.add('drag-over'); });
  document.addEventListener('dragleave', e => { if (!e.relatedTarget) drop.querySelector('.drop-inner').classList.remove('drag-over'); });
  document.addEventListener('drop', e => {
    e.preventDefault();
    drop.querySelector('.drop-inner').classList.remove('drag-over');
    const file = e.dataTransfer?.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('datasetInfo').innerHTML = `<span class="ds-tag">${file.name}</span>`;
      loadDataset(ev.target.result, file.name);
    };
    reader.readAsText(file, 'UTF-8');
  });

  // Search
  const si = document.getElementById('searchInput');
  si.addEventListener('input', () => {
    S.search = si.value;
    document.getElementById('clearSearch').style.display = S.search ? 'block' : 'none';
    S.page = 1;
    applyFilters();
  });
  document.getElementById('clearSearch').addEventListener('click', () => {
    si.value = ''; S.search = '';
    document.getElementById('clearSearch').style.display = 'none';
    applyFilters();
  });

  // Filters
  document.getElementById('filterCat').addEventListener('change', e => { S.filterCat = e.target.value; applyFilters(); });
  document.getElementById('filterNutr').addEventListener('change', e => { S.filterNutr = e.target.value; applyFilters(); });
  document.getElementById('sortBy').addEventListener('change', e => { S.sortBy = e.target.value; applyFilters(); });

  // Kcal range
  document.getElementById('kcalMin').addEventListener('input', e => {
    S.kcalMin = Number(e.target.value);
    document.getElementById('kcalMinVal').textContent = S.kcalMin;
    applyFilters();
  });
  document.getElementById('kcalMax').addEventListener('input', e => {
    const max = Number(e.target.value);
    S.kcalMax = max >= 990 ? 99999 : max;
    document.getElementById('kcalMaxVal').textContent = max >= 990 ? '∞' : max + '+';
    applyFilters();
  });

  // View toggle
  document.querySelectorAll('.vbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.view = btn.dataset.view;
      const grid = document.getElementById('foodGrid');
      grid.classList.toggle('view-list', S.view === 'list');
    });
  });

  // Clear filters
  document.getElementById('clearFilters').addEventListener('click', () => {
    S.search = ''; S.filterCat = ''; S.filterNutr = '';
    S.kcalMin = 0; S.kcalMax = 99999;
    document.getElementById('searchInput').value = '';
    document.getElementById('filterCat').value = '';
    document.getElementById('filterNutr').value = '';
    document.getElementById('kcalMin').value = 0;
    document.getElementById('kcalMax').value = document.getElementById('kcalMax').max;
    document.getElementById('kcalMinVal').textContent = '0';
    document.getElementById('kcalMaxVal').textContent = '∞';
    document.getElementById('clearSearch').style.display = 'none';
    applyFilters();
  });

  // Pagination
  document.getElementById('prevPage').addEventListener('click', () => { S.page--; renderGrid(); scrollToTop(); });
  document.getElementById('nextPage').addEventListener('click', () => { S.page++; renderGrid(); scrollToTop(); });

  // Sidebar close
  document.getElementById('sidebarClose').addEventListener('click', closeSidebar);
  document.getElementById('sidebarOverlay').addEventListener('click', closeSidebar);

  // Sidebar buttons
  document.getElementById('sidebarFav').addEventListener('click', () => {
    if (S.currentId) {
      const btn = document.querySelector(`.card-fav[data-id="${S.currentId}"]`);
      toggleFav(S.currentId, btn);
      const favBtn = document.getElementById('sidebarFav');
      favBtn.textContent = S.favorites.has(S.currentId) ? '★ Favoritado' : '☆ Favoritar';
      favBtn.classList.toggle('active', S.favorites.has(S.currentId));
    }
  });
  document.getElementById('sidebarCompare').addEventListener('click', () => {
    if (S.currentId) {
      const btn = document.querySelector(`.card-compare-btn[data-id="${S.currentId}"]`);
      toggleCompare(S.currentId, btn);
    }
  });
  document.getElementById('sidebarEdit').addEventListener('click', () => openEditModal(S.currentId));
  document.getElementById('btnChangeImg').addEventListener('click', () => openImgModal(S.currentId));

  // Compare
  document.getElementById('openCompare').addEventListener('click', openCompareModal);
  document.getElementById('compareModalClose').addEventListener('click', () => {
    document.getElementById('compareModal').classList.add('hidden');
  });

  // Export
  const expBtn = document.getElementById('exportBtn');
  const expDrop = document.getElementById('exportDropdown');
  expBtn.addEventListener('click', e => { e.stopPropagation(); expDrop.classList.toggle('open'); });
  document.addEventListener('click', () => expDrop.classList.remove('open'));
  document.querySelectorAll('[data-exp]').forEach(btn => {
    btn.addEventListener('click', () => { doExport(btn.dataset.exp); expDrop.classList.remove('open'); });
  });

  // Image modal
  document.getElementById('imgUrlInput').addEventListener('input', e => {
    const prev = document.getElementById('imgPreview');
    prev.src = e.target.value; prev.style.display = e.target.value ? 'block' : 'none';
  });
  document.getElementById('imgFileInput').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const prev = document.getElementById('imgPreview');
      prev.src = ev.target.result; prev.style.display = 'block';
      document.getElementById('imgUrlInput').value = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  document.getElementById('imgModalSave').addEventListener('click', saveImage);
  document.getElementById('imgModalCancel').addEventListener('click', () => document.getElementById('imgModal').classList.add('hidden'));

  // Edit modal
  document.getElementById('editModalSave').addEventListener('click', saveEdit);
  document.getElementById('editModalCancel').addEventListener('click', () => document.getElementById('editModal').classList.add('hidden'));

  // Theme toggle
  document.getElementById('toggleTheme').addEventListener('click', () => {
    S.theme = S.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', S.theme);
    document.getElementById('toggleTheme').textContent = S.theme === 'dark' ? '☀' : '☾';
    persist();
  });
  document.getElementById('toggleTheme').textContent = S.theme === 'dark' ? '☀' : '☾';

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeSidebar();
      document.getElementById('compareModal').classList.add('hidden');
      document.getElementById('imgModal').classList.add('hidden');
      document.getElementById('editModal').classList.add('hidden');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      document.getElementById('searchInput').focus();
    }
  });
}

function scrollToTop() {
  window.scrollTo({ top: 172, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', init);
