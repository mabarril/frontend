const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Inscricao = require('./inscricao');

const UrlUnica = sequelize.define('UrlUnica', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  inscricao_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Inscricao,
      key: 'id'
    }
  },
  token: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  valido_ate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'urls_unicas',
  timestamps: true,
  underscored: true
});

// Definir associação
UrlUnica.belongsTo(Inscricao, { foreignKey: 'inscricao_id', as: 'inscricao' });
Inscricao.hasOne(UrlUnica, { foreignKey: 'inscricao_id', as: 'url_unica' });

module.exports = UrlUnica;
