const sequelize = require('../../config/database');

// Importar todos os modelos
const Casal = require('./casal');
const Pessoa = require('./pessoa');
const Filho = require('./filho');
const Evento = require('./evento');
const RegraDevolucao = require('./regra-devolucao');
const Inscricao = require('./inscricao');
const UrlUnica = require('./url-unica');
const Apadrinhamento = require('./apadrinhamento');
const Usuario = require('./usuario');

// Definir associações
// Casal -> Pessoas
// Casal.hasOne(Pessoa, { 
//   foreignKey: 'casal_id', 
//   as: 'esposo',
//   scope: { tipo: 'esposo' }
// });
// Casal.hasOne(Pessoa, { 
//   foreignKey: 'casal_id', 
//   as: 'esposa',
//   scope: { tipo: 'esposa' }
// });
// Pessoa.belongsTo(Casal, { foreignKey: 'casal_id' });

// // Casal -> Filhos
// Casal.hasMany(Filho, { foreignKey: 'casal_id', as: 'filhos' });
// Filho.belongsTo(Casal, { foreignKey: 'casal_id' });

// // Evento -> Regras de Devolução
// Evento.hasMany(RegraDevolucao, { foreignKey: 'evento_id', as: 'regras_devolucao' });
// RegraDevolucao.belongsTo(Evento, { foreignKey: 'evento_id' });

// // Inscrições
// Inscricao.belongsTo(Casal, { foreignKey: 'casal_id' });
// Inscricao.belongsTo(Evento, { foreignKey: 'evento_id' });
// Casal.hasMany(Inscricao, { foreignKey: 'casal_id', as: 'inscricoes' });
// Evento.hasMany(Inscricao, { foreignKey: 'evento_id', as: 'inscricoes' });

// // URLs Únicas
// UrlUnica.belongsTo(Inscricao, { foreignKey: 'inscricao_id' });
// Inscricao.hasOne(UrlUnica, { foreignKey: 'inscricao_id', as: 'url_unica' });

// // Apadrinhamentos
// Apadrinhamento.belongsTo(Inscricao, { 
//   foreignKey: 'inscricao_padrinho_id', 
//   as: 'inscricao_padrinho' 
// });
// Apadrinhamento.belongsTo(Inscricao, { 
//   foreignKey: 'inscricao_afilhado_id', 
//   as: 'inscricao_afilhado' 
// });

// Inscricao.hasMany(Apadrinhamento, { 
//   foreignKey: 'inscricao_padrinho_id', 
//   as: 'afilhados' 
// });
// Inscricao.hasMany(Apadrinhamento, { 
//   foreignKey: 'inscricao_afilhado_id', 
//   as: 'padrinhos' 
// });

// // Exportar modelos e sequelize
// module.exports = {
//   sequelize,
//   Casal,
//   Pessoa,
//   Filho,
//   Evento,
//   RegraDevolucao,
//   Inscricao,
//   UrlUnica,
//   Apadrinhamento,
//   Usuario
// };

