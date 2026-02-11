import bcrypt from 'bcryptjs';
import { connectDB, User } from './_shared/db.js';

async function seedAdmin() {
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin@espetaria', 10);
        await User.create({
            username: 'admin',
            password: hashedPassword,
            name: 'Administrador',
            role: 'admin'
        });
        console.log('👤 Usuário Admin criado com senha hasheada');
    }
}

export default async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        await connectDB();
        await seedAdmin();

        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
        }

        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Usuário ou senha incorretos' });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
};
