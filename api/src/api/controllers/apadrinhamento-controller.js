const Apadrinhamento = require('../models/apadrinhamento');
const Inscricao = require('../models/inscricao');
const Casal = require('../models/casal');
const Evento = require('../models/evento');

// Criar um novo apadrinhamento
exports.createApadrinhamento = async (req, res) => {
  try {
    const { inscricao_id, casal_padrinho_id } = req.body;
    
    // Verificar se a inscrição existe
    const inscricao = await Inscricao.findByPk(inscricao_id);
    if (!inscricao) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    
    // Verificar se o casal padrinho existe
    const casalPadrinho = await Casal.findByPk(casal_padrinho_id);
    if (!casalPadrinho) {
      return res.status(404).json({ message: 'Casal padrinho não encontrado' });
    }
    
    // Verificar se o tipo de participante é convidado
    if (inscricao.tipo_participante !== 'convidado') {
      return res.status(400).json({ message: 'Apenas inscrições de convidados podem ter padrinhos' });
    }
    
    // Verificar se já existe este apadrinhamento
    const apadrinhamentoExistente = await Apadrinhamento.findOne({
      where: {
        inscricao_id,
        casal_padrinho_id
      }
    });
    
    if (apadrinhamentoExistente) {
      return res.status(400).json({ message: 'Este apadrinhamento já existe' });
    }
    
    // Criar o apadrinhamento
    const novoApadrinhamento = await Apadrinhamento.create({
      inscricao_id,
      casal_padrinho_id
    });
    
    // Buscar o apadrinhamento completo
    const apadrinhamentoCompleto = await Apadrinhamento.findByPk(novoApadrinhamento.id, {
      include: [
        { 
          model: Inscricao, 
          as: 'inscricao',
          include: [
            { model: Casal, as: 'casal' },
            { model: Evento, as: 'evento' }
          ]
        },
        { model: Casal, as: 'casal_padrinho' }
      ]
    });
    
    res.status(201).json(apadrinhamentoCompleto);
  } catch (error) {
    console.error('Erro ao criar apadrinhamento:', error);
    res.status(500).json({ message: 'Erro ao criar apadrinhamento', error: error.message });
  }
};

// Obter apadrinhamentos por inscrição
exports.getApadrinhamentosByInscricao = async (req, res) => {
  try {
    const { inscricaoId } = req.params;
    
    const apadrinhamentos = await Apadrinhamento.findAll({
      where: { inscricao_id: inscricaoId },
      include: [
        { model: Casal, as: 'casal_padrinho' }
      ]
    });
    
    res.status(200).json(apadrinhamentos);
  } catch (error) {
    console.error('Erro ao buscar apadrinhamentos por inscrição:', error);
    res.status(500).json({ message: 'Erro ao buscar apadrinhamentos por inscrição', error: error.message });
  }
};

// Obter apadrinhamentos por padrinho
exports.getApadrinhamentosByPadrinho = async (req, res) => {
  try {
    const { casalId } = req.params;
    
    const apadrinhamentos = await Apadrinhamento.findAll({
      where: { casal_padrinho_id: casalId },
      include: [
        { 
          model: Inscricao, 
          as: 'inscricao',
          include: [
            { model: Casal, as: 'casal' },
            { model: Evento, as: 'evento' }
          ]
        }
      ]
    });
    
    res.status(200).json(apadrinhamentos);
  } catch (error) {
    console.error('Erro ao buscar apadrinhamentos por padrinho:', error);
    res.status(500).json({ message: 'Erro ao buscar apadrinhamentos por padrinho', error: error.message });
  }
};

// Obter um apadrinhamento pelo ID
exports.getApadrinhamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const apadrinhamento = await Apadrinhamento.findByPk(id, {
      include: [
        { 
          model: Inscricao, 
          as: 'inscricao',
          include: [
            { model: Casal, as: 'casal' },
            { model: Evento, as: 'evento' }
          ]
        },
        { model: Casal, as: 'casal_padrinho' }
      ]
    });
    
    if (!apadrinhamento) {
      return res.status(404).json({ message: 'Apadrinhamento não encontrado' });
    }
    
    res.status(200).json(apadrinhamento);
  } catch (error) {
    console.error('Erro ao buscar apadrinhamento:', error);
    res.status(500).json({ message: 'Erro ao buscar apadrinhamento', error: error.message });
  }
};

// Excluir um apadrinhamento
exports.deleteApadrinhamento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o apadrinhamento existe
    const apadrinhamento = await Apadrinhamento.findByPk(id);
    if (!apadrinhamento) {
      return res.status(404).json({ message: 'Apadrinhamento não encontrado' });
    }
    
    // Excluir o apadrinhamento
    await Apadrinhamento.destroy({ where: { id } });
    
    res.status(200).json({ message: 'Apadrinhamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir apadrinhamento:', error);
    res.status(500).json({ message: 'Erro ao excluir apadrinhamento', error: error.message });
  }
};
