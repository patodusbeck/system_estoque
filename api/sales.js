import { connectDB, Sale, Client } from './_shared/db.js';

export default async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectDB();

        const { id } = req.query;

        if (req.method === 'GET') {
            const sales = await Sale.find()
                .populate('cliente', 'nome telefone')
                .sort({ data: -1 })
                .limit(100);
            return res.status(200).json(sales);
        }

        if (req.method === 'POST') {
            const { clienteId, produtos, pagamento, total, subtotal, discountAmount, couponCode, status } = req.body;

            if (!produtos || produtos.length === 0) {
                return res.status(400).json({ error: 'Produtos são obrigatórios' });
            }

            if (!pagamento) {
                return res.status(400).json({ error: 'Forma de pagamento é obrigatória' });
            }

            let clienteNome = 'Cliente Balcão';
            if (clienteId) {
                const client = await Client.findById(clienteId);
                if (client) clienteNome = client.nome;
            }

            const sale = new Sale({
                cliente: clienteId || null,
                clienteNome,
                produtos,
                subtotal: Number(subtotal || total || 0),
                discountAmount: Number(discountAmount || 0),
                couponCode: String(couponCode || '').trim().toUpperCase(),
                pagamento,
                total: Number(total || 0),
                status: status || 'concluida'
            });

            await sale.save();
            return res.status(201).json(sale);
        }

        if (req.method === 'PUT' && id) {
            const sale = await Sale.findByIdAndUpdate(id, req.body, { new: true });
            if (!sale) return res.status(404).json({ error: 'Venda não encontrada' });
            return res.status(200).json(sale);
        }

        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        console.error('Erro em sales:', error);
        return res.status(500).json({ error: error.message });
    }
};
