// src/api/routes/url-unica-routes.js
const express = require('express');
const router = express.Router();
const urlUnicaController = require('../controllers/url-unica-controller');
const auth = require('../middlewares/auth');

// Rota pública para validar token
router.get('/token/:token', urlUnicaController.validarToken);

// Rotas protegidas (apenas admin)
router.get('/', auth, urlUnicaController.listarUrlsUnicas);

router.post('/', auth, urlUnicaController.criarUrlUnica);

// Nova rota para gerar URL para convidado
router.post('/gerar-convite', auth, urlUnicaController.gerarUrlParaConvidado);

router.put('/:id/renovar', auth, urlUnicaController.renovarUrlUnica);

router.post('/:id/enviar', auth, urlUnicaController.enviarUrlUnica);

router.get('/inscricao/:inscricao_id', urlUnicaController.obterUrlPorInscricao);

module.exports = router;
