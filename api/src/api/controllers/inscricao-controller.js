const Inscricao = require('../models/inscricao');
const Casal = require('../models/casal');
const Evento = require('../models/evento');
const UrlUnica = require('../models/url-unica');
const crypto = require('crypto');

// Gerar token único para URL pp
const gerarToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Criar uma nova inscrição com URL única
exports.createInscricao = async (req, res) => {
  try {
    
    
    const inscricao = req.body;
    const gerar_url = 'true'; // Verifica se a URL deve ser gerada
    console.log('Dados recebidos para criar inscrição:', inscricao);

    // // Verificar se o casal existe
    // const casal = await Casal.findByPk(inscricao.casal_id);
    // if (!casal) {
    //   return res.status(404).json({ message: 'Casal não encontrado' });
    // }
    
    // Verificar se o evento existe
    const evento = await Evento.findByPk(inscricao.evento_id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    
    // Verificar se já existe inscrição para este casal neste evento
    const inscricaoExistente = await Inscricao.findOne({
      where: {
        casal_id: inscricao.casal_id,
        evento_id: inscricao.evento_id
      }
    });
    
    if (inscricaoExistente) {
      return res.status(400).json({ message: 'Este casal já está inscrito neste evento' });
    }
    
    // Criar a inscrição
    const novaInscricao = await Inscricao.create(inscricao);
    console.log('Nova inscrição criada:', novaInscricao.id);
    
    // Gerar URL única se solicitado
    if (gerar_url) {
      // Calcular data de validade (até o final do evento)
      const validoAte = evento.data_fim;
      
      // Criar URL única
      await UrlUnica.create({
        inscricao_id: novaInscricao.id,
        token: gerarToken(),
        valido_ate: validoAte
      });
    }
    
    // Buscar a inscrição completa com URL única
    const inscricaoCompleta = await Inscricao.findByPk(novaInscricao.id, {
      include: [
        { model: Casal, as: 'casal' },
        { model: Evento, as: 'evento' },
        { model: UrlUnica, as: 'url_unica' }
      ]
    });
    
    res.status(201).json(inscricaoCompleta);
  } catch (error) {
    console.error('Erro ao criar inscrição:', error);
    res.status(500).json({ message: 'Erro ao criar inscrição', error: error.message });
  }
};

// Obter todas as inscrições
exports.getAllInscricoes = async (req, res) => {
  try {
    const inscricoes = await Inscricao.findAll({
      include: [
        { model: Casal, as: 'casal' },
        { model: Evento, as: 'evento' },
        { model: UrlUnica, as: 'url_unica' }
      ]
    });
    
    res.status(200).json(inscricoes);
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error);
    res.status(500).json({ message: 'Erro ao buscar inscrições', error: error.message });
  }
};

// Obter inscrições por evento
exports.getInscricoesByEvento = async (req, res) => {
  try {
    const { eventoId } = req.params;
    
    const inscricoes = await Inscricao.findAll({
      where: { evento_id: eventoId },
      include: [
        { model: Casal, as: 'casal' },
        { model: UrlUnica, as: 'url_unica' }
      ]
    });
    
    res.status(200).json(inscricoes);
  } catch (error) {
    console.error('Erro ao buscar inscrições por evento:', error);
    res.status(500).json({ message: 'Erro ao buscar inscrições por evento', error: error.message });
  }
};

// Obter inscrições por casal
exports.getInscricoesByCasal = async (req, res) => {
  try {
    const { casalId } = req.params;
    
    const inscricoes = await Inscricao.findAll({
      where: { casal_id: casalId },
      include: [
        { model: Evento, as: 'evento' },
        { model: UrlUnica, as: 'url_unica' }
      ]
    });
    
    res.status(200).json(inscricoes);
  } catch (error) {
    console.error('Erro ao buscar inscrições por casal:', error);
    res.status(500).json({ message: 'Erro ao buscar inscrições por casal', error: error.message });
  }
};

// Obter uma inscrição pelo ID
exports.getInscricaoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const inscricao = await Inscricao.findByPk(id, {
      include: [
        { model: Casal, as: 'casal' },
        { model: Evento, as: 'evento' },
        { model: Casal, as: 'casal_padrinho' },
        { model: UrlUnica, as: 'url_unica' }
      ]
    });
    
    if (!inscricao) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    
    res.status(200).json(inscricao);
  } catch (error) {
    console.error('Erro ao buscar inscrição:', error);
    res.status(500).json({ message: 'Erro ao buscar inscrição', error: error.message });
  }
};

// Atualizar uma inscrição
exports.updateInscricao = async (req, res) => {
  try {
    const { id } = req.params;
    const { inscricao, gerar_url } = req.body;
    
    // Verificar se a inscrição existe
    const inscricaoExistente = await Inscricao.findByPk(id);
    if (!inscricaoExistente) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    
    // Atualizar dados da inscrição
    await Inscricao.update(inscricao, { where: { id } });
    
    // Gerar URL única se solicitado e não existir
    if (gerar_url) {
      const urlExistente = await UrlUnica.findOne({ where: { inscricao_id: id } });
      
      if (!urlExistente) {
        // Buscar o evento para definir a data de validade
        const evento = await Evento.findByPk(inscricaoExistente.evento_id);
        
        // Criar URL única
        await UrlUnica.create({
          inscricao_id: id,
          token: gerarToken(),
          valido_ate: evento.data_fim
        });
      }
    }
    
    // Buscar a inscrição atualizada
    const inscricaoAtualizada = await Inscricao.findByPk(id, {
      include: [
        { model: Casal, as: 'casal' },
        { model: Evento, as: 'evento' },
        { model: Casal, as: 'casal_padrinho' },
        { model: UrlUnica, as: 'url_unica' }
      ]
    });
    
    res.status(200).json(inscricaoAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar inscrição:', error);
    res.status(500).json({ message: 'Erro ao atualizar inscrição', error: error.message });
  }
};

// Cancelar uma inscrição
exports.cancelarInscricao = async (req, res) => {
  try {
    const { id } = req.params;
    const { data_desistencia, valor_devolvido, observacoes } = req.body;
    
    // Verificar se a inscrição existe
    const inscricao = await Inscricao.findByPk(id);
    if (!inscricao) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    
    // Atualizar status para cancelada
    await Inscricao.update({
      status: 'cancelada',
      data_desistencia: data_desistencia || new Date(),
      valor_devolvido,
      observacoes
    }, { where: { id } });
    
    // Buscar a inscrição atualizada
    const inscricaoAtualizada = await Inscricao.findByPk(id, {
      include: [
        { model: Casal, as: 'casal' },
        { model: Evento, as: 'evento' }
      ]
    });
    
    res.status(200).json(inscricaoAtualizada);
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    res.status(500).json({ message: 'Erro ao cancelar inscrição', error: error.message });
  }
};

// Excluir uma inscrição
exports.deleteInscricao = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a inscrição existe
    const inscricao = await Inscricao.findByPk(id);
    if (!inscricao) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }
    
    // Excluir a inscrição (e sua URL única em cascata)
    // await Casal.destroy({ where: { id: inscricao.casal_id } });
    await UrlUnica.destroy({ where: { inscricao_id: id } });
    await Inscricao.destroy({ where: { id } });
    
    res.status(200).json({ message: 'Inscrição excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir inscrição:', error);
    res.status(500).json({ message: 'Erro ao excluir inscrição', error: error.message });
  }
};
