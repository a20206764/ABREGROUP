// util
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

document.querySelectorAll('#y').forEach(el => el.textContent = new Date().getFullYear());

// nav móvil
const navToggle = $('.nav-toggle'), nav = $('#nav');
if (navToggle && nav) navToggle.onclick = () => { 
  const exp = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!exp));
  nav.classList.toggle('open');
};

// KPIs animados
$$('.kpi__num').forEach(el=>{
  const t = Number(el.dataset.count||100); let v=0;
  const step=()=>{ v += Math.ceil((t-v)/10); el.textContent = v+'%'; if(v<t) requestAnimationFrame(step) };
  step();
});

// Decide qué pantalla estamos:
const onBrands = location.pathname.endsWith('marcas.html');
const onProducts = location.pathname.endsWith('products.html');
const onProduct = location.pathname.endsWith('product.html');

// ======= MARCAS =======
async function renderBrandsPage(){
  const root = $('#brands-root');
  if (!root) return;
  const res = await fetch('brands.json'); const brands = await res.json();

  const url = new URL(location.href);
  const key = url.searchParams.get('brand');

  if (!key) {
    // listado tipo "Nuestras marcas"
    root.innerHTML = `
      <h1>Nuestras marcas</h1>
      <div class="grid brand-cards">
        ${brands.map(b=>`
          <article class="card brand-card">
            <img class="brand-card__logo" src="${b.logo}" alt="${b.name}">
            <p class="brand-card__summary">${b.summary}</p>
            <a class="btn" href="marcas.html?brand=${encodeURIComponent(b.key)}">Ver marca</a>
          </article>
        `).join('')}
      </div>`;
  } else {
    // vista interna de marca (hero + familias)
    const b = brands.find(x=>x.key===key) || brands[0];
    root.innerHTML = `
      <section class="hero" style="min-height:260px">
        <img class="hero__img" src="${b.hero}" alt="">
        <div class="container hero__content">
          <img src="${b.logo}" alt="${b.name}" style="width:120px;margin:0 auto 8px;border-radius:14px">
          <h1>${b.name}</h1>
          <p>${b.summary}</p>
          <div class="hero__ctas">
            <a class="btn" href="products.html?marca=${encodeURIComponent(b.key)}">Ver productos</a>
            <a class="btn btn--ghost" href="marcas.html">Todas las marcas</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <h2>Familias de ${b.name}</h2>
          <div class="grid grid-3">
            ${b.families.map(f=>`
              <a class="card" href="${f.href}">
                <img src="${f.image}" alt="${f.name}" style="border-radius:12px">
                <h3>${f.name}</h3>
              </a>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }
}

// ======= PRODUCTOS (listado) =======
async function renderProducts(){
  const grid = $('#grid'); if(!grid) return;
  const res = await fetch('products.json'); const products = await res.json();

  // prellenar filtros por query
  const url = new URL(location.href);
  const qCat = url.searchParams.get('cat') || '';
  const qBrand = url.searchParams.get('marca') || '';
  $('#filter-category').value = qCat;
  $('#filter-brand').value = qBrand;

  const run = ()=>{
    const cat = $('#filter-category').value;
    const brand = $('#filter-brand').value;
    const q = ($('#filter-search').value||'').toLowerCase();
    const list = products.filter(p =>
      (!cat || p.cat===cat) &&
      (!brand || p.brand===brand) &&
      (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
    grid.innerHTML = list.length ? list.map(p=>`
      <article class="card">
        <div class="product__media"><img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px"></div>
        <div class="product__brand">${p.brand} · <small>${p.sku}</small></div>
        <h3>${p.name}</h3>
        <div class="price">S/ ${p.price.toFixed(2)} <small>${p.unit}</small></div>
        <a class="btn" href="product.html?id=${p.id}">Ver detalle</a>
      </article>
    `).join('') : `<div class="card">No encontramos productos con los filtros seleccionados.</div>`;
  };

  $('#filter-category').onchange = run;
  $('#filter-brand').onchange = run;
  $('#filter-search').oninput = run;
  run();
}

// ======= PRODUCTO (detalle) =======
async function renderProductDetail(){
  const root = $('#pd-root'); if(!root) return;
  const res = await fetch('products.json'); const products = await res.json();
  const id = Number(new URL(location.href).searchParams.get('id') || 0);
  const p = products.find(x=>x.id===id) || products[0];

  root.innerHTML = `
    <div class="card">
      <img src="${p.img}" alt="${p.name}" style="border-radius:12px">
    </div>
    <div class="card">
      <h1>${p.name}</h1>
      <p class="product__brand">${p.brand} · ${p.sku}</p>
      <p>${p.desc}</p>
      <div class="price" style="font-size:1.4rem">S/ ${p.price.toFixed(2)} <small>${p.unit}</small></div>
      <div style="display:flex;gap:.6rem;margin-top:1rem">
        <a class="btn" href="https://wa.me/51976633755?text=Quiero%20${encodeURIComponent(p.name)}">Cotizar por WhatsApp</a>
        <a class="btn btn--ghost" href="products.html?cat=${p.cat}&marca=${p.brand}">Volver al listado</a>
      </div>
    </div>
  `;

  $('#pd-specs').innerHTML = `
    <h3>Especificaciones</h3>
    <ul class="bullets">
      <li>Categoría: ${p.cat}</li>
      <li>Marca: ${p.brand}</li>
      <li>Código/SKU: ${p.sku}</li>
      <li>Presentación: ${p.unit.replace('/','')}</li>
    </ul>
  `;
}

// init por página
if (onBrands) renderBrandsPage();
if (onProducts) renderProducts();
if (onProduct) renderProductDetail();

