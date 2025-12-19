const express = require('express');
const router = express.Router();
const casalController = require('../controllers/casal-controller');

// Rotas para casais
router.post('/', casalController.createCasal);
router.get('/', casalController.getAllCasais);
router.get('/:id', casalController.getCasalById);
router.put('/:id', casalController.updateCasal);
router.delete('/:id', casalController.deleteCasal);

module.exports = router;
