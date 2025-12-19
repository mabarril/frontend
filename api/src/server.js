const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: '../.env' });

// Importar rotas
const authRoutes = require('./api/routes/auth-routes');
const casalRoutes = require('./api/routes/casal-routes');
const inscricaoRoutes = require('./api/routes/inscricao-routes');
const urlUnicaRoutes = require('./api/routes/url-unica-routes');
const apadrinhamentoRoutes = require('./api/routes/apadrinhamento-routes');
const eventoRoutes = require('./api/routes/evento-routes');



// Inicializar o app Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/casais', casalRoutes);
app.use('/api/inscricoes', inscricaoRoutes);
app.use('/api/urls-unicas', urlUnicaRoutes);
app.use('/api/apadrinhamentos', apadrinhamentoRoutes);
app.use('/api/eventos', eventoRoutes);


// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Administração ECC está funcionando!' });
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
