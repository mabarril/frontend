const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const authController = {
  // Login do usuário
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // Validar dados de entrada
      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário por email
      const usuario = await Usuario.findOne({ where: { email } });
      
      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verificar se o usuário está ativo
      if (!usuario.ativo) {
        return res.status(401).json({
          success: false,
          message: 'Usuário inativo'
        });
      }

      // Verificar senha
      const senhaValida = await usuario.verificarSenha(senha);
      
      if (!senhaValida) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: usuario.id, 
          email: usuario.email,
          nome: usuario.nome 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Atualizar último login
      await usuario.atualizarUltimoLogin();

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            ultimo_login: usuario.ultimo_login
          }
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Verificar token
  verificarToken: async (req, res) => {
    try {
      const usuario = req.usuario; // Vem do middleware de autenticação

      res.json({
        success: true,
        data: {
          usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            ultimo_login: usuario.ultimo_login
          }
        }
      });

    } catch (error) {
      console.error('Erro na verificação do token:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  },

  // Logout (invalidar token no frontend)
  logout: async (req, res) => {
    try {
      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
};

module.exports = authController;

