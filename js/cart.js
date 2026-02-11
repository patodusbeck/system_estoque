/**
 * Shopping Cart Manager
 * Manages cart state using localStorage
 */

class ShoppingCart {
  constructor() {
    this.storageKey = 'gaak_cart';
    this.items = this.loadFromStorage();
    this.updateUI();
  }

  /**
   * Add item to cart or increment quantity
   */
  addItem(product, quantity = 1) {
    const existingItem = this.items.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: quantity
      });
    }

    this.saveToStorage();
    this.updateUI();
    this.showNotification(`${product.name} adicionado ao carrinho!`);
  }

  /**
   * Remove item from cart
   */
  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveToStorage();
    this.updateUI();
  }

  /**
   * Update item quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveToStorage();
      this.updateUI();
    }
  }

  /**
   * Clear entire cart
   */
  clear() {
    this.items = [];
    this.saveToStorage();
    this.updateUI();
  }

  /**
   * Get cart items
   */
  getItems() {
    return this.items;
  }

  /**
   * Get total items count
   */
  getItemCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Get total price
   */
  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Load cart from localStorage
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  /**
   * Update UI elements (cart badge, etc)
   */
  updateUI() {
    const badge = document.querySelector('.cart-count');
    if (badge) {
      const count = this.getItemCount();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }

    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: {
        items: this.items,
        count: this.getItemCount(),
        total: this.getTotal()
      }
    }));
  }

  /**
   * Show notification
   */
  showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <ion-icon name="checkmark-circle"></ion-icon>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// Initialize global cart instance
window.cart = new ShoppingCart();

/**
 * Open cart modal
 */
function openCart() {
  const items = window.cart.getItems();
  
  if (items.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  // Create cart modal
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'cart-modal';
  
  const itemsHTML = items.map(item => `
    <div class="cart-item" data-product-id="${item.id}">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p class="cart-item-price">R$ ${item.price.toFixed(2)}</p>
      </div>
      <div class="cart-item-quantity">
        <button onclick="window.cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
        <span>${item.quantity}</span>
        <button onclick="window.cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
      </div>
      <button class="cart-item-remove" onclick="window.cart.removeItem('${item.id}')">
        <ion-icon name="trash-outline"></ion-icon>
      </button>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="modal-content cart-modal-content">
      <div class="modal-header">
        <h2><ion-icon name="cart-outline"></ion-icon> Meu Carrinho</h2>
        <button class="modal-close" onclick="closeModal('cart-modal')">
          <ion-icon name="close"></ion-icon>
        </button>
      </div>
      <div class="modal-body">
        <div class="cart-items">
          ${itemsHTML}
        </div>
        <div class="cart-summary">
          <div class="cart-total">
            <span>Total:</span>
            <span class="cart-total-value">R$ ${window.cart.getTotal().toFixed(2)}</span>
          </div>
          <button class="btn-checkout" onclick="openPaymentModal()">
            FINALIZAR COMPRA
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * Close modal
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
}

// Listen for cart updates to refresh modal if open
window.addEventListener('cartUpdated', () => {
  const cartModal = document.getElementById('cart-modal');
  if (cartModal) {
    closeModal('cart-modal');
    openCart();
  }
});
