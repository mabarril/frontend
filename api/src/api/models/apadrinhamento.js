const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Inscricao = require('./inscricao');
const Casal = require('./casal');

const Apadrinhamento = sequelize.define('Apadrinhamento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inscricao_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Inscricao,
      key: 'id'
    }
  },
  casal_padrinho_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Casal,
      key: 'id'
    }
  }
}, {
  tableName: 'apadrinhamentos',
  timestamps: true,
  underscored: true
});

// Definir associações
Apadrinhamento.belongsTo(Inscricao, { foreignKey: 'inscricao_id', as: 'inscricao' });
Apadrinhamento.belongsTo(Casal, { foreignKey: 'casal_padrinho_id', as: 'casal_padrinho' });

Inscricao.hasMany(Apadrinhamento, { foreignKey: 'inscricao_id', as: 'apadrinhamentos' });
Casal.hasMany(Apadrinhamento, { foreignKey: 'casal_padrinho_id', as: 'apadrinhamentos_como_padrinho' });

module.exports = Apadrinhamento;
