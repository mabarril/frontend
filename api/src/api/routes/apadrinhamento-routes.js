const express = require('express');
const router = express.Router();
const apadrinhamentoController = require('../controllers/apadrinhamento-controller');

// Rotas para apadrinhamentos
router.post('/', apadrinhamentoController.createApadrinhamento);
router.get('/inscricao/:inscricaoId', apadrinhamentoController.getApadrinhamentosByInscricao);
router.get('/padrinho/:casalId', apadrinhamentoController.getApadrinhamentosByPadrinho);
router.get('/:id', apadrinhamentoController.getApadrinhamentoById);
router.delete('/:id', apadrinhamentoController.deleteApadrinhamento);

module.exports = router;
