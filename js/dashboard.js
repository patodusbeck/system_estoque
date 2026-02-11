/* ========================================
   GAAK Suplementos - DASHBOARD SCRIPT (DYNAMIC)
   ======================================== */

// ========== ELEMENTOS DO DOM ==========
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item[data-section]');
const sections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('pageTitle');

const POLLING_INTERVAL_MS = 5000;
const TABLE_UPDATE_COOLDOWN_MS = 4000;
let lastUserInteractionAt = Date.now();
const tableDataSignatureBySection = {};

// ========== NAVEGACAO ==========

function navigateToSection(sectionId) {
    navItems.forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeItem) activeItem.classList.add('active');

    sections.forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        clientes: 'Clientes',
        produtos: 'Produtos',
        vendas: 'Vendas',
        cupons: 'Cupons'
    };
    pageTitle.textContent = titles[sectionId] || 'Dashboard';
    closeSidebar();

    if (sectionId !== 'dashboard') {
        loadTableData(sectionId, { preservePage: true, preserveScroll: true });
    } else {
        loadDashboardStats();
    }
}

function toggleSidebar() {
    sidebar.classList.toggle('open');
    let overlay = document.querySelector('.sidebar-overlay');
    if (sidebar.classList.contains('open')) {
        document.body.classList.add('sidebar-open');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay active';
            overlay.addEventListener('click', closeSidebar);
            document.body.appendChild(overlay);
        } else {
            overlay.classList.add('active');
        }
    } else if (overlay) {
        overlay.classList.remove('active');
    }
}

