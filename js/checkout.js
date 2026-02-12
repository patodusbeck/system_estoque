/**
 * Checkout Flow Manager
 * Handles payment selection and customer information collection
 */

let selectedPaymentMethod = null;
let appliedCoupon = null;

function getCheckoutSummary() {
  const subtotal = Number(window.cart.getTotal().toFixed(2));
  const discountAmount = appliedCoupon
    ? Number(((subtotal * Number(appliedCoupon.discountPercent || 0)) / 100).toFixed(2))
    : 0;
  const total = Number(Math.max(subtotal - discountAmount, 0).toFixed(2));

  return {
    subtotal,
    discountAmount,
    total,
    couponCode: appliedCoupon?.code || ''
  };
}

function updateCheckoutSummaryUI() {
  const summary = getCheckoutSummary();
  const subtotalEl = document.querySelector('.checkout-subtotal');
  const discountEl = document.querySelector('.checkout-discount');
  const totalEl = document.querySelector('.checkout-total');
  const couponStatusEl = document.getElementById('coupon-status');
  const couponHiddenEl = document.getElementById('checkout-coupon-code');

  if (subtotalEl) subtotalEl.textContent = `R$ ${summary.subtotal.toFixed(2)}`;
  if (discountEl) discountEl.textContent = `R$ ${summary.discountAmount.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `R$ ${summary.total.toFixed(2)}`;
  if (couponHiddenEl) couponHiddenEl.value = summary.couponCode;

  if (couponStatusEl) {
    couponStatusEl.textContent = summary.couponCode
      ? `Cupom aplicado: ${summary.couponCode} (-${Number(appliedCoupon.discountPercent || 0)}%)`
      : 'Nenhum cupom aplicado';
    couponStatusEl.classList.toggle('active', Boolean(summary.couponCode));
  }
}

/**
 * Open payment method selection modal
 */
function openPaymentModal() {
  closeModal('cart-modal');

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'payment-modal';

  modal.innerHTML = `
    <div class="modal-content payment-modal-content">
      <div class="modal-header">
        <h2><ion-icon name="card-outline"></ion-icon> Forma de Pagamento</h2>
        <button class="modal-close" onclick="closeModal('payment-modal'); openCart();">
          <ion-icon name="close"></ion-icon>
        </button>
      </div>
      <div class="modal-body">
        <p class="payment-instruction">Selecione como deseja pagar:</p>
        <div class="payment-options">
          <button class="payment-option" onclick="selectPayment('PIX')">
            <ion-icon name="qr-code-outline"></ion-icon>
            <span>PIX</span>
            <small>Pagamento instantâneo</small>
          </button>
          <button class="payment-option" onclick="selectPayment('Cartão')">
            <ion-icon name="card-outline"></ion-icon>
            <span>Cartão</span>
            <small>Crédito ou Débito</small>
          </button>
          <button class="payment-option" onclick="selectPayment('Dinheiro')">
            <ion-icon name="cash-outline"></ion-icon>
            <span>Dinheiro</span>
            <small>Pagamento em espécie</small>
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * Select payment method and proceed to checkout
 */
function selectPayment(method) {
  selectedPaymentMethod = method;
  closeModal('payment-modal');
  openCheckoutModal();
}

/**
 * Open checkout form modal
 */
function openCheckoutModal() {
  appliedCoupon = null;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'checkout-modal';

  const summary = getCheckoutSummary();

  modal.innerHTML = `
    <div class="modal-content checkout-modal-content">
      <div class="modal-header">
        <h2><ion-icon name="clipboard-outline"></ion-icon> Finalizar Pedido</h2>
        <button class="modal-close" onclick="closeModal('checkout-modal'); openPaymentModal();">
          <ion-icon name="close"></ion-icon>
        </button>
      </div>
      <div class="modal-body">
        <div class="checkout-summary">
          <p><strong>Forma de pagamento:</strong> ${selectedPaymentMethod}</p>
          <p><strong>Subtotal:</strong> <span class="checkout-subtotal">R$ ${summary.subtotal.toFixed(2)}</span></p>
          <p><strong>Desconto (cupom):</strong> <span class="checkout-discount">R$ ${summary.discountAmount.toFixed(2)}</span></p>
          <p><strong>Total:</strong> <span class="checkout-total">R$ ${summary.total.toFixed(2)}</span></p>
        </div>

        <form id="checkout-form" onsubmit="submitOrder(event)">
          <div class="form-section">
            <h3>Cupom (opcional)</h3>
            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label for="coupon-code">Código do cupom</label>
                <input type="text" id="coupon-code" name="couponCodeInput" placeholder="Ex: GAAK25" autocomplete="off" style="text-transform: uppercase;">
              </div>
              <div class="form-group" style="flex: 1; align-self: end;">
                <button type="button" class="btn-apply-coupon" onclick="applyCouponFromCheckout()">Aplicar cupom</button>
              </div>
            </div>
            <p id="coupon-status">Nenhum cupom aplicado</p>
            <input type="hidden" id="checkout-coupon-code" name="couponCode">
          </div>

          <div class="form-section">
            <h3>Dados Pessoais</h3>
            <div class="form-group">
              <label for="customer-name">Nome Completo *</label>
              <input type="text" id="customer-name" name="name" required minlength="3" placeholder="João Silva">
            </div>
            <div class="form-group">
              <label for="customer-phone">Telefone (opcional)</label>
              <input type="tel" id="customer-phone" name="phone" placeholder="(99) 98765-4321">
            </div>
          </div>

          <div class="form-section">
            <h3>Endereço de Entrega</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="address-zipcode">CEP *</label>
                <input type="text" id="address-zipcode" name="zipCode" required pattern="\\d{5}-?\\d{3}" placeholder="65000-000" maxlength="9">
              </div>
              <div class="form-group">
                <label for="address-state">Estado *</label>
                <input type="text" id="address-state" name="state" required maxlength="2" placeholder="MA" style="text-transform: uppercase;">
              </div>
            </div>

            <div class="form-group">
              <label for="address-city">Cidade *</label>
              <input type="text" id="address-city" name="city" required minlength="2" placeholder="São Luís">
            </div>

            <div class="form-group">
              <label for="address-neighborhood">Bairro *</label>
              <input type="text" id="address-neighborhood" name="neighborhood" required minlength="2" placeholder="Centro">
            </div>

            <div class="form-row">
              <div class="form-group" style="flex: 2;">
                <label for="address-street">Rua *</label>
                <input type="text" id="address-street" name="street" required minlength="3" placeholder="Rua das Flores">
              </div>
              <div class="form-group" style="flex: 1;">
                <label for="address-number">Número *</label>
                <input type="text" id="address-number" name="number" required placeholder="123">
              </div>
            </div>

            <div class="form-group">
              <label for="address-complement">Complemento (opcional)</label>
              <input type="text" id="address-complement" name="complement" placeholder="Apto 101, Bloco B">
            </div>
          </div>

          <button type="submit" class="btn-submit-order">
            <ion-icon name="checkmark-circle"></ion-icon>
            CONFIRMAR PEDIDO
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('active'), 10);

  // Auto-format CEP
  const zipInput = document.getElementById('address-zipcode');
  zipInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5, 8);
    }
    e.target.value = value;
  });

  // Auto-format phone
  const phoneInput = document.getElementById('customer-phone');
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      value = '(' + value;
    }
    if (value.length > 3) {
      value = value.slice(0, 3) + ') ' + value.slice(3);
    }
    if (value.length > 10) {
      value = value.slice(0, 10) + '-' + value.slice(10, 14);
    }
    e.target.value = value;
  });

  const couponInput = document.getElementById('coupon-code');
  if (couponInput) {
    couponInput.addEventListener('input', (e) => {
      e.target.value = String(e.target.value || '').toUpperCase().replace(/\s+/g, '');
    });
  }

  updateCheckoutSummaryUI();
}

/**
 * Submit order
 */
async function submitOrder(event) {
  event.preventDefault();

  const form = event.target;
  const submitBtn = form.querySelector('.btn-submit-order');
  
  // Disable button and show loading
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon> PROCESSANDO...';

  // Collect form data
  const formData = new FormData(form);
  const customer = {
    name: formData.get('name'),
    phone: formData.get('phone'),
    address: {
      street: formData.get('street'),
      number: formData.get('number'),
      neighborhood: formData.get('neighborhood'),
      city: formData.get('city'),
      state: formData.get('state').toUpperCase(),
      zipCode: formData.get('zipCode'),
      complement: formData.get('complement')
    }
  };

  const summary = getCheckoutSummary();
  const orderData = {
    customer,
    products: window.cart.getItems(),
    paymentMethod: selectedPaymentMethod,
    subtotal: summary.subtotal,
    discountAmount: summary.discountAmount,
    total: summary.total,
    couponCode: summary.couponCode
  };

  try {
    // Sync everything before redirecting:
    // client registration, stock update and sale creation.
    await processOrderSync(orderData);

    // Keep legacy order save in background for compatibility/history.
    saveOrderBestEffort(orderData);

    submitBtn.innerHTML = '<ion-icon name="logo-whatsapp"></ion-icon> ABRINDO WHATSAPP...';
    window.cart.clear();
    closeModal('checkout-modal');
    redirectToWhatsApp(orderData);
  } catch (error) {
    console.error('Error syncing order:', error);
    alert(`Não foi possível sincronizar o pedido: ${error.message}\n\nTente novamente.`);
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<ion-icon name="checkmark-circle"></ion-icon> CONFIRMAR PEDIDO';
  }
}

/**
 * Generate WhatsApp message
 */
function generateWhatsAppMessage(order) {
  const productsText = order.products
    .map(p => `- ${p.name} (${p.quantity}x) - R$${(p.price * p.quantity).toFixed(2)}`)
    .join('\n');

  const message = `
*PEDIDO GAAK SUPLEMENTOS*

*Cliente:* ${order.customer.name}


*Produtos:*
${productsText}

*Valor Total:* R$${order.total.toFixed(2)}
*CUPOM:* ${order.couponCode ? order.couponCode : 'Não'}
*Forma de Pagamento:* ${order.paymentMethod}

*Endereço de Entrega:*
${order.customer.address.street}, nº ${order.customer.address.number}
${order.customer.address.complement ? order.customer.address.complement + '\n' : ''}${order.customer.address.neighborhood}
${order.customer.address.city} - ${order.customer.address.state}
  `.trim();

  return encodeURIComponent(message);
}

/**
 * Redirect to WhatsApp
 */
function redirectToWhatsApp(order) {
  const phone = '5599984065730';
  const message = generateWhatsAppMessage(order);
  const nativeUrl = `whatsapp://send?phone=${phone}&text=${message}`;
  const webUrl = `https://wa.me/${phone}?text=${message}`;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    window.location.href = nativeUrl;
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.location.href = webUrl;
      }
    }, 1200);
    return;
  }

  window.location.href = webUrl;
}

