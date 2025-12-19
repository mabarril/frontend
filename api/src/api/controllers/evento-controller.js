const Evento = require('../models/evento');
const RegraDevolucao = require('../models/regra-devolucao');

// Criar um novo evento com regras de devolução
exports.createEvento = async (req, res) => {
  try {
    const { evento, regras_devolucao } = req.body;
    
    // Criar o evento
    const novoEvento = await Evento.create(evento);
    
    // Criar as regras de devolução associadas ao evento
    if (regras_devolucao && regras_devolucao.length > 0) {
      for (const regra of regras_devolucao) {
        regra.evento_id = novoEvento.id;
        await RegraDevolucao.create(regra);
      }
    }
    
    // Buscar o evento completo com regras de devolução
    const eventoCompleto = await Evento.findByPk(novoEvento.id, {
      include: [
        { model: RegraDevolucao, as: 'regras_devolucao' }
      ]
    });
    
    res.status(201).json(eventoCompleto);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
  }
};

// Obter todos os eventos
exports.getAllEventos = async (req, res) => {
  try {
    const eventos = await Evento.findAll({
      include: [
        { model: RegraDevolucao, as: 'regras_devolucao' }
      ]
    });
    
    res.status(200).json(eventos);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ message: 'Erro ao buscar eventos', error: error.message });
  }
};

// Obter um evento pelo ID
exports.getEventoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const evento = await Evento.findByPk(id, {
      include: [
        { model: RegraDevolucao, as: 'regras_devolucao' }
      ]
    });
    
    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    
    res.status(200).json(evento);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    res.status(500).json({ message: 'Erro ao buscar evento', error: error.message });
  }
};

// Atualizar um evento
exports.updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { evento, regras_devolucao } = req.body;
    
    // Verificar se o evento existe
    const eventoExistente = await Evento.findByPk(id);
    if (!eventoExistente) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    
    // Atualizar dados do evento
    await Evento.update(evento, { where: { id } });
    
    // Atualizar regras de devolução
    if (regras_devolucao && regras_devolucao.length > 0) {
      for (const regra of regras_devolucao) {
        if (regra.id) {
          // Atualizar regra existente
          await RegraDevolucao.update(regra, { where: { id: regra.id, evento_id: id } });
        } else {
          // Criar nova regra
          regra.evento_id = id;
          await RegraDevolucao.create(regra);
        }
      }
    }
    
    // Buscar o evento atualizado
    const eventoAtualizado = await Evento.findByPk(id, {
      include: [
        { model: RegraDevolucao, as: 'regras_devolucao' }
      ]
    });
    
    res.status(200).json(eventoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ message: 'Erro ao atualizar evento', error: error.message });
  }
};

// Excluir um evento
exports.deleteEvento = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se o evento existe
    const evento = await Evento.findByPk(id);
    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }
    
    // Excluir o evento (e suas regras de devolução em cascata)
    await Evento.destroy({ where: { id } });
    
    res.status(200).json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    res.status(500).json({ message: 'Erro ao excluir evento', error: error.message });
  }
};
