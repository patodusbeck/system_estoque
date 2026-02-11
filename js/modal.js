/**
 * Product Modal Manager
 * Handles product details modal with image carousel
 */

let productsData = [];

// Load products data
async function loadProducts() {
  try {
    const response = await fetch('/data/products.json');
    productsData = await response.json();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Initialize on page load
loadProducts();

/**
 * Open product details modal
 */
function openProductModal(productId) {
  const product = productsData.find(p => p.id === productId);
  
  if (!product) {
    console.error('Product not found:', productId);
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'product-modal';

  const benefitsHTML = product.benefits.map(benefit => `
    <li>
      <ion-icon name="checkmark-circle"></ion-icon>
      ${benefit}
    </li>
  `).join('');

  const imagesHTML = product.images.map((img, index) => `
    <div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
      <img src="${img}" alt="${product.name}">
    </div>
  `).join('');

  const dotsHTML = product.images.map((_, index) => `
    <span class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></span>
  `).join('');

  modal.innerHTML = `
    <div class="modal-content product-modal-content">
      <button class="modal-close" onclick="closeModal('product-modal')">
        <ion-icon name="close"></ion-icon>
      </button>
      
      <div class="product-modal-grid">
        <!-- Image Carousel -->
        <div class="product-carousel">
          <div class="carousel-container">
            ${imagesHTML}
          </div>
          ${product.images.length > 1 ? `
            <button class="carousel-btn carousel-prev" onclick="prevSlide()">
              <ion-icon name="chevron-back"></ion-icon>
            </button>
            <button class="carousel-btn carousel-next" onclick="nextSlide()">
              <ion-icon name="chevron-forward"></ion-icon>
            </button>
            <div class="carousel-dots">
              ${dotsHTML}
            </div>
          ` : ''}
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h2 class="product-modal-title">${product.name}</h2>
          
          <div class="product-meta">
            <span class="product-weight">
              <ion-icon name="cube-outline"></ion-icon>
              ${product.weight}
            </span>
            ${product.inStock ? 
              '<span class="product-stock in-stock"><ion-icon name="checkmark-circle"></ion-icon> Em estoque</span>' :
              '<span class="product-stock out-of-stock"><ion-icon name="close-circle"></ion-icon> Indisponível</span>'
            }
          </div>

          <p class="product-description">${product.description}</p>

          <div class="product-benefits">
            <h3>Benefícios:</h3>
            <ul>${benefitsHTML}</ul>
          </div>

          <div class="product-pricing">
            <div class="price-row">
              <span class="old-price-modal">De R$ ${product.oldPrice.toFixed(2)}</span>
              <span class="discount-badge">${product.discount} OFF</span>
            </div>
            <div class="new-price-modal">R$ ${product.price.toFixed(2)}</div>
          </div>

          <button class="btn-add-to-cart" onclick="addToCartFromModal('${product.id}')" ${!product.inStock ? 'disabled' : ''}>
            <ion-icon name="cart"></ion-icon>
            ADICIONAR AO CARRINHO
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * Add product to cart from modal
 */
function addToCartFromModal(productId) {
  const product = productsData.find(p => p.id === productId);
  if (product) {
    window.cart.addItem(product, 1);
    closeModal('product-modal');
  }
}

/**
 * Carousel navigation
 */
let currentSlide = 0;

function goToSlide(index) {
  const slides = document.querySelectorAll('.carousel-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  slides[index].classList.add('active');
  dots[index].classList.add('active');
  currentSlide = index;
}

function nextSlide() {
  const slides = document.querySelectorAll('.carousel-slide');
  const nextIndex = (currentSlide + 1) % slides.length;
  goToSlide(nextIndex);
}

function prevSlide() {
  const slides = document.querySelectorAll('.carousel-slide');
  const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
  goToSlide(prevIndex);
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('product-modal');
  if (!modal) return;

  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
  if (e.key === 'Escape') closeModal('product-modal');
});