function closeSidebar() {
    sidebar.classList.remove('open');
    document.body.classList.remove('sidebar-open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
}

// ========== CARREGAMENTO DE DADOS ==========

const SECTION_ENTITY_MAP = {
    clientes: 'clients',
    produtos: 'products',
    vendas: 'sales',
    cupons: 'coupons'
};

function buildTableSignature(sectionId, data) {
    if (!Array.isArray(data)) return '';
    if (sectionId === 'clientes') {
        return JSON.stringify(data.map((item) => [item._id, item.nome, item.telefone, item.updatedAt]));
    }
    if (sectionId === 'produtos') {
        return JSON.stringify(data.map((item) => [item._id, item.nome, item.preco, item.estoque, item.updatedAt]));
    }
    if (sectionId === 'cupons') {
        return JSON.stringify(data.map((item) => [item._id, item.code, item.discountPercent, item.startsAt, item.expiresAt, item.active, item.updatedAt]));
    }
    return JSON.stringify(data.map((item) => [item._id, item.total, item.couponCode, item.status, item.data, item.updatedAt]));
}

async function loadTableData(sectionId, options = {}) {
    const { silent = false, preservePage = false, preserveScroll = false } = options;
    const entity = SECTION_ENTITY_MAP[sectionId];
    if (!entity) return;

    const tableId = `${sectionId}Table`;
    const tbody = document.querySelector(`#${tableId} tbody`);
    const columnsCount = document.querySelectorAll(`#${tableId} thead th`).length || 1;
    if (!tbody) return;

    const previousScrollY = preserveScroll ? window.scrollY : 0;
    if (!silent) {
        tbody.innerHTML = `<tr><td colspan="${columnsCount}" style="text-align:center">Carregando...</td></tr>`;
    }

    try {
        const data = await window.API.get(entity);
        const nextSignature = buildTableSignature(sectionId, data);
        if (silent && tableDataSignatureBySection[sectionId] === nextSignature) {
            return;
        }

        tableDataSignatureBySection[sectionId] = nextSignature;
        renderTableRows(sectionId, data);

        if (window.tables && window.tables[sectionId]) {
            window.tables[sectionId].reload({ preservePage });
        }

        if (preserveScroll) {
            window.scrollTo(0, previousScrollY);
        }
    } catch (error) {
        if (!silent) {
            tbody.innerHTML = `<tr><td colspan="${columnsCount}" style="color:red">Erro: ${error.message}</td></tr>`;
        }
    }
}

function renderTableRows(sectionId, data) {
    const tableId = `${sectionId}Table`;
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    tbody.innerHTML = '';

    if (data.length === 0) {
        const columnsCount = document.querySelectorAll(`#${tableId} thead th`).length || 1;
        tbody.innerHTML = `<tr><td colspan="${columnsCount}" style="text-align:center">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    data.forEach(item => {
        let row = '';
        if (sectionId === 'clientes') {
            row = `
                <td data-label="ID">${item._id.substr(-6)}</td>
                <td data-label="Nome">${item.nome}</td>
                <td data-label="Telefone">${item.telefone}</td>
                <td data-label="Ações" class="actions-cell">
                    <button class="btn-icon" onclick="editItem('client', '${item._id}')"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn-icon btn-danger" onclick="deleteItem('client', '${item._id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
        } else if (sectionId === 'produtos') {
            row = `
                <td data-label="ID">${item._id.substr(-6)}</td>
                <td data-label="Produto">${item.nome}</td>
                <td data-label="Preço">R$ ${item.preco.toFixed(2)}</td>
                <td data-label="Estoque">${item.estoque}</td>
                <td data-label="Ações" class="actions-cell">
                    <button class="btn-icon" onclick="editItem('product', '${item._id}')"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn-icon btn-danger" onclick="deleteItem('product', '${item._id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
        } else if (sectionId === 'vendas') {
            const dateObj = new Date(item.data);
            const date = dateObj.toLocaleDateString('pt-BR');
            const time = dateObj.toLocaleTimeString('pt-BR');
            const statusClass = item.status === 'concluida' ? 'success' : item.status === 'cancelada' ? 'danger' : 'warning';
            const clientName = item.cliente ? item.cliente.nome : (item.clienteNome || 'Balcao');

            row = `
                <td data-label="ID">${item._id.substr(-6)}</td>
                <td data-label="Data">${time} - ${date}</td>
                <td data-label="Cliente">${clientName}</td>
                <td data-label="Total">R$ ${item.total.toFixed(2)}</td>
                <td data-label="Cupom">${item.couponCode || 'Não'}</td>
                <td data-label="Status" class="status-cell"><span class="badge badge-${statusClass}">${item.status}</span></td>
            `;
        } else if (sectionId === 'cupons') {
            const start = item.startsAt ? new Date(item.startsAt).toLocaleString('pt-BR') : '-';
            const end = item.expiresAt ? new Date(item.expiresAt).toLocaleString('pt-BR') : '-';
            const status = item.status || ((item.active === false) ? 'inativo' : 'ativo');
            const statusClass = status === 'ativo' ? 'success' : status === 'expirado' ? 'danger' : 'warning';
            row = `
                <td data-label="ID">${item._id.substr(-6)}</td>
                <td data-label="Codigo">${item.code}</td>
                <td data-label="Desconto">${Number(item.discountPercent || 0)}%</td>
                <td data-label="Inicio">${start}</td>
                <td data-label="Validade">${end}</td>
                <td data-label="Status" class="status-cell"><span class="badge badge-${statusClass}">${status}</span></td>
                <td data-label="Ações" class="actions-cell">
                    <button class="btn-icon" onclick="editItem('coupon', '${item._id}')"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn-icon btn-danger" onclick="deleteItem('coupon', '${item._id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = row;
        tbody.appendChild(tr);
    });
}

async function loadDashboardStats() {
    try {
        const [clients, products, sales] = await Promise.all([
            window.API.get('clients'),
            window.API.get('products'),
            window.API.get('sales')
        ]);

        const cards = document.querySelectorAll('.stat-card');
        if (cards.length >= 4) {
            cards[0].querySelector('.stat-number').textContent = clients.length;
            cards[1].querySelector('.stat-number').textContent = products.length;

            const todayStr = new Date().toLocaleDateString();
            const salesToday = sales.filter(s => new Date(s.data).toLocaleDateString() === todayStr).length;
            cards[2].querySelector('.stat-number').textContent = salesToday;

            const totalRevenue = sales.reduce((acc, curr) => acc + (curr.total || 0), 0);
            cards[3].querySelector('.stat-number').textContent = `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const lastMonthDate = new Date(now);
        lastMonthDate.setMonth(now.getMonth() - 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const salesThisMonth = sales.filter(s => {
            const d = new Date(s.data);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const salesLastMonth = sales.filter(s => {
            const d = new Date(s.data);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        const clientsThisMonth = clients.filter(c => {
            const d = new Date(c.createdAt || c.data);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const clientsLastMonth = clients.filter(c => {
            const d = new Date(c.createdAt || c.data);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        updateGrowthIndicator('vendas', salesThisMonth.length, salesLastMonth.length);
        updateGrowthIndicator('clientes', clientsThisMonth.length, clientsLastMonth.length);

        const ticketThisMonth = salesThisMonth.length ? (salesThisMonth.reduce((acc, s) => acc + (s.total || 0), 0) / salesThisMonth.length) : 0;
        const ticketLastMonth = salesLastMonth.length ? (salesLastMonth.reduce((acc, s) => acc + (s.total || 0), 0) / salesLastMonth.length) : 0;
        updateGrowthIndicator('ticket', ticketThisMonth, ticketLastMonth);

        const revThisMonth = salesThisMonth.reduce((acc, s) => acc + (s.total || 0), 0);
        const revLastMonth = salesLastMonth.reduce((acc, s) => acc + (s.total || 0), 0);
        updateGrowthIndicator('faturamento', revThisMonth, revLastMonth);
    } catch (e) {
        console.error('Erro ao carregar stats', e);
    }
}

function updateGrowthIndicator(key, current, last) {
    const valueEl = document.getElementById(`${key}GrowthValue`);
    const itemEl = document.getElementById(`${key}GrowthItem`);
    if (!valueEl || !itemEl) return;

    let growth = 0;
    if (last > 0) {
        growth = ((current - last) / last) * 100;
    } else if (current > 0) {
        growth = 100;
    }

    const isPositive = growth >= 0;
    const formattedGrowth = Math.abs(growth).toFixed(1);
    const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    const sign = isPositive ? '+' : '-';

    itemEl.className = `growth-item ${isPositive ? 'positive' : 'negative'}`;
    valueEl.innerHTML = `<i class="fa-solid ${icon}"></i> ${sign}${formattedGrowth}%`;
}

// ========== INITIALIZATION ==========

if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.getAttribute('data-section');
        navigateToSection(sectionId);
        history.pushState(null, '', `#${sectionId}`);
    });
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) navigateToSection(hash);
});

['touchstart', 'touchmove', 'scroll', 'mousedown', 'keydown'].forEach((eventName) => {
    window.addEventListener(eventName, () => {
        lastUserInteractionAt = Date.now();
    }, { passive: true });
});

document.addEventListener('dataChanged', () => {
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;
    if (activeSection.id === 'dashboard') {
        loadDashboardStats();
    } else {
        loadTableData(activeSection.id, { preservePage: true, preserveScroll: true });
    }
});

async function runSmartPolling() {
    if (document.hidden) return;
    if (sidebar && sidebar.classList.contains('open')) return;

    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;

    if (activeSection.id === 'dashboard') {
        loadDashboardStats();
        return;
    }

    const isTableSection = SECTION_ENTITY_MAP[activeSection.id];
    if (!isTableSection) return;

    const isUserInteracting = Date.now() - lastUserInteractionAt < TABLE_UPDATE_COOLDOWN_MS;
    if (isUserInteracting) return;

    await loadTableData(activeSection.id, {
        silent: true,
        preservePage: true,
        preserveScroll: true
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (document.getElementById(hash)) navigateToSection(hash);
    setInterval(runSmartPolling, POLLING_INTERVAL_MS);
});

window.navigateToSection = navigateToSection;
