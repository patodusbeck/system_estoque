/* ========================================
   GAAK Suplementos - SCRIPT DO CARDÁPIO (API)
   ======================================== */

// ========== CONFIGURAÇÃO ==========
const CONFIG = {
    whatsapp: "5599984065730",
    nomeEmpresa: "GAAK Suplementos"
};

// ========== ESTADO ==========
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || {};
let produtosData = []; // Será carregado da API

const menuEl = document.getElementById("menu");
const totalEl = document.getElementById("total");

// ========== INICIALIZAÇÃO ==========

async function init() {
    // Verificar se acabou de voltar de uma venda
    if (localStorage.getItem("vendaConcluida")) {
        mostrarNotificacao("Agradecemos pela preferência!");
        localStorage.removeItem("vendaConcluida");
    }

    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        produtosData = products; // Salva globalmente
        renderMenu(products);
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        menuEl.innerHTML = "<p>Erro ao carregar cardápio. Tente novamente mais tarde.</p>";
    }
    atualizarTotal();
}

/**
 * Mostra uma notificação toast na tela
 */
function mostrarNotificacao(mensagem) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${mensagem}`;
    document.body.appendChild(toast);

    // Ativa a animação
    setTimeout(() => toast.classList.add("active"), 100);

    // Remove após 4 segundos
    setTimeout(() => {
        toast.classList.remove("active");
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

/**
 * Renderiza o menu agrupado por categoria
 */
function renderMenu(products) {
    menuEl.innerHTML = '';

    // Agrupa por categoria
    const categorias = {
        'espetinho': { title: 'Espetinhos', icon: 'fa-drumstick-bite', items: [] },
        'bebida': { title: 'Bebidas', icon: 'fa-glass-cheers', items: [] },
        'acompanhamento': { title: 'Acompanhamentos', icon: 'fa-utensils', items: [] },
        'outro': { title: 'Outros', icon: 'fa-star', items: [] }
    };

    products.forEach(p => {
        const cat = categorias[p.categoria] || categorias['outro'];
        cat.items.push(p);
    });

    // Renderiza
    Object.values(categorias).forEach(cat => {
        if (cat.items.length === 0) return;

        const section = document.createElement("div");
        section.innerHTML = `
            <div class="section-title"><i class="fa-solid ${cat.icon}"></i> ${cat.title}</div>
        `;

        cat.items.forEach(p => {
            // Inicializa carrinho
            carrinho[p._id] ??= 0;

            const div = document.createElement("div");
            div.className = "item";
            // Usa imagem padrão se não tiver
            const img = p.img || 'assets/favicon.png';

            div.innerHTML = `
                <img src="${img}" alt="${p.nome}" onerror="this.src='assets/favicon.png'">
                <div class="item-info">
                    <strong>${p.nome}</strong>
                    <span>${p.descricao || ''}</span>
                    <div class="item-footer">
                        <div class="price">R$ ${p.preco.toFixed(2)}</div>
                        <div class="qty">
                            <button onclick="alterar('${p._id}', -1)" aria-label="Diminuir">-</button>
                            <span id="qty-${p._id}">${carrinho[p._id] || 0}</span>
                            <button onclick="alterar('${p._id}', 1)" aria-label="Aumentar">+</button>
                        </div>
                    </div>
                </div>
            `;
            section.appendChild(div);
        });
        menuEl.appendChild(section);
    });
}

// ========== CARRINHO ==========

window.alterar = function (id, delta) {
    carrinho[id] = Math.max(0, (carrinho[id] || 0) + delta);
    const qtyEl = document.getElementById(`qty-${id}`);
    if (qtyEl) qtyEl.textContent = carrinho[id];

    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    atualizarTotal();
}

function atualizarTotal() {
    let total = calculateTotalValue();
    if (totalEl) totalEl.innerText = total.toFixed(2);
}

function calculateTotalValue() {
    let total = 0;
    Object.entries(carrinho).forEach(([id, qty]) => {
        const prod = produtosData.find(p => p._id === id);
        if (prod && qty > 0) {
            total += prod.preco * qty;
        }
    });
    return total;
}

window.limparCarrinho = function () {
    if (Object.values(carrinho).every(q => q === 0)) return alert("Carrinho vazio!");
    if (confirm("Limpar carrinho?")) {
        carrinho = {};
        localStorage.removeItem("carrinho");
        // Atualiza UI
        document.querySelectorAll('[id^="qty-"]').forEach(el => el.textContent = '0');
        atualizarTotal();
    }
}

// ========== MODAL DE CHECKOUT ==========

window.abrirCarrinho = function () {
    const total = calculateTotalValue();
    if (total === 0) return alert("Carrinho vazio!");

    const lista = document.getElementById("listaCarrinho");
    lista.innerHTML = "";

    Object.entries(carrinho).forEach(([id, qty]) => {
        const p = produtosData.find(prod => prod._id === id);
        if (p && qty > 0) {
            const sub = p.preco * qty;
            lista.innerHTML += `<div class="cart-item">
                <span>${p.nome} x${qty}</span>
                <strong>R$ ${sub.toFixed(2)}</strong>
            </div>`;
        }
    });

    document.getElementById("modalTotal").innerText = total.toFixed(2);
    document.getElementById("modal").style.display = "flex";
}

window.fecharCarrinho = function () {
    document.getElementById("modal").style.display = "none";
}

// ========== FINALIZAR PEDIDO ==========

window.enviarWhatsApp = async function () {
    const pagamentoEl = document.querySelector('input[name="pagamento"]:checked');
    if (!pagamentoEl) return alert("Selecione a forma de pagamento");

    const pagamento = pagamentoEl.value.toLowerCase().replace('cartão', 'credito'); // simples map

    // Obter Itens
    const itensVenda = [];
    const itensMsg = [];
    let total = 0;

    Object.entries(carrinho).forEach(([id, qty]) => {
        const p = produtosData.find(prod => prod._id === id);
        if (p && qty > 0) {
            total += p.preco * qty;
            itensVenda.push({
                produto: p._id,
                nome: p.nome,
                preco: p.preco,
                quantidade: qty
            });
            itensMsg.push(`• ${p.nome} x${qty}`);
        }
    });

    // 1. Salvar no Banco de Dados
    try {
        const response = await fetch('/api/sales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clienteId: null, // Venda anônima pelo site
                produtos: itensVenda,
                pagamento: pagamento,
                total: total,
                status: 'concluida'
            })
        });

        if (!response.ok) throw new Error('Falha ao registrar pedido');

        const venda = await response.json();
        console.log("Venda registrada:", venda);

        // 2. Enviar WhatsApp
        let msg = `*Pedido - ${CONFIG.nomeEmpresa}*\n\n`;
        msg += itensMsg.join("\n");
        msg += `\n\n💰 Total: R$ ${total.toFixed(2)}`;
        msg += `\n💳 Pagamento: ${pagamentoEl.value}`;

        if (pagamentoEl.value === "Dinheiro") {
            const troco = document.getElementById("troco").value;
            if (troco) msg += `\n💵 Troco para: R$ ${parseFloat(troco).toFixed(2)}`;
        }

        const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
        
        // Limpar carrinho e sinalizar conclusão antes de redirecionar
        carrinho = {};
        localStorage.removeItem("carrinho");
        localStorage.setItem("vendaConcluida", "true");
        
        // Atualiza a interface antes de sair (caso o usuário volte)
        document.querySelectorAll('[id^="qty-"]').forEach(el => el.textContent = '0');
        atualizarTotal();
        fecharCarrinho();

        // Redirecionamento limpo para evitar bloqueio de pop-up
        window.location.href = url;

    } catch (error) {
        console.error(error);
        alert("Erro ao registrar pedido. Tente novamente.");
    }
}

// Inicializa
document.addEventListener("DOMContentLoaded", init);

// Helper para troco
document.addEventListener("change", (e) => {
    if (e.target.name === "pagamento") {
        const pag = document.querySelector('input[name="pagamento"]:checked');
        const trocoBox = document.getElementById("trocoBox");
        if (pag && pag.value === "Dinheiro") {
            trocoBox.style.display = "block";
        } else {
            trocoBox.style.display = "none";
        }
    }
});
