/* ========================================
   GAAK Suplementos - GRÃFICOS DO DASHBOARD
   Integrado com dados reais da API
   ======================================== */

// ========== CONFIGURAÃ‡ÃƒO DE CORES ==========
const CHART_COLORS = {
    verde: '#b30018',
    verdeClaro: '#ff2b3f',
    azul: '#2196F3',
    laranja: '#FF9800',
    vermelho: '#dc3545',
    roxo: '#9C27B0',
    amarelo: '#FFC107',
    cinza: '#666666',
    branco: '#ffffff'
};

// ========== INSTÃ‚NCIAS DOS GRÃFICOS ==========
let salesChart = null;
let productsChart = null;
let revenueChart = null;
let paymentChart = null;

// ========== CACHE DE DADOS ==========
let cachedSales = [];
let cachedProducts = [];

// ========== FUNÃ‡Ã•ES DE BUSCA DE DADOS ==========

/**
 * Busca dados da API e armazena em cache
 */
async function fetchChartData() {
    try {
        const [salesRes, productsRes] = await Promise.all([
            window.API.get('sales'),
            window.API.get('products')
        ]);
        cachedSales = salesRes || [];
        cachedProducts = productsRes || [];
        return true;
    } catch (error) {
        console.error('Erro ao buscar dados para grÃ¡ficos:', error);
        return false;
    }
}

/**
 * Agrupa vendas por perÃ­odo
 * @param {string} period - 'week', 'month', 'year'
 */
function getSalesData(period) {
    const now = new Date();
    let labels = [];
    let data = [];

    if (period === 'week') {
        // Ãšltimos 7 dias
        const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'SÃ¡b'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(days[date.getDay()]);
            
            const count = cachedSales.filter(s => {
                const saleDate = new Date(s.data);
                return saleDate.toDateString() === date.toDateString();
            }).length;
            data.push(count);
        }
    } else if (period === 'month') {
        // Ãšltimas 4 semanas
        for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
            const weekEnd = new Date(now);
            weekEnd.setDate(weekEnd.getDate() - (i * 7));
            labels.push(`Semana ${4 - i}`);
            
            const count = cachedSales.filter(s => {
                const saleDate = new Date(s.data);
                return saleDate >= weekStart && saleDate <= weekEnd;
            }).length;
            data.push(count);
        }
    } else {
        // Ãšltimos 12 meses
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            labels.push(months[date.getMonth()]);
            
            const count = cachedSales.filter(s => {
                const saleDate = new Date(s.data);
                return saleDate.getMonth() === date.getMonth() && 
                       saleDate.getFullYear() === date.getFullYear();
            }).length;
            data.push(count);
        }
    }

    return { labels, data };
}

/**
 * ObtÃ©m os produtos mais vendidos
 */
function getTopProductsData() {
    const productSales = {};
    
    cachedSales.forEach(sale => {
        if (sale.produtos) {
            sale.produtos.forEach(p => {
                const name = p.nome || 'Produto';
                productSales[name] = (productSales[name] || 0) + (p.quantidade || 1);
            });
        }
    });

    // Ordena e pega os 5 primeiros
    const sorted = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
        labels: sorted.map(s => s[0]),
        data: sorted.map(s => s[1])
    };
}

/**
 * ObtÃ©m faturamento por mÃªs
 */
function getRevenueData() {
    const now = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const labels = [];
    const data = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        labels.push(months[date.getMonth()]);
        
        const revenue = cachedSales
            .filter(s => {
                const saleDate = new Date(s.data);
                return saleDate.getMonth() === date.getMonth() && 
                       saleDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, s) => sum + (s.total || 0), 0);
        data.push(revenue);
    }

    return { labels, data };
}

/**
 * ObtÃ©m distribuiÃ§Ã£o de formas de pagamento
 */
