/**
 * Checkout Flow Manager
 * Handles payment selection and customer information collection
 */

let selectedPaymentMethod = null;

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
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'checkout-modal';

  const total = window.cart.getTotal();

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
          <p><strong>Total:</strong> <span class="checkout-total">R$ ${total.toFixed(2)}</span></p>
        </div>

        <form id="checkout-form" onsubmit="submitOrder(event)">
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

  const orderData = {
    customer,
    products: window.cart.getItems(),
    paymentMethod: selectedPaymentMethod,
    total: window.cart.getTotal()
  };

  // Save order in background without blocking WhatsApp opening
  saveOrderBestEffort(orderData);
  registerClientBestEffort(customer);

  // Update button and continue immediately to WhatsApp
  submitBtn.innerHTML = '<ion-icon name="logo-whatsapp"></ion-icon> ABRINDO WHATSAPP...';

  // Clear cart and close modal before leaving page
  window.cart.clear();
  closeModal('checkout-modal');

  // Native WhatsApp open (fallback to web)
  redirectToWhatsApp(orderData);
}

/**
 * Generate WhatsApp message
 */
function generateWhatsAppMessage(order) {
  const productsText = order.products
    .map(p => `- ${p.name} (${p.quantity}x) - R$${(p.price * p.quantity).toFixed(2)}`)
    .join('\n');

  const message = `
*GAAK SUPLEMENTOS*

*Cliente:* ${order.customer.name}
${order.customer.phone ? `*Telefone:* ${order.customer.phone}` : ''}

*Produtos:*
${productsText}

*Valor Total:* R$${order.total.toFixed(2)}
*Forma de Pagamento:* ${order.paymentMethod}

*Endereço de Entrega:*
${order.customer.address.street}, nº ${order.customer.address.number}
${order.customer.address.complement ? order.customer.address.complement + '\n' : ''}${order.customer.address.neighborhood}
${order.customer.address.city} - ${order.customer.address.state}
CEP: ${order.customer.address.zipCode}
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
 * Register or update customer in clients collection (dashboard)
 */
function registerClientBestEffort(customer) {
  const address = customer?.address || {};
  const addressText = [
    `${address.street || ''}, ${address.number || ''}`.trim().replace(/^,\s*/, ''),
    address.complement || '',
    address.neighborhood || '',
    `${address.city || ''} - ${address.state || ''}`.trim().replace(/^-\s*/, ''),
    address.zipCode ? `CEP: ${address.zipCode}` : ''
  ].filter(Boolean).join(' | ');

  const payload = {
    nome: customer?.name?.trim() || '',
    telefone: customer?.phone?.trim() || '',
    endereco: addressText,
    email: ''
  };

  if (!payload.nome) return;

  fetch('/api/clients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch((error) => {
    console.error('Error registering client in background:', error);
  });
}
