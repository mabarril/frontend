const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const Casal = require('./casal');
const Evento = require('./evento');

const Inscricao = sequelize.define('Inscricao', {
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
    padrinho_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Casal,
      key: 'id'
    }
  },
  evento_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Evento,
      key: 'id'
    }
  },
  tipo_participante: {
    type: DataTypes.ENUM('encontrista', 'convidado'),
    allowNull: false
  },
  data_inscricao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('confirmada', 'cancelada'),
    defaultValue: 'confirmada'
  },
  data_desistencia: {
    type: DataTypes.DATE,
    allowNull: true
  },
  valor_devolvido: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quarto: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'inscricoes',
  timestamps: true,
  underscored: true,
});

// Definir associações
Inscricao.belongsTo(Casal, { foreignKey: 'casal_id', as: 'casal' });
Inscricao.belongsTo(Evento, { foreignKey: 'evento_id', as: 'evento' });

Casal.hasMany(Inscricao, { foreignKey: 'casal_id', as: 'inscricoes' });
Evento.hasMany(Inscricao, { foreignKey: 'evento_id', as: 'inscricoes' });

module.exports = Inscricao;
