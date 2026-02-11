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
      const data = req.body || {};
      if (!data.nome || String(data.nome).trim().length < 2) {
        return res.status(400).json({ error: 'Nome e obrigatorio' });
      }

      const nome = String(data.nome).trim();
      const telefoneRaw = String(data.telefone || '').trim();
      const telefone = telefoneRaw || 'Nao informado';
      const endereco = String(data.endereco || '').trim();
      const email = String(data.email || '').trim();

      let existingClient = null;
      if (telefone !== 'Nao informado') {
        existingClient = await Client.findOne({ telefone });
      } else if (endereco) {
        existingClient = await Client.findOne({ nome, endereco });
      } else {
        existingClient = await Client.findOne({ nome, telefone: 'Nao informado' });
      }

      if (existingClient) {
        existingClient.nome = nome;
        existingClient.telefone = telefone;
        existingClient.endereco = endereco || existingClient.endereco || '';
        existingClient.email = email || existingClient.email || '';
        await existingClient.save();
        return res.status(200).json(existingClient);
      }

      const client = new Client({
        nome,
        telefone,
        endereco,
        email
      });
      await client.save();
      return res.status(201).json(client);
    }

    if (req.method === 'PUT' && id) {
      const client = await Client.findByIdAndUpdate(id, req.body, { new: true });
      if (!client) return res.status(404).json({ error: 'Cliente nao encontrado' });
      return res.status(200).json(client);
    }

    if (req.method === 'DELETE' && id) {
      const result = await Client.findByIdAndDelete(id);
      if (!result) return res.status(404).json({ error: 'Cliente nao encontrado' });
      return res.status(200).json({ message: 'Cliente removido' });
    }

    return res.status(405).json({ error: 'Metodo nao permitido' });
  } catch (error) {
    console.error('Erro em clients:', error);
    return res.status(500).json({ error: error.message });
  }
};
