const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth-controller');
const auth = require('../middlewares/auth');

// Rota de login (pública)
router.post('/login', authController.login);

// Rota de logout (protegida)
router.post('/logout', auth, authController.logout);

// Rota para verificar token (protegida)
router.get('/verificar', auth, authController.verificarToken);

module.exports = router;

