import { connectDB, Client } from './_shared/db.js';

export default async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        await connectDB();

        const { id } = req.query;

        if (req.method === 'GET') {
            const clients = await Client.find().sort({ createdAt: -1 });
            return res.status(200).json(clients);
        }

        if (req.method === 'POST') {
            const data = req.body;
            if (!data.nome || !data.telefone) {
                return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
            }
            const client = new Client(data);
            await client.save();
            return res.status(201).json(client);
        }

        if (req.method === 'PUT' && id) {
            const client = await Client.findByIdAndUpdate(id, req.body, { new: true });
            if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
            return res.status(200).json(client);
        }

        if (req.method === 'DELETE' && id) {
            const result = await Client.findByIdAndDelete(id);
            if (!result) return res.status(404).json({ error: 'Cliente não encontrado' });
            return res.status(200).json({ message: 'Cliente removido' });
        }

        return res.status(405).json({ error: 'Método não permitido' });

    } catch (error) {
        console.error('Erro em clients:', error);
        return res.status(500).json({ error: error.message });
    }
};
