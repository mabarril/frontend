const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Casal = sequelize.define('Casal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data_casamento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  endereco: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bairro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  cep: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  contato_emergencia_nome1: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contato_emergencia_telefone1: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  contato_emergencia_nome2: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  contato_emergencia_telefone2: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  responsavel_filhos_nome: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  responsavel_filhos_telefone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'casais',
  paranoid: true, // Habilita soft delete
  timestamps: true, // Habilita createdAt e updatedAt
  underscored: true
});

module.exports = Casal;
