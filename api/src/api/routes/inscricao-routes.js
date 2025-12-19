const express = require('express');
const router = express.Router();
const inscricaoController = require('../controllers/inscricao-controller');

// Rotas para inscrições
router.post('/', inscricaoController.createInscricao);
router.get('/', inscricaoController.getAllInscricoes);
router.get('/evento/:eventoId', inscricaoController.getInscricoesByEvento);
router.get('/casal/:casalId', inscricaoController.getInscricoesByCasal);
router.get('/:id', inscricaoController.getInscricaoById);
router.put('/:id', inscricaoController.updateInscricao);
router.put('/:id/cancelar', inscricaoController.cancelarInscricao);
router.delete('/:id', inscricaoController.deleteInscricao);

module.exports = router;
