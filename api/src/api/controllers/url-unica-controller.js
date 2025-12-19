// src/api/controllers/url-unica-controller.js
const Casal = require('../models/casal');
const Evento = require('../models/evento');
const Inscricao = require('../models/inscricao'); 
const UrlUnica = require('../models/url-unica');
const CasalController = require('../controllers/casal-controller');
const crypto = require('crypto');
const e = require('express');

// Gerar token único
const gerarToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Gerar URL única para convidado (protegida - apenas admin)
exports.gerarUrlParaConvidado = async (req, res) => {
  try {
    const { padrinho_id, evento_id } = req.body;

    console.log('validar dados obrigatorios');
    // Validar dados obrigatórios
    if (!padrinho_id || !evento_id) {
      return res.status(400).json({
        success: false,
        message: 'Padrinho, evento são obrigatórios'
      });
    }

  
    // Verificar se o Padrinho existe
    const casal = await Casal.findByPk(padrinho_id);
    if (!casal) {
      return res.status(404).json({
        success: false,
        message: 'Padrinho não encontrado'
      });
    }

    const evento = await Evento.findByPk(evento_id);
    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'Evento não encontrado'
      });
    }

    // Criar casal convidado 
    console.log('Criar casal convidado');
    const casal_id = await CasalController.createCasal();
    


    // Se não existe, criar uma nova inscrição como convidado
      inscricao = await Inscricao.create({
        casal_id,
        evento_id,
        padrinho_id,
        tipo_participante: 'convidado',
        status: 'pendente'
      });

    // Verificar se já existe uma URL única para esta inscrição
    let urlUnica = await UrlUnica.findOne({ where: { inscricao_id: inscricao.id } });

    console.log(urlUnica);
    
    if (urlUnica) {
      // Se existe, renovar a validade
      const valido_ate = new Date();
      valido_ate.setDate(valido_ate.getDate() + 30);
      
      await urlUnica.update({
        valido_ate,
        token: gerarToken() // Gerar novo token
      });
    } else {
      // Se não existe, criar nova URL única
      const valido_ate = new Date();
      valido_ate.setDate(valido_ate.getDate() + 30);
      
      urlUnica = await UrlUnica.create({
        inscricao_id: inscricao.id,
        token: gerarToken(),
        valido_ate
      });
    }

    // Construir URL completa
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const urlCompleta = `${baseUrl}/inscricao/${urlUnica.token}`;
    console.log('URL completa: ', urlCompleta);


    // // Simular envio de email
    // const emailSimulado = {
    //   para: email_destino,
    //   assunto: `Convite para ${evento.nome}`,
    //   conteudo: mensagem_personalizada || `Você foi convidado para participar do evento ${evento.nome}. Acesse o link para confirmar sua inscrição: ${urlCompleta}`,
    //   url: urlCompleta,
    //   data_envio: new Date(),
    //   token: urlUnica.token
    // };

    res.status(201).json({
      success: true,
      message: 'URL única gerada e convite enviado com sucesso',
      data: {
        inscricao,
        urlUnica,
        urlCompleta
      }
    });

  } catch (error) {
    console.error('Erro ao gerar URL para convidado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar URL para convidado',
      error: error.message
    });
  }
};

// Listar todas as URLs únicas (apenas admin)
exports.listarUrlsUnicas = async (req, res) => {
  try {
    const urlsUnicas = await UrlUnica.findAll({
      include: [
        {
          model: Inscricao,
          include: [
            { model: Casal },
            { model: Evento }
          ]
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: urlsUnicas
    });
  } catch (error) {
    console.error('Erro ao listar URLs únicas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar URLs únicas',
      error: error.message
    });
  }
};

// Criar nova URL única para convidado
exports.criarUrlUnica = async (req, res) => {
  try {
    const { inscricao_id, validade_dias } = req.body;

    // Verificar se a inscrição existe
    const inscricao = await Inscricao.findByPk(inscricao_id);
    if (!inscricao) {
      return res.status(404).json({
        success: false,
        message: 'Inscrição não encontrada'
      });
    }

    // Verificar se já existe uma URL única para esta inscrição
    const urlExistente = await UrlUnica.findOne({ where: { inscricao_id } });
    if (urlExistente) {
      return res.status(409).json({
        success: false,
        message: 'Já existe uma URL única para esta inscrição',
        data: urlExistente
      });
    }

    // Calcular data de validade
    const dias = validade_dias || 30; // Padrão: 30 dias
    const valido_ate = new Date();
    valido_ate.setDate(valido_ate.getDate() + dias);

    // Gerar token único
    const token = gerarToken();

    // Criar URL única
    const urlUnica = await UrlUnica.create({
      inscricao_id,
      token,
      valido_ate
    });

    res.status(201).json({
      success: true,
      message: 'URL única criada com sucesso',
      data: urlUnica
    });
  } catch (error) {
    console.error('Erro ao criar URL única:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar URL única',
      error: error.message
    });
  }
};

