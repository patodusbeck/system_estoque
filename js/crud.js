/* ========================================
   COMERCIAL MATOS - SISTEMA CRUD (API)
   Create, Read, Update, Delete via Backend
   ======================================== */

// ========== CONFIGURAÇÃO DE FORMULÁRIOS ==========
const FORM_CONFIG = {
    client: { // Alterado de 'cliente' para 'client' para bater com API ou manter mapeamento
        title: 'Cliente',
        entity: 'clients', // Nome da rota API
        fields: [
            { name: 'nome', label: 'Nome Completo', type: 'text', required: true, placeholder: 'Digite o nome do cliente' },
            { name: 'telefone', label: 'Telefone', type: 'tel', required: true, placeholder: '(99) 99999-9999' },
            { name: 'email', label: 'E-mail', type: 'email', required: false, placeholder: 'email@exemplo.com' },
            { name: 'endereco', label: 'Endereço', type: 'text', required: false, placeholder: 'Rua, número, bairro' }
        ]
    },
    product: { // Alterado de 'produto' para 'product'
        title: 'Produto',
        entity: 'products',
        fields: [
            { name: 'nome', label: 'Nome do Produto', type: 'text', required: true, placeholder: 'Ex: Espetinho de Carne' },
            { name: 'descricao', label: 'Descrição', type: 'textarea', required: false, placeholder: 'Descrição do produto' },
            { name: 'preco', label: 'Preço (R$)', type: 'number', required: true, placeholder: '0.00', step: '0.01', min: '0' },
            { name: 'img', label: 'Foto (URL ou caminho)', type: 'text', required: false, placeholder: 'images/produto.jpg' },
            { name: 'estoque', label: 'Estoque', type: 'number', required: true, placeholder: '0', min: '0' },
            {
                name: 'categoria', label: 'Categoria', type: 'select', required: true, options: [
                    { value: '', label: 'Selecione...' },
                    { value: 'espetinho', label: 'Espetinhos' },
                    { value: 'bebida', label: 'Bebidas' },
                    { value: 'acompanhamento', label: 'Acompanhamentos' },
                    { value: 'outro', label: 'Outros' }
                ]
            }
        ]
    },
    sale: { // Alterado de 'venda' para 'sale'
        title: 'Venda',
        entity: 'sales',
        fields: [
            { name: 'clienteId', label: 'Cliente', type: 'select', required: false, options: 'clients' }, // clienteId ao invés de cliente
            // Data é automática no backend
            { name: 'produtos', label: 'Produtos', type: 'multiselect', required: true },
            { name: 'total', label: 'Total (R$)', type: 'number', required: true, placeholder: '0.00', step: '0.01', min: '0', readonly: true },
            {
                name: 'pagamento', label: 'Forma de Pagamento', type: 'select', required: true, options: [
                    { value: '', label: 'Selecione...' },
                    { value: 'pix', label: 'PIX' },
                    { value: 'dinheiro', label: 'Dinheiro' },
                    { value: 'debito', label: 'Cartão Débito' },
                    { value: 'credito', label: 'Cartão Crédito' }
                ]
            },
            {
                name: 'status', label: 'Status', type: 'select', required: true, options: [
                    { value: 'pendente', label: 'Pendente' },
                    { value: 'concluida', label: 'Concluída' },
                    { value: 'cancelada', label: 'Cancelada' }
                ]
            }
        ]
    }
};

// Mapeamento de nomes antigos para novos (compatibilidade)
const ENTITY_MAP = {
    'cliente': 'client',
    'produto': 'product',
    'venda': 'sale'
};

// ========== ESTADO ==========
let currentEntity = null; // 'client', 'product', 'sale'
let currentMode = 'create';
let currentEditId = null;

