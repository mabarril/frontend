const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Evento = require('./evento');

const RegraDevolucao = sequelize.define('RegraDevolucao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  evento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Evento,
      key: 'id'
    }
  },
  data_limite: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  percentual_devolucao: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'regras_devolucao',
  timestamps: true,
  underscored: true
});

// Definir associação
RegraDevolucao.belongsTo(Evento, { foreignKey: 'evento_id', as: 'evento' });
Evento.hasMany(RegraDevolucao, { foreignKey: 'evento_id', as: 'regras_devolucao' });

module.exports = RegraDevolucao;