// Validar token da URL única (público)
exports.validarToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar URL única pelo token
    const urlUnica = await UrlUnica.findOne({ 
      where: { token },
      include: [
        {
          model: Inscricao, as: 'inscricao',
          include: [
            { model: Evento, as: 'evento' },
            { model: Casal, as: 'casal'}
          ]
        }
      ]
    });


    // Verificar se a URL existe
    if (!urlUnica) {
      return res.status(404).json({
        success: false,
        message: 'URL inválida ou não encontrada'
      });
    }

    // Verificar se a URL não expirou
    const agora = new Date();
    if (agora > urlUnica.valido_ate) {
      return res.status(401).json({
        success: false,
        message: 'URL expirada'
      });
    }

    // Retornar dados básicos da inscrição (sem informações sensíveis)
    const dadosInscrição = {
      evento: urlUnica.inscricao.evento.nome,
      evento_id: urlUnica.inscricao.evento.id,
      data_evento: urlUnica.inscricao.evento.data_inicio,
      tipo_participante: urlUnica.inscricao.tipo_participante,
      casal_id: urlUnica.inscricao.casal_id,
      padrinho_id: urlUnica.inscricao.padrinho_id,
      token: urlUnica.token
    };

    res.status(200).json({
      success: true,
      message: 'Token válido',
      data: dadosInscrição
    });
  } catch (error) {
    console.error('Erro ao validar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao validar token',
      error: error.message
    });
  }
};

// Renovar URL única
exports.renovarUrlUnica = async (req, res) => {
  try {
    const { id } = req.params;
    const { validade_dias } = req.body;

    // Buscar URL única
    const urlUnica = await UrlUnica.findByPk(id);
    if (!urlUnica) {
      return res.status(404).json({
        success: false,
        message: 'URL única não encontrada'
      });
    }

    // Calcular nova data de validade
    const dias = validade_dias || 30; // Padrão: 30 dias
    const valido_ate = new Date();
    valido_ate.setDate(valido_ate.getDate() + dias);

    // Atualizar URL única
    await urlUnica.update({
      valido_ate,
      token: gerarToken() // Gerar novo token
    });

    res.status(200).json({
      success: true,
      message: 'URL única renovada com sucesso',
      data: urlUnica
    });
  } catch (error) {
    console.error('Erro ao renovar URL única:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao renovar URL única',
      error: error.message
    });
  }
};

// Enviar URL única por email (simulado)
exports.enviarUrlUnica = async (req, res) => {
  try {
    const { id } = req.params;
    const { email_destino, mensagem_personalizada } = req.body;

    // Validar email
    if (!email_destino || !email_destino.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Email de destino inválido'
      });
    }

    // Buscar URL única
    const urlUnica = await UrlUnica.findByPk(id, {
      include: [
        {
          model: Inscricao,
          include: [
            { model: Evento },
            { model: Casal }
          ]
        }
      ]
    });

    if (!urlUnica) {
      return res.status(404).json({
        success: false,
        message: 'URL única não encontrada'
      });
    }

    // Aqui seria implementado o envio real de email
    // Por enquanto, apenas simulamos o envio

    // Construir URL completa
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const urlCompleta = `${baseUrl}/inscricao?token=${urlUnica.token}`;

    // Dados do email simulado
    const emailSimulado = {
      para: email_destino,
      assunto: `Convite para ${urlUnica.Inscricao.Evento.nome}`,
      conteudo: mensagem_personalizada || `Você foi convidado para participar do evento ${urlUnica.Inscricao.Evento.nome}. Acesse o link para confirmar sua inscrição: ${urlCompleta}`,
      url: urlCompleta,
      data_envio: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Convite enviado com sucesso (simulado)',
      data: emailSimulado
    });
  } catch (error) {
    console.error('Erro ao enviar URL única:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar URL única',
      error: error.message
    });
  }
};

// Obter URL completa a partir do id da inscrição
exports.obterUrlPorInscricao = async (req, res) => {
  try {
    const { inscricao_id } = req.params;

    // Buscar URL única pela inscrição
    const urlUnica = await UrlUnica.findOne({ where: { inscricao_id } });

    if (!urlUnica) {
      return res.status(404).json({
        success: false,
        message: 'URL única não encontrada para esta inscrição'
      });
    }

    // Construir URL completa
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const urlCompleta = `${baseUrl}/inscricao/${urlUnica.token}`;

    res.status(200).json({
      success: true,
      urlCompleta
    });
  } catch (error) {
    console.error('Erro ao obter URL por inscrição:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter URL por inscrição',
      error: error.message
    });
  }
};