// ========== API SERVICE ==========
const API = {
    baseUrl: '/api',

    async get(entity) {
        const res = await fetch(`${this.baseUrl}/${entity}`);
        return res.json();
    },

    async getOne(entity, id) {
        // Como o backend pode não ter rota específica de getOne configurada para todos, 
        // mas o mongoose findById funciona. Vamos assumir que temos o dado local ou buscar da lista
        // Ideal seria rota /api/entity/:id
        // Para simplificar, vou buscar da lista localmente na memória se a tabela já carregou,
        // mas aqui vou assumir que preciso buscar da API se for editar.
        // Vou usar a rota de listagem e filtrar por enquanto, ou implementar rota de detalhe.
        // IMPLEMENTAÇÃO RÁPIDA: filtrar do window.tableData se disponível, ou rota específica.
        const res = await fetch(`${this.baseUrl}/${entity}`);
        const list = await res.json();
        return list.find(item => item._id === id || item.id === id);
    },

    async create(entity, data) {
        const res = await fetch(`${this.baseUrl}/${entity}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Erro ao criar item');
        return res.json();
    },

    async update(entity, id, data) {
        const res = await fetch(`${this.baseUrl}/${entity}?id=${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Erro ao atualizar item');
        }
        return res.json();
    },

    async delete(entity, id) {
        const res = await fetch(`${this.baseUrl}/${entity}?id=${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Erro ao excluir item');
        }
        return res.json();
    }
};

// ========== FUNÇÕES DO MODAL ==========

/**
 * Abre o modal
 * @param {string} entityType - cliente, produto, venda
 * @param {string} id - ID para edição
 */
async function openModal(entityType, id = null) {
    // Mapeia nome antigo para novo
    const mappedEntity = ENTITY_MAP[entityType] || entityType;
    const config = FORM_CONFIG[mappedEntity];

    if (!config) {
        console.error('Entidade não configurada:', entityType);
        return;
    }

    currentEntity = mappedEntity;
    currentMode = id ? 'edit' : 'create';
    currentEditId = id;

    // Cria/Busca modal
    let modal = document.getElementById('crudModal');
    if (!modal) {
        modal = createModalElement();
        document.body.appendChild(modal);
    }

    // Título
    const title = document.getElementById('modalTitle');
    title.innerHTML = `<i class="fa-solid fa-${currentMode === 'create' ? 'plus' : 'edit'}"></i> ${currentMode === 'create' ? 'Novo' : 'Editar'} ${config.title}`;

    // Gera formulário
    const formContainer = document.getElementById('modalFormContainer');
    // Precisamos aguardar a geração dos campos pois pode haver fetch de options
    formContainer.innerHTML = 'Carregando...';
    formContainer.innerHTML = await generateFormFields(config.fields);

    // Se edição, carrega dados
    if (id) {
        try {
            const item = await API.getOne(config.entity, id);
            fillFormData(item, config.fields);
        } catch (error) {
            console.error(error);
            showNotification('Erro ao carregar dados', 'error');
            closeModal();
            return;
        }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('crudModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentEntity = null;
    currentMode = 'create';
    currentEditId = null;
}

function createModalElement() {
    const modal = document.createElement('div');
    modal.id = 'crudModal';
    modal.className = 'crud-modal';
    modal.innerHTML = `
    <div class="crud-modal-overlay" onclick="closeModal()"></div>
    <div class="crud-modal-content">
      <div class="crud-modal-header">
        <h2 id="modalTitle"></h2>
        <button class="crud-modal-close" onclick="closeModal()"><i class="fa-solid fa-times"></i></button>
      </div>
      <form id="crudForm" onsubmit="handleSubmit(event)">
        <div class="crud-modal-body" id="modalFormContainer"></div>
        <div class="crud-modal-footer">
          <button type="button" class="btn-cancel" onclick="closeModal()">Cancelar</button>
          <button type="submit" class="btn-save">Salvar</button>
        </div>
      </form>
    </div>
  `;
    return modal;
}

// ========== GERADOR DE FORMULÁRIO ==========

async function generateFormFields(fields) {
    let html = '';
    for (const field of fields) {
        let inputHTML = '';
        const requiredAttr = field.required ? 'required' : '';
        const readonlyAttr = field.readonly ? 'readonly' : '';

        switch (field.type) {
            case 'textarea':
                inputHTML = `<textarea id="${field.name}" name="${field.name}" rows="3" ${requiredAttr}></textarea>`;
                break;
            case 'select':
                let options = [];
                if (Array.isArray(field.options)) {
                    options = field.options;
                } else if (typeof field.options === 'string') {
                    // Fetch options da API (ex: clients)
                    try {
                        const data = await API.get(field.options);
                        options = [{ value: '', label: 'Selecione...' }, ...data.map(i => ({ value: i._id, label: i.nome }))];
                    } catch (e) {
                        console.error('Erro ao carregar options', e);
                    }
                }
                inputHTML = `<select id="${field.name}" name="${field.name}" ${requiredAttr}>
                    ${options.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
                </select>`;
                break;
            case 'multiselect': // Produtos na venda
                const prods = await API.get('products');
                const checks = prods.map(p => `
                    <label class="multiselect-item">
                        <input type="checkbox" value="${p._id}" data-preco="${p.preco}" data-nome="${p.nome}">
                        <span>${p.nome} - R$ ${p.preco.toFixed(2)}</span>
                        <input type="number" class="qty-input" min="1" value="1" style="width: 50px; margin-left: auto;" disabled>
                    </label>
                `).join('');
                inputHTML = `
                    <div class="multiselect-container">
                        <div class="multiselect-dropdown" style="display:block; position:static; max-height:200px; overflow-y:auto; border:1px solid #ddd;">${checks}</div>
                    </div>
                `;
                // Add script para calcular total ao selecionar
                setTimeout(() => setupMultiselectLogic(), 100);
                break;
            default:
                inputHTML = `<input type="${field.type}" id="${field.name}" name="${field.name}" ${field.step ? `step="${field.step}"` : ''} ${requiredAttr} ${readonlyAttr}>`;
        }
        html += `<div class="form-group"><label>${field.label}</label>${inputHTML}</div>`;
    }
    return html;
}

function setupMultiselectLogic() {
    const checkboxes = document.querySelectorAll('.multiselect-item input[type="checkbox"]');
    const totalInput = document.getElementById('total');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const qtyInput = cb.parentElement.querySelector('.qty-input');
            qtyInput.disabled = !cb.checked;
            calculateTotal();
        });
    });

    const qtyInputs = document.querySelectorAll('.multiselect-item .qty-input');
    qtyInputs.forEach(input => {
        input.addEventListener('input', calculateTotal);
    });

    function calculateTotal() {
        let total = 0;
        checkboxes.forEach(cb => {
            if (cb.checked) {
                const price = parseFloat(cb.dataset.preco);
                const qty = parseInt(cb.parentElement.querySelector('.qty-input').value) || 1;
                total += price * qty;
            }
        });
        if (totalInput) totalInput.value = total.toFixed(2);
    }
}

function fillFormData(item, fields) {
    fields.forEach(field => {
        const el = document.getElementById(field.name);
        if (!el) return;

        if (field.type === 'multiselect') {
            // Preencher checkboxes
            if (item.produtos) {
                item.produtos.forEach(p => {
                    const cb = document.querySelector(`input[value="${p.produto._id || p.produto}"]`);
                    if (cb) {
                        cb.checked = true;
                        const qtyInput = cb.parentElement.querySelector('.qty-input');
                        qtyInput.disabled = false;
                        qtyInput.value = p.quantidade;
                    }
                });
            }
        } else {
            // Campos normais
            // Se for select de objeto, pega o ID
            let val = item[field.name];
            if (val && typeof val === 'object' && val._id) val = val._id;
            el.value = val || '';
        }
    });
}

// ========== HANDLERS ==========

async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); // Básico

    // Processar Multiselect manualmente
    if (currentEntity === 'sale') {
        const selected = [];
        document.querySelectorAll('.multiselect-item input[type="checkbox"]:checked').forEach(cb => {
            selected.push({
                produto: cb.value,
                nome: cb.dataset.nome,
                preco: parseFloat(cb.dataset.preco),
                quantidade: parseInt(cb.parentElement.querySelector('.qty-input').value)
            });
        });
        data.produtos = selected;
    }

    const config = FORM_CONFIG[currentEntity];

    try {
        if (currentMode === 'create') {
            await API.create(config.entity, data);
            showNotification('Item criado com sucesso!', 'success');
        } else {
            await API.update(config.entity, currentEditId, data);
            showNotification('Item atualizado com sucesso!', 'success');
        }
        closeModal();
        // Disparar evento para atualizar tabelas
        document.dispatchEvent(new Event('dataChanged'));
    } catch (error) {
        console.error(error);
        showNotification('Erro ao salvar: ' + error.message, 'error');
    }
}

// ========== NOTIFICAÇÕES ==========
function showNotification(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = `notification notification-${type}`;
    div.innerHTML = `<i class="fa-solid fa-info-circle"></i><span>${msg}</span>`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 4000);
}

// Expoe globalmente
window.openModal = openModal;
window.closeModal = closeModal;
window.editItem = (type, id) => openModal(type, id);
window.deleteItem = async (type, id) => {
    if (!confirm('Tem certeza?')) return;
    const mapped = ENTITY_MAP[type] || type;
    const config = FORM_CONFIG[mapped];
    try {
        await API.delete(config.entity, id);
        showNotification('Item excluído', 'success');
        document.dispatchEvent(new Event('dataChanged'));
    } catch (e) {
        showNotification('Erro ao excluir', 'error');
    }
};
window.API = API; // Para uso em outros scripts
window.handleSubmit = handleSubmit; // Para o form
