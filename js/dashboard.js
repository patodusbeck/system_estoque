/* ========================================
   COMERCIAL MATOS - DASHBOARD SCRIPT (DYNAMIC)
   ======================================== */

// ========== ELEMENTOS DO DOM ==========
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const navItems = document.querySelectorAll('.nav-item[data-section]');
const sections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('pageTitle');

// ========== NAVEGAÇÃO ==========

function navigateToSection(sectionId) {
    navItems.forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeItem) activeItem.classList.add('active');

    sections.forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'clientes': 'Clientes',
        'produtos': 'Produtos',
        'vendas': 'Vendas'
    };
    pageTitle.textContent = titles[sectionId] || 'Dashboard';
    closeSidebar(); // Mobile

    // Se for uma seção de tabela, carregar dados
    if (sectionId !== 'dashboard') {
        loadTableData(sectionId);
    } else {
        loadDashboardStats();
    }
}

function toggleSidebar() {
    sidebar.classList.toggle('open');
    let overlay = document.querySelector('.sidebar-overlay');
    if (sidebar.classList.contains('open')) {
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay active';
            overlay.addEventListener('click', closeSidebar);
            document.body.appendChild(overlay);
        } else { overlay.classList.add('active'); }
    } else {
        if (overlay) overlay.classList.remove('active');
    }
}

function closeSidebar() {
    sidebar.classList.remove('open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
}

// ========== CARREGAMENTO DE DADOS ==========

// Mapeamento Seção -> Endpoint API
const SECTION_ENTITY_MAP = {
    'clientes': 'clients',
    'produtos': 'products',
    'vendas': 'sales'
};

async function loadTableData(sectionId) {
    const entity = SECTION_ENTITY_MAP[sectionId];
    if (!entity) return;

    const tableId = `${sectionId}Table`;
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Carregando...</td></tr>';

    try {
        const data = await window.API.get(entity);
        renderTableRows(sectionId, data);

        // Atualiza instância do DataTable se existir
        if (window.tables && window.tables[sectionId]) {
            window.tables[sectionId].reload();
        }
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" style="color:red">Erro: ${error.message}</td></tr>`;
    }
}

function renderTableRows(sectionId, data) {
    const tableId = `${sectionId}Table`;
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Nenhum registro encontrado.</td></tr>';
        return;
    }

    data.forEach(item => {
        let row = '';
        if (sectionId === 'clientes') {
            row = `
                <td>${item._id.substr(-6)}</td>
                <td>${item.nome}</td>
                <td>${item.telefone}</td>
                <td>
                    <button class="btn-icon" onclick="editItem('client', '${item._id}')"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn-icon btn-danger" onclick="deleteItem('client', '${item._id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
        } else if (sectionId === 'produtos') {
            row = `
                <td>${item._id.substr(-6)}</td>
                <td>${item.nome}</td>
                <td>R$ ${item.preco.toFixed(2)}</td>
                <td>${item.estoque}</td>
                <td>
                    <button class="btn-icon" onclick="editItem('product', '${item._id}')"><i class="fa-solid fa-edit"></i></button>
                    <button class="btn-icon btn-danger" onclick="deleteItem('product', '${item._id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
        } else if (sectionId === 'vendas') {
            const dateObj = new Date(item.data);
            const date = dateObj.toLocaleDateString('pt-BR');
            const time = dateObj.toLocaleTimeString('pt-BR'); // Padrão inclui segundos
            const statusClass = item.status === 'concluida' ? 'success' : item.status === 'cancelada' ? 'danger' : 'warning';
            const clientName = item.cliente ? item.cliente.nome : (item.clienteNome || 'Balcão');

            row = `
                <td>${item._id.substr(-6)}</td>
                <td>${time} - ${date}</td>
                <td>${clientName}</td>
                <td>R$ ${item.total.toFixed(2)}</td>
                <td><span class="badge badge-${statusClass}">${item.status}</span></td>
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

        // Atualizar cards de estatísticas
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

        // --- CÁLCULO DE CRESCIMENTO ---
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const lastMonthDate = new Date(now);
        lastMonthDate.setMonth(now.getMonth() - 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        // Filtros de Vendas
        const salesThisMonth = sales.filter(s => {
            const d = new Date(s.data);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const salesLastMonth = sales.filter(s => {
            const d = new Date(s.data);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        // Filtros de Clientes
        const clientsThisMonth = clients.filter(c => {
            const d = new Date(c.createdAt || c.data);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const clientsLastMonth = clients.filter(c => {
            const d = new Date(c.createdAt || c.data);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });

        // 1. Vendas vs Mês Anterior
        updateGrowthIndicator('vendas', salesThisMonth.length, salesLastMonth.length);

        // 2. Novos Clientes (comparação de novos cadastros)
        updateGrowthIndicator('clientes', clientsThisMonth.length, clientsLastMonth.length);

        // 3. Ticket Médio
        const ticketThisMonth = salesThisMonth.length ? (salesThisMonth.reduce((acc, s) => acc + (s.total || 0), 0) / salesThisMonth.length) : 0;
        const ticketLastMonth = salesLastMonth.length ? (salesLastMonth.reduce((acc, s) => acc + (s.total || 0), 0) / salesLastMonth.length) : 0;
        updateGrowthIndicator('ticket', ticketThisMonth, ticketLastMonth);

        // 4. Faturamento Total
        const revThisMonth = salesThisMonth.reduce((acc, s) => acc + (s.total || 0), 0);
        const revLastMonth = salesLastMonth.reduce((acc, s) => acc + (s.total || 0), 0);
        updateGrowthIndicator('faturamento', revThisMonth, revLastMonth);

    } catch (e) {
        console.error("Erro ao carregar stats", e);
    }
}

/**
 * Atualiza visualmente um indicador de crescimento
 */
function updateGrowthIndicator(key, current, last) {
    const valueEl = document.getElementById(`${key}GrowthValue`);
    const itemEl = document.getElementById(`${key}GrowthItem`);
    if (!valueEl || !itemEl) return;

    let growth = 0;
    if (last > 0) {
        growth = ((current - last) / last) * 100;
    } else if (current > 0) {
        growth = 100; // Se não tinha nada e agora tem, é 100%
    }

    const isPositive = growth >= 0;
    const formattedGrowth = Math.abs(growth).toFixed(1);
    const icon = isPositive ? 'fa-arrow-up' : 'fa-arrow-down';
    const sign = isPositive ? '+' : '-';

    itemEl.className = `growth-item ${isPositive ? 'positive' : 'negative'}`;
    valueEl.innerHTML = `<i class="fa-solid ${icon}"></i> ${sign}${formattedGrowth}%`;
}

// ========== INITIALIZATION ==========

// Listeners
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

// Listener global para recarregar dados quando houver mudança (CRUD)
document.addEventListener('dataChanged', () => {
    // Recarrega a seção atual
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        if (activeSection.id === 'dashboard') loadDashboardStats();
        else loadTableData(activeSection.id);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (document.getElementById(hash)) navigateToSection(hash);

    // ========== SMART POLLING (TEMPO REAL) ==========
    // Atualiza o dashboard automaticamente a cada 5 segundos
    setInterval(() => {
        // Dispara o evento global de mudança de dados
        document.dispatchEvent(new Event('dataChanged'));
        console.log('[POLLING] Sincronizando dados...');
    }, 5000);
});
