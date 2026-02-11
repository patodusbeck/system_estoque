/* ========================================
   COMERCIAL MATOS - SISTEMA DE TABELAS
   Busca, Filtros, Ordenação e Paginação
   ======================================== */

// ========== CLASSE DE GERENCIAMENTO DE TABELAS ==========
class DataTable {
    constructor(tableId, options = {}) {
        this.tableId = tableId;
        this.table = document.getElementById(tableId);
        this.options = {
            searchable: true,
            sortable: true,
            paginated: true,
            itemsPerPage: 10,
            ...options
        };

        this.data = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchTerm = '';
        this.filters = {};

        if (this.table) {
            this.init();
        }
    }

    /**
     * Inicializa a tabela
     */
    init() {
        this.extractData();
        this.createControls();
        this.setupSorting();
        this.render();
    }

    /**
     * Extrai dados da tabela HTML existente
     */
    extractData() {
        const tbody = this.table.querySelector('tbody');
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        const headers = this.table.querySelectorAll('thead th');

        this.columns = Array.from(headers).map((th, index) => ({
            index,
            name: th.textContent.trim(),
            sortable: !th.classList.contains('no-sort')
        }));

        this.data = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            const rowData = {
                _element: row.cloneNode(true),
                _cells: {}
            };

            cells.forEach((cell, index) => {
                rowData._cells[index] = cell.innerHTML;
                rowData[this.columns[index]?.name || index] = cell.textContent.trim();
            });

            return rowData;
        });

        this.filteredData = [...this.data];
    }

    /**
     * Cria os controles de busca, filtros e paginação
     */
    createControls() {
        // Container de controles
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'table-controls';

        // Busca
        if (this.options.searchable) {
            const searchWrapper = document.createElement('div');
            searchWrapper.className = 'search-wrapper';
            searchWrapper.innerHTML = `
        <i class="fa-solid fa-search"></i>
        <input type="text" class="table-search" placeholder="Buscar..." id="${this.tableId}-search">
      `;
            controlsContainer.appendChild(searchWrapper);

            // Event listener para busca
            const searchInput = searchWrapper.querySelector('input');
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.currentPage = 1;
                this.applyFilters();
                this.render();
            });
        }

        // Filtros por coluna (dropdown)
        const filterWrapper = document.createElement('div');
        filterWrapper.className = 'filter-wrapper';
        filterWrapper.innerHTML = `
      <select class="table-filter" id="${this.tableId}-filter">
        <option value="">Todas as colunas</option>
        ${this.columns.map((col, i) =>
            col.name !== 'Ações' ? `<option value="${i}">${col.name}</option>` : ''
        ).join('')}
      </select>
    `;
        controlsContainer.appendChild(filterWrapper);

        // Items por página
        if (this.options.paginated) {
            const perPageWrapper = document.createElement('div');
            perPageWrapper.className = 'per-page-wrapper';
            perPageWrapper.innerHTML = `
        <label>Exibir:</label>
        <select class="per-page-select" id="${this.tableId}-perpage">
          <option value="5">5</option>
          <option value="10" selected>10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      `;
            controlsContainer.appendChild(perPageWrapper);

            const perPageSelect = perPageWrapper.querySelector('select');
            perPageSelect.addEventListener('change', (e) => {
                this.options.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.render();
            });
        }

        // Insere controles antes da tabela
        this.table.parentNode.insertBefore(controlsContainer, this.table);

        // Container de paginação
        if (this.options.paginated) {
            const paginationContainer = document.createElement('div');
            paginationContainer.className = 'table-pagination';
            paginationContainer.id = `${this.tableId}-pagination`;
            this.table.parentNode.insertBefore(paginationContainer, this.table.nextSibling);
        }
    }

    /**
     * Configura ordenação nas colunas
     */
    setupSorting() {
        if (!this.options.sortable) return;

        const headers = this.table.querySelectorAll('thead th');
        headers.forEach((th, index) => {
            if (this.columns[index]?.name === 'Ações') return;

            th.classList.add('sortable');
            th.innerHTML += ' <i class="fa-solid fa-sort sort-icon"></i>';

            th.addEventListener('click', () => {
                this.sort(index);
            });
        });
    }

    /**
     * Ordena os dados por coluna
     * @param {number} columnIndex - Índice da coluna
     */
    sort(columnIndex) {
        const columnName = this.columns[columnIndex]?.name;

        if (this.sortColumn === columnIndex) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnIndex;
            this.sortDirection = 'asc';
        }

        this.filteredData.sort((a, b) => {
            let valA = a[columnName] || '';
            let valB = b[columnName] || '';

            // Tenta converter para número
            const numA = parseFloat(valA.replace(/[^\d.-]/g, ''));
            const numB = parseFloat(valB.replace(/[^\d.-]/g, ''));

            if (!isNaN(numA) && !isNaN(numB)) {
                return this.sortDirection === 'asc' ? numA - numB : numB - numA;
            }

            // Ordenação alfabética
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();

            if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        this.updateSortIcons();
        this.render();
    }

    /**
     * Atualiza ícones de ordenação
     */
    updateSortIcons() {
        const headers = this.table.querySelectorAll('thead th');
        headers.forEach((th, index) => {
            const icon = th.querySelector('.sort-icon');
            if (!icon) return;

            if (index === this.sortColumn) {
                icon.className = `fa-solid fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'} sort-icon active`;
            } else {
                icon.className = 'fa-solid fa-sort sort-icon';
            }
        });
    }

    /**
     * Aplica filtros e busca
     */
    applyFilters() {
        this.filteredData = this.data.filter(row => {
            // Busca global
            if (this.searchTerm) {
                const searchableText = Object.keys(row)
                    .filter(key => !key.startsWith('_'))
                    .map(key => row[key])
                    .join(' ')
                    .toLowerCase();

                if (!searchableText.includes(this.searchTerm)) {
                    return false;
                }
            }

            // Filtros específicos
            for (const [column, value] of Object.entries(this.filters)) {
                if (value && row[column] !== value) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Renderiza a tabela
     */
    render() {
        const tbody = this.table.querySelector('tbody');
        if (!tbody) return;

        // Calcula paginação
        const totalItems = this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.options.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.options.itemsPerPage;
        const endIndex = startIndex + this.options.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        // Limpa tbody
        tbody.innerHTML = '';

        // Renderiza linhas
        if (pageData.length === 0) {
            tbody.innerHTML = `
        <tr class="no-results">
          <td colspan="${this.columns.length}">
            <i class="fa-solid fa-search"></i>
            Nenhum resultado encontrado
          </td>
        </tr>
      `;
        } else {
            pageData.forEach(row => {
                const tr = document.createElement('tr');
                this.columns.forEach((col, index) => {
                    const td = document.createElement('td');
                    td.innerHTML = row._cells[index] || '';
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }

        // Renderiza paginação
        this.renderPagination(totalPages, totalItems);
    }

    /**
     * Renderiza controles de paginação
     * @param {number} totalPages - Total de páginas
     * @param {number} totalItems - Total de itens
     */
    renderPagination(totalPages, totalItems) {
        const container = document.getElementById(`${this.tableId}-pagination`);
        if (!container) return;

        const startItem = ((this.currentPage - 1) * this.options.itemsPerPage) + 1;
        const endItem = Math.min(this.currentPage * this.options.itemsPerPage, totalItems);

        let paginationHTML = `
      <div class="pagination-info">
        Mostrando ${totalItems > 0 ? startItem : 0}-${endItem} de ${totalItems} registros
      </div>
      <div class="pagination-buttons">
    `;

        // Botão anterior
        paginationHTML += `
      <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
    `;

        // Números das páginas
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
        <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
          ${i}
        </button>
      `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += `<span class="pagination-ellipsis">...</span>`;
            }
            paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        // Botão próximo
        paginationHTML += `
      <button class="pagination-btn" ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} data-page="${this.currentPage + 1}">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    `;

        paginationHTML += '</div>';
        container.innerHTML = paginationHTML;

        // Event listeners para botões de paginação
        container.querySelectorAll('.pagination-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.render();
                }
            });
        });
    }

    /**
     * Atualiza dados da tabela
     * @param {Array} newData - Novos dados
     */
    setData(newData) {
        this.data = newData;
        this.filteredData = [...newData];
        this.currentPage = 1;
        this.render();
    }

    /**
     * Adiciona um filtro
     * @param {string} column - Nome da coluna
     * @param {string} value - Valor do filtro
     */
    addFilter(column, value) {
        this.filters[column] = value;
        this.currentPage = 1;
        this.applyFilters();
        this.render();
    }

    /**
     * Remove um filtro
     * @param {string} column - Nome da coluna
     */
    removeFilter(column) {
        delete this.filters[column];
        this.applyFilters();
        this.render();
    }

    /**
     * Recarrega dados do DOM
     */
    reload() {
        this.extractData();
        this.currentPage = 1;
        this.render();
    }
}

// ========== INICIALIZAÇÃO DAS TABELAS ==========
window.tables = {}; // Expor globalmente

/**
 * Inicializa todas as tabelas do dashboard
 */
function initTables() {
    // Aguarda o DOM estar pronto
    setTimeout(() => {
        const clientesTableEl = document.getElementById('clientesTable');
        const produtosTableEl = document.getElementById('produtosTable');
        const vendasTableEl = document.getElementById('vendasTable');

        if (clientesTableEl) {
            window.tables.clientes = new DataTable('clientesTable', {
                itemsPerPage: 10
            });
        }

        if (produtosTableEl) {
            window.tables.produtos = new DataTable('produtosTable', {
                itemsPerPage: 10
            });
        }

        if (vendasTableEl) {
            window.tables.vendas = new DataTable('vendasTable', {
                itemsPerPage: 10
            });
        }
    }, 200);
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initTables);

// ========== EXPORTA CLASSES E FUNÇÕES ==========
window.DataTable = DataTable;
window.initTables = initTables;
