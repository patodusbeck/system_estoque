/**
 * Products page renderer
 * Loads products from API and renders dynamic cards in produtos.html
 */

async function loadProductsGrid() {
  const grid = document.getElementById('todos-produtos');
  if (!grid) return;

  try {
    const response = await fetch('/api/products', { cache: 'no-store' });
    if (!response.ok) return;
    const products = await response.json();
    if (!Array.isArray(products) || products.length === 0) return;

    const cardsHtml = products
      .filter((product) => product.ativo !== false)
      .map(renderProductCard)
      .join('');

    if (cardsHtml.trim()) {
      grid.innerHTML = cardsHtml;
    }
  } catch (error) {
    console.warn('Could not render products grid from API:', error);
  }
}

function renderProductCard(product) {
  const id = escapeHtml(product._id || '');
  const nome = escapeHtml(product.nome || 'Produto');
  const image = 'images/gaaklogo.png';
  const estoque = Number(product.estoque || 0);
  const inStock = product.inStock ?? estoque > 0;
  const preco = Number(product.preco || 0);
  const benefits = Array.isArray(product.benefits) && product.benefits.length
    ? product.benefits.slice(0, 3)
    : ['Produto original', 'Qualidade garantida', 'Entrega rapida'];

  return `
    <section class="price-card" data-product-id="${id}">
      <h1 class="card-title-price">
        <img src="${image}" alt="${nome}" class="title-image">
      </h1>
      <h2 class="card-subtitle-price">
        <span class="periodo">${nome}</span>
      </h2>
      <ul class="card-benefits">
        ${benefits
          .map(
            (benefit) =>
              `<li><ion-icon name="checkmark-circle"></ion-icon> ${escapeHtml(benefit)}</li>`
          )
          .join('')}
      </ul>
      <p class="price-text">PRECO:</p>
      <p class="new-price">R$${formatPrice(preco)}</p>
      <button class="buy-button" onclick="openProductModal('${id}')" ${
        !inStock ? 'disabled' : ''
      }>
        ${inStock ? 'VER DETALHES' : 'INDISPONIVEL'}
      </button>
    </section>
  `;
}

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

loadProductsGrid();
