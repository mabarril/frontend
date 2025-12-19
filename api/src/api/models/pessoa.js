const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Casal = require('./casal');

const Pessoa = sequelize.define('Pessoa', {
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
  tipo: {
    type: DataTypes.ENUM('esposo', 'esposa'),
    allowNull: false
  },
  nome_completo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nome_social: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  data_nascimento: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  profissao: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  celular: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  rg: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  rg_emissor: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true
  },
  problema_saude: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  problema_saude_descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  medicamento_especial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  medicamento_especial_descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diabetico: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dieta_alimentar: {
    type: DataTypes.ENUM('não', 'ovolactovegetariano', 'vegetariano', 'vegano'),
    defaultValue: 'não'
  },
  religiao: {
    type: DataTypes.ENUM('católica', 'evangélica', 'espírita', 'judaica', 'islâmica', 'budista', 'outra', 'sem religião'),
    allowNull: false
  }
}, {
  tableName: 'pessoas',
  timestamps: true,
  underscored: false
});

// Definir associação
Pessoa.belongsTo(Casal, { foreignKey: 'casal_id', as: 'casal' });
Casal.hasMany(Pessoa, { foreignKey: 'casal_id', as: 'pessoas' });

module.exports = Pessoa;
