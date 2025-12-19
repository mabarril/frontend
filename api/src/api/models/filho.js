const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Casal = require('./casal');

const Filho = sequelize.define('Filho', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  casal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Casal,
      key: 'id'
    }
  },
  nome_completo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  }
}, {
  tableName: 'filhos',
  timestamps: true,
  underscored: false
});

// Definir associação
Filho.belongsTo(Casal, { foreignKey: 'casal_id', as: 'casal' });
Casal.hasMany(Filho, { foreignKey: 'casal_id', as: 'filhos' });

module.exports = Filho;
