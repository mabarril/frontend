const Casal = require('../models/casal');
const Pessoa = require('../models/pessoa');
const Filho = require('../models/filho');
const e = require('express');



// Criar um novo casal com pessoas e filhos
exports.createCasal = async (req, res) => {
  try {
    // const { casal, pessoas, filhos } = req.body;

    console.log('Dados recebidos para criar casal:', req.body);
    const { casal = {}, pessoas = [], filhos = [] } = req.body; 
    
    // Criar o casal
    console.log('Criando casal:', casal);
    const novoCasal = await Casal.create(casal);

    // Criar as pessoas associadas ao casal
    if (pessoas && pessoas.length > 0) {
      for (const pessoa of pessoas) {
        pessoa.casal_id = novoCasal.id;
        await Pessoa.create(pessoa);
      }
    }

    // Criar os filhos associados ao casal
    if (filhos && filhos.length > 0) {
      for (const filho of filhos) {
        filho.casal_id = novoCasal.id;
        await Filho.create(filho);
      }
    }

    // Buscar o casal completo com pessoas e filhos
    const casalCompleto = await Casal.findByPk(novoCasal.id, {
      include: [
        { model: Pessoa, as: 'pessoas' },
        { model: Filho, as: 'filhos' }
      ]
    });

    if (res) {
      res.status(201).json(casalCompleto);
    } else {
      return casalCompleto.id;
    }
  } catch (error) {
    console.error('Erro ao criar casal:', error);
    res.status(500).json({ message: 'Erro ao criar casal', error: error.message });
  }
};

// Obter todos os casais
exports.getAllCasais = async (req, res) => {
  try {
    const casais = await Casal.findAll({
      include: [
        { model: Pessoa, as: 'pessoas' }
      ],
      where: {
        deleted_at: null
      }
    });

    res.status(200).json(casais);
  } catch (error) {
    console.error('Erro ao buscar casais:', error);
    res.status(500).json({ message: 'Erro ao buscar casais', error: error.message });
  }
};

// Obter um casal pelo ID
exports.getCasalById = async (req, res) => {
  try {

    const { id } = req.params;
    const casal = await Casal.findByPk(id, {
      include: [
        { model: Pessoa, as: 'pessoas' },
        { model: Filho, as: 'filhos' }
      ]
    });

    if (!casal) {
      return res.status(404).json({ message: 'Casal não encontrado' });
    }
    res.status(200).json(casal);
  } catch (error) {
    console.error('Erro ao buscar casal:', error);
    res.status(500).json({ message: 'Erro ao buscar casal', error: error.message });
  }
};

// Atualizar um casal
exports.updateCasal = async (req, res) => {
  try {
    const { id } = req.params;
    const { casal, pessoas, filhos } = req.body;

    // Verificar se o casal existe
    const casalExistente = await Casal.findByPk(id);
    if (!casalExistente) {
      return res.status(404).json({ message: 'Casal não encontrado' });
    }

    // Atualizar dados do casal
    await Casal.update(casal, { where: { id } });

    // Atualizar pessoas
    if (pessoas && pessoas.length > 0) {
      for (const pessoa of pessoas) {
        if (pessoa.id) {
          // Atualizar pessoa existente
          await Pessoa.update(pessoa, { where: { id: pessoa.id, casal_id: id } });
        } else {
          // Criar nova pessoa
          pessoa.casal_id = id;
          await Pessoa.create(pessoa);
        }
      }
    }

    // Atualizar filhos
    if (filhos && filhos.length > 0) {
      for (const filho of filhos) {
        if (filho.id) {
          // Atualizar filho existente
          await Filho.update(filho, { where: { id: filho.id, casal_id: id } });
        } else {
          // Criar novo filho
          filho.casal_id = id;
          await Filho.create(filho);
        }
      }
    }

    // Buscar o casal atualizado
    const casalAtualizado = await Casal.findByPk(id, {
      include: [
        { model: Pessoa, as: 'pessoas' },
        { model: Filho, as: 'filhos' }
      ]
    });

    res.status(200).json(casalAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar casal:', error);
    res.status(500).json({ message: 'Erro ao atualizar casal', error: error.message });
  }
};

// Excluir um casal (soft delete)
exports.deleteCasal = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o casal existe
    const casal = await Casal.findByPk(id);
    if (!casal) {
      return res.status(404).json({ message: 'Casal não encontrado' });
    }

    // Realizar soft delete
    await Casal.update(
      { deleted_at: new Date() },
      { where: { id } }
    );

    res.status(200).json({ message: 'Casal excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir casal:', error);
    res.status(500).json({ message: 'Erro ao excluir casal', error: error.message });
  }
};
