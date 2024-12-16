const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const dbFile = path.join(__dirname, 'db.json');

// Middleware para processar JSON
app.use(bodyParser.json());

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'InterfaceUsuario')));

const getDatabase = () => {
    if (!fs.existsSync(dbFile)) {
        fs.writeFileSync(dbFile, JSON.stringify({ users: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(dbFile, 'utf8'));
};

const saveDatabase = (data) => {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
};

// Redirecionar rota base "/" para "Index.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'InterfaceUsuario', 'Index.html'));
});

// Rota para registrar usuários
app.post('/users', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const db = getDatabase();
    const userExists = db.users.some(user => user.username === username);

    if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe.' });
    }

    db.users.push({ username, password });
    saveDatabase(db);

    res.status(201).json({ message: 'Usuário registrado com sucesso!', username });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});