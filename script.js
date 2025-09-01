// Toggle móvil
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open');
  });
}

// Año en footer
document.querySelectorAll('#y').forEach(el => el.textContent = new Date().getFullYear());

// KPI counters
document.querySelectorAll('.kpi__num').forEach(el => {
  const target = Number(el.dataset.count || 100);
  let val = 0;
  const step = () => {
    val += Math.ceil((target - val) / 10);
    el.textContent = val + '%';
    if (val < target) requestAnimationFrame(step);
  };
  step();
});

// Catálogo base (AYB en mayúsculas donde corresponde)
const PRODUCTS = [
  { id:1, name:'Aceite de Soya 1L', brand:'AYB', cat:'aceites', price:9.90, unit:'/botella', sku:'AYB-ACE-1L' },
  { id:2, name:'Caballa en aceite 170g', brand:'AYB', cat:'conservas', price:6.50, unit:'/lata', sku:'AYB-CON-170' },
  { id:3, name:'Spaguetti 500g', brand:'AYB', cat:'pastas', price:3.60, unit:'/bolsa', sku:'AYB-PAS-500' },
  { id:4, name:'Jabón en barra 175g', brand:'Estelar', cat:'limpieza', price:1.20, unit:'/unidad', sku:'EST-LIM-175' }
];

// Render de tarjetas
function renderProducts(list) {
  const grid = document.getElementById('grid');
  if (!grid) return;
  if (!list.length) {
    grid.innerHTML = `<div class="card">No encontramos productos con los filtros seleccionados.</div>`;
    return;
  }
  grid.innerHTML = list.map(p => `
    <article class="card">
      <div class="product__media" aria-hidden="true">${p.cat.toUpperCase()}</div>
      <div class="product__brand">${p.brand} · <small>${p.sku}</small></div>
      <h3>${p.name}</h3>
      <div class="price">S/ ${p.price.toFixed(2)} <small>${p.unit}</small></div>
      <button class="btn" type="button" aria-label="Agregar ${p.name}">Añadir</button>
    </article>
  `).join('');
}

// Filtros en products.html
function initFilters() {
  const selCat = document.getElementById('filter-category');
  const selBrand = document.getElementById('filter-brand');
  const inputSearch = document.getElementById('filter-search');
  if (!(selCat && selBrand && inputSearch)) return;

  const url = new URL(window.location.href);
  const qCat = url.searchParams.get('cat') || '';
  const qBrand = url.searchParams.get('marca') || '';
  selCat.value = qCat;
  selBrand.value = qBrand;

  const run = () => {
    const cat = selCat.value.trim().toLowerCase();
    const brand = selBrand.value.trim();
    const q = (inputSearch.value || '').trim().toLowerCase();
    const list = PRODUCTS.filter(p =>
      (!cat || p.cat === cat) &&
      (!brand || p.brand === brand) &&
      (!q || (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)))
    );
    renderProducts(list);
  };

  selCat.addEventListener('change', run);
  selBrand.addEventListener('change', run);
  inputSearch.addEventListener('input', run);
  run(); // primera carga
}

// Auto-inicializa si existe #grid
if (document.getElementById('grid')) {
  initFilters();
}
