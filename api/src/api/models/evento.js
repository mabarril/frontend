const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Evento = sequelize.define('Evento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  data_inicio: {
    type: DataTypes.DATE,
    allowNull: false
  },
  data_fim: {
    type: DataTypes.DATE,
    allowNull: false
  },
  local: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  capacidade_maxima: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('planejado', 'inscricoes_abertas', 'em_andamento', 'concluido'),
    defaultValue: 'planejado'
  }
}, {
  tableName: 'eventos',
  timestamps: true,
  underscored: true
});

module.exports = Evento;