function getPaymentMethodsData() {
    const payments = { pix: 0, dinheiro: 0, debito: 0, credito: 0 };
    
    cachedSales.forEach(sale => {
        if (sale.pagamento && payments.hasOwnProperty(sale.pagamento)) {
            payments[sale.pagamento]++;
        }
    });

    const total = Object.values(payments).reduce((a, b) => a + b, 0) || 1;
    
    return {
        labels: ['PIX', 'Dinheiro', 'DÃ©bito', 'CrÃ©dito'],
        data: [
            Math.round((payments.pix / total) * 100),
            Math.round((payments.dinheiro / total) * 100),
            Math.round((payments.debito / total) * 100),
            Math.round((payments.credito / total) * 100)
        ]
    };
}

// ========== FUNÃ‡Ã•ES DE CRIAÃ‡ÃƒO DE GRÃFICOS ==========

function createSalesChart(period = 'month') {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;

    if (salesChart) salesChart.destroy();

    const chartData = getSalesData(period);

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Vendas',
                data: chartData.data,
                borderColor: CHART_COLORS.verde,
                backgroundColor: 'rgba(179, 0, 24, 0.16)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: CHART_COLORS.verde,
                pointBorderColor: CHART_COLORS.branco,
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: CHART_COLORS.verde,
                    titleFont: { size: 14 },
                    bodyFont: { size: 13 },
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { font: { size: 12 } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 12 } }
                }
            }
        }
    });
}

function createProductsChart() {
    const ctx = document.getElementById('productsChart');
    if (!ctx) return;

    if (productsChart) productsChart.destroy();

    const chartData = getTopProductsData();

    // Fallback se nÃ£o houver dados
    if (chartData.labels.length === 0) {
        chartData.labels = ['Sem vendas'];
        chartData.data = [1];
    }

    productsChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: [
                    CHART_COLORS.verde,
                    CHART_COLORS.verdeClaro,
                    CHART_COLORS.azul,
                    CHART_COLORS.laranja,
                    CHART_COLORS.roxo
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.raw / total) * 100).toFixed(1);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

function createRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    if (revenueChart) revenueChart.destroy();

    const chartData = getRevenueData();

    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Faturamento (R$)',
                data: chartData.data,
                backgroundColor: CHART_COLORS.verde,
                borderRadius: 8,
                borderSkipped: false,
                hoverBackgroundColor: CHART_COLORS.verdeClaro
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: CHART_COLORS.verde,
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return `R$ ${context.raw.toLocaleString('pt-BR')}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        font: { size: 12 },
                        callback: function (value) {
                            return 'R$ ' + value.toLocaleString('pt-BR');
                        }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 12 } }
                }
            }
        }
    });
}

function createPaymentChart() {
    const ctx = document.getElementById('paymentChart');
    if (!ctx) return;

    if (paymentChart) paymentChart.destroy();

    const chartData = getPaymentMethodsData();

    paymentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.labels,
            datasets: [{
                data: chartData.data,
                backgroundColor: [
                    CHART_COLORS.verde,
                    CHART_COLORS.laranja,
                    CHART_COLORS.azul,
                    CHART_COLORS.roxo
                ],
                borderWidth: 2,
                borderColor: CHART_COLORS.branco,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Inicializa todos os grÃ¡ficos com dados da API
 */
async function initCharts() {
    await fetchChartData();
    createSalesChart('month');
    createProductsChart();
    createRevenueChart();
    createPaymentChart();
}

// ========== EVENT LISTENERS ==========

document.addEventListener('DOMContentLoaded', () => {
    const periodSelect = document.getElementById('chartPeriod');
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            createSalesChart(e.target.value);
        });
    }

    // Inicializa grÃ¡ficos com delay para garantir DOM pronto
    setTimeout(initCharts, 100);
});

// Reinicializa grÃ¡ficos quando a seÃ§Ã£o dashboard Ã© exibida
const originalNavigateToSection = window.navigateToSection;
if (typeof originalNavigateToSection === 'function') {
    window.navigateToSection = function (sectionId) {
        originalNavigateToSection(sectionId);
        if (sectionId === 'dashboard') {
            setTimeout(initCharts, 100);
        }
    };
}

// ========== EXPORTA FUNÃ‡Ã•ES ==========
window.initCharts = initCharts;
window.createSalesChart = createSalesChart;