/**
 * Show success message
 */
function showSuccessMessage() {
  const message = document.createElement('div');
  message.className = 'success-message';
  message.innerHTML = `
    <div class="success-content">
      <ion-icon name="checkmark-circle"></ion-icon>
      <h3>Pedido Enviado!</h3>
      <p>Você será redirecionado para o WhatsApp para finalizar o atendimento.</p>
    </div>
  `;
  document.body.appendChild(message);

  setTimeout(() => {
    message.classList.add('fade-out');
    setTimeout(() => message.remove(), 500);
  }, 3000);
}

/**
 * Save order in API as background best-effort action
 */
function saveOrderBestEffort(orderData) {
  fetch('/api/save-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData),
    keepalive: true
  }).catch((error) => {
    console.error('Error saving order in background:', error);
  });
}

/**
 * Sync order data with dashboard collections:
 * clients + stock + sales
 */
async function processOrderSync(orderData) {
  const response = await fetch('/api/process-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.error || result.message || 'Falha na sincronizacao');
  }

  return result;
}

async function applyCouponFromCheckout() {
  const couponInput = document.getElementById('coupon-code');
  const code = String(couponInput?.value || '').trim().toUpperCase();

  if (!code) {
    appliedCoupon = null;
    updateCheckoutSummaryUI();
    alert('Cupom removido.');
    return;
  }

  try {
    const response = await fetch(`/api/coupons?validate=true&code=${encodeURIComponent(code)}`);
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.valid) {
      throw new Error(result.error || 'Cupom inválido');
    }

    appliedCoupon = {
      code: result.coupon.code,
      discountPercent: Number(result.coupon.discountPercent || 0)
    };
    updateCheckoutSummaryUI();
    alert(`Cupom ${appliedCoupon.code} aplicado com ${appliedCoupon.discountPercent}% de desconto.`);
  } catch (error) {
    appliedCoupon = null;
    updateCheckoutSummaryUI();
    alert(`Não foi possível aplicar o cupom: ${error.message}`);
  }
}

window.applyCouponFromCheckout = applyCouponFromCheckout;
