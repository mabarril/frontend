# Documentação Atualizada da API Backend - Sistema de Administração ECC

## Visão Geral

Esta documentação descreve a API RESTful atualizada para o Sistema de Administração ECC (Encontro de Casais com Cristo). Foram implementadas as seguintes correções solicitadas:

1. O campo `religiao` na tabela `pessoas` agora é um ENUM com valores predefinidos
2. A relação de apadrinhamento foi movida para uma tabela separada, permitindo que um casal seja padrinho de múltiplos outros casais em um mesmo evento

## Estrutura do Projeto

```
ecc-admin-backend/
├── src/
│   ├── config/
│   │   └── database.js         # Configuração de conexão com o MySQL
│   │
│   ├── api/
│   │   ├── controllers/        # Controladores da API
│   │   │   ├── casal-controller.js
│   │   │   ├── evento-controller.js
│   │   │   ├── inscricao-controller.js
│   │   │   ├── apadrinhamento-controller.js  # Novo controlador
│   │   │   └── url-unica-controller.js
│   │   │
│   │   ├── models/             # Modelos Sequelize
│   │   │   ├── casal.js
│   │   │   ├── pessoa.js       # Atualizado com ENUM para religião
│   │   │   ├── filho.js
│   │   │   ├── evento.js
│   │   │   ├── regra-devolucao.js
│   │   │   ├── inscricao.js    # Removido campo casal_padrinho_id
│   │   │   ├── apadrinhamento.js  # Novo modelo
│   │   │   └── url-unica.js
│   │   │
│   │   └── routes/             # Rotas da API
│   │       ├── casal-routes.js
│   │       ├── evento-routes.js
│   │       ├── inscricao-routes.js
│   │       ├── apadrinhamento-routes.js  # Novas rotas
│   │       └── url-unica-routes.js
│   │
│   └── server.js               # Ponto de entrada da aplicação
│
├── .env                        # Variáveis de ambiente
└── package.json                # Dependências do projeto
```

## Configuração e Instalação

### Pré-requisitos

- Node.js (v14 ou superior)
- MySQL (v8.0 ou superior)

### Passos para Instalação

1. Clone o repositório
2. Instale as dependências:
   ```
   cd ecc-admin-backend
   npm install
   ```
3. Configure o arquivo `.env` com suas credenciais de banco de dados:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=ecc_admin
   DB_PORT=3306
   NODE_ENV=development
   PORT=3000
   ```
4. Crie o banco de dados executando o script SQL atualizado:
   ```
   mysql -u root -p < /home/ubuntu/ecc_analysis/scripts_sql/create_database_updated.sql
   ```
5. Inicie o servidor:
   ```
   cd src
   node server.js
   ```

## Endpoints da API

### Casais

#### Criar um novo casal
- **URL**: `/api/casais`
- **Método**: `POST`
- **Corpo da Requisição**:
  ```json
  {
    "casal": {
      "data_casamento": "2020-01-01",
      "endereco": "Rua Exemplo, 123",
      "bairro": "Centro",
      "cidade": "São Paulo",
      "cep": "01001-000",
      "contato_emergencia_nome1": "Contato 1",
      "contato_emergencia_telefone1": "(11) 99999-9999"
    },
    "pessoas": [
      {
        "tipo": "esposo",
        "nome_completo": "João Silva",
        "nome_social": "João",
        "data_nascimento": "1980-01-01",
        "profissao": "Engenheiro",
        "email": "joao@exemplo.com",
        "celular": "(11) 98888-8888",
        "rg": "12345678-9",
        "rg_emissor": "SSP",
        "cpf": "123.456.789-00",
        "religiao": "católica"
      },
      {
        "tipo": "esposa",
        "nome_completo": "Maria Silva",
        "nome_social": "Maria",
        "data_nascimento": "1982-02-02",
        "profissao": "Médica",
        "email": "maria@exemplo.com",
        "celular": "(11) 97777-7777",
        "rg": "98765432-1",
        "rg_emissor": "SSP",
        "cpf": "987.654.321-00",
        "religiao": "católica"
      }
    ],
    "filhos": [
      {
        "nome_completo": "Pedro Silva",
        "data_nascimento": "2010-03-03"
      }
    ]
  }
  ```
- **Resposta de Sucesso**: `201 Created`

#### Obter todos os casais
- **URL**: `/api/casais`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Obter um casal pelo ID
- **URL**: `/api/casais/:id`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Atualizar um casal
- **URL**: `/api/casais/:id`
- **Método**: `PUT`
- **Corpo da Requisição**: Mesmo formato do endpoint de criação
- **Resposta de Sucesso**: `200 OK`

#### Excluir um casal (soft delete)
- **URL**: `/api/casais/:id`
- **Método**: `DELETE`
- **Resposta de Sucesso**: `200 OK`

### Eventos

#### Criar um novo evento
- **URL**: `/api/eventos`
- **Método**: `POST`
- **Corpo da Requisição**:
  ```json
  {
    "evento": {
      "nome": "ECC 2025",
      "data_inicio": "2025-08-01T08:00:00",
      "data_fim": "2025-08-03T18:00:00",
      "local": "Paróquia São José",
      "capacidade_maxima": 30,
      "status": "planejado"
    },
    "regras_devolucao": [
      {
        "data_limite": "2025-06-30",
        "percentual_devolucao": 100
      },
      {
        "data_limite": "2025-07-15",
        "percentual_devolucao": 50
      }
    ]
  }
  ```
- **Resposta de Sucesso**: `201 Created`

#### Obter todos os eventos
- **URL**: `/api/eventos`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Obter um evento pelo ID
- **URL**: `/api/eventos/:id`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Atualizar um evento
- **URL**: `/api/eventos/:id`
- **Método**: `PUT`
- **Corpo da Requisição**: Mesmo formato do endpoint de criação
- **Resposta de Sucesso**: `200 OK`

#### Excluir um evento
- **URL**: `/api/eventos/:id`
- **Método**: `DELETE`
- **Resposta de Sucesso**: `200 OK`

### Inscrições

#### Criar uma nova inscrição
- **URL**: `/api/inscricoes`
- **Método**: `POST`
- **Corpo da Requisição**:
  ```json
  {
    "inscricao": {
      "casal_id": 1,
      "evento_id": 1,
      "tipo_participante": "convidado",
      "observacoes": "Primeira participação"
    },
    "gerar_url": true
  }
  ```
- **Resposta de Sucesso**: `201 Created`

#### Obter todas as inscrições
- **URL**: `/api/inscricoes`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Obter inscrições por evento
- **URL**: `/api/inscricoes/evento/:eventoId`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Obter inscrições por casal
- **URL**: `/api/inscricoes/casal/:casalId`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Obter uma inscrição pelo ID
- **URL**: `/api/inscricoes/:id`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Atualizar uma inscrição
- **URL**: `/api/inscricoes/:id`
- **Método**: `PUT`
- **Corpo da Requisição**: Mesmo formato do endpoint de criação
- **Resposta de Sucesso**: `200 OK`

#### Cancelar uma inscrição
- **URL**: `/api/inscricoes/:id/cancelar`
- **Método**: `PUT`
- **Corpo da Requisição**:
  ```json
  {
    "data_desistencia": "2025-07-01T10:00:00",
    "valor_devolvido": 100.00,
    "observacoes": "Cancelamento solicitado pelo casal"
  }
  ```
- **Resposta de Sucesso**: `200 OK`

#### Excluir uma inscrição
- **URL**: `/api/inscricoes/:id`
- **Método**: `DELETE`
- **Resposta de Sucesso**: `200 OK`

### Apadrinhamentos (Novo)

#### Criar um novo apadrinhamento
- **URL**: `/api/apadrinhamentos`
- **Método**: `POST`
- **Corpo da Requisição**:
  ```json
  {
    "inscricao_id": 1,
    "casal_padrinho_id": 2
  }
  ```
- **Resposta de Sucesso**: `201 Created`

#### Obter apadrinhamentos por inscrição
- **URL**: `/api/apadrinhamentos/inscricao/:inscricaoId`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Obter apadrinhamentos por padrinho
- **URL**: `/api/apadrinhamentos/padrinho/:casalId`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Obter um apadrinhamento pelo ID
- **URL**: `/api/apadrinhamentos/:id`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Excluir um apadrinhamento
- **URL**: `/api/apadrinhamentos/:id`
- **Método**: `DELETE`
- **Resposta de Sucesso**: `200 OK`

### URLs Únicas

#### Obter inscrição por token
- **URL**: `/api/urls-unicas/token/:token`
- **Método**: `GET`
- **Resposta de Sucesso**: `200 OK`

#### Criar uma nova URL única
- **URL**: `/api/urls-unicas`
- **Método**: `POST`
- **Corpo da Requisição**:
  ```json
  {
    "inscricao_id": 1,
    "valido_ate": "2025-08-03T18:00:00"
  }
  ```
- **Resposta de Sucesso**: `201 Created`

#### Renovar URL única
- **URL**: `/api/urls-unicas/:id/renovar`
- **Método**: `PUT`
- **Corpo da Requisição**:
  ```json
  {
    "valido_ate": "2025-09-01T00:00:00"
  }
  ```
- **Resposta de Sucesso**: `200 OK`

#### Excluir URL única
- **URL**: `/api/urls-unicas/:id`
- **Método**: `DELETE`
- **Resposta de Sucesso**: `200 OK`

## Modelos de Dados Atualizados

### Casal
- `id`: INT (PK)
- `data_casamento`: DATE
- `endereco`: VARCHAR(255)
- `bairro`: VARCHAR(100)
- `cidade`: VARCHAR(100)
- `cep`: VARCHAR(10)
- `contato_emergencia_nome1`: VARCHAR(255)
- `contato_emergencia_telefone1`: VARCHAR(20)
- `contato_emergencia_nome2`: VARCHAR(255)
- `contato_emergencia_telefone2`: VARCHAR(20)
- `responsavel_filhos_nome`: VARCHAR(255)
- `responsavel_filhos_telefone`: VARCHAR(20)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP (para soft delete)

### Pessoa
- `id`: INT (PK)
- `casal_id`: INT (FK)
- `tipo`: ENUM('esposo', 'esposa')
- `nome_completo`: VARCHAR(255)
- `nome_social`: VARCHAR(100)
- `data_nascimento`: DATE
- `profissao`: VARCHAR(100)
- `email`: VARCHAR(255)
- `celular`: VARCHAR(20)
- `rg`: VARCHAR(20)
- `rg_emissor`: VARCHAR(20)
- `cpf`: VARCHAR(14)
- `problema_saude`: BOOLEAN
- `problema_saude_descricao`: TEXT
- `medicamento_especial`: BOOLEAN
- `medicamento_especial_descricao`: TEXT
- `diabetico`: BOOLEAN
- `dieta_alimentar`: ENUM('não', 'ovolactovegetariano', 'vegetariano', 'vegano')
- `religiao`: ENUM('católica', 'evangélica', 'espírita', 'judaica', 'islâmica', 'budista', 'outra', 'sem religião')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Filho
- `id`: INT (PK)
- `casal_id`: INT (FK)
- `nome_completo`: VARCHAR(255)
- `data_nascimento`: DATE
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Evento
- `id`: INT (PK)
- `nome`: VARCHAR(255)
- `data_inicio`: DATETIME
- `data_fim`: DATETIME
- `local`: VARCHAR(255)
- `capacidade_maxima`: INT
- `status`: ENUM('planejado', 'inscricoes_abertas', 'em_andamento', 'concluido')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### RegraDevolucao
- `id`: INT (PK)
- `evento_id`: INT (FK)
- `data_limite`: DATE
- `percentual_devolucao`: INT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Inscricao
- `id`: INT (PK)
- `casal_id`: INT (FK)
- `evento_id`: INT (FK)
- `tipo_participante`: ENUM('encontrista', 'convidado')
- `data_inscricao`: DATETIME
- `status`: ENUM('confirmada', 'cancelada')
- `data_desistencia`: DATETIME
- `valor_devolvido`: DECIMAL(10,2)
- `observacoes`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Apadrinhamento (Nova tabela)
- `id`: INT (PK)
- `inscricao_id`: INT (FK)
- `casal_padrinho_id`: INT (FK)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### UrlUnica
- `id`: INT (PK)
- `inscricao_id`: INT (FK)
- `token`: VARCHAR(255)
- `valido_ate`: DATETIME
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Exemplo de Fluxo de Apadrinhamento

1. Criar um casal encontrista (que será padrinho)
2. Criar um casal convidado
3. Criar um evento
4. Criar uma inscrição para o casal encontrista no evento
5. Criar uma inscrição para o casal convidado no evento
6. Criar um apadrinhamento vinculando a inscrição do convidado ao casal padrinho

```javascript
// 1. Criar casal encontrista (padrinho)
const casalPadrinho = await axios.post('/api/casais', {
  casal: {
    data_casamento: "2010-05-15",
    endereco: "Rua dos Padrinhos, 100",
    bairro: "Jardim",
    cidade: "São Paulo",
    cep: "01234-567"
  },
  pessoas: [
    {
      tipo: "esposo",
      nome_completo: "José Padrinho",
      religiao: "católica"
    },
    {
      tipo: "esposa",
      nome_completo: "Maria Madrinha",
      religiao: "católica"
    }
  ]
});

// 2. Criar casal convidado
const casalConvidado = await axios.post('/api/casais', {
  casal: {
    data_casamento: "2015-10-20",
    endereco: "Rua dos Convidados, 200",
    bairro: "Centro",
    cidade: "São Paulo",
    cep: "04567-890"
  },
  pessoas: [
    {
      tipo: "esposo",
      nome_completo: "Pedro Convidado",
      religiao: "católica"
    },
    {
      tipo: "esposa",
      nome_completo: "Ana Convidada",
      religiao: "católica"
    }
  ]
});

// 3. Criar evento
const evento = await axios.post('/api/eventos', {
  evento: {
    nome: "ECC 2025",
    data_inicio: "2025-08-01T08:00:00",
    data_fim: "2025-08-03T18:00:00",
    local: "Paróquia São José",
    capacidade_maxima: 30,
    status: "inscricoes_abertas"
  }
});

// 4. Criar inscrição para o casal encontrista
const inscricaoEncontrista = await axios.post('/api/inscricoes', {
  inscricao: {
    casal_id: casalPadrinho.data.id,
    evento_id: evento.data.id,
    tipo_participante: "encontrista"
  },
  gerar_url: true
});

// 5. Criar inscrição para o casal convidado
const inscricaoConvidado = await axios.post('/api/inscricoes', {
  inscricao: {
    casal_id: casalConvidado.data.id,
    evento_id: evento.data.id,
    tipo_participante: "convidado"
  },
  gerar_url: true
});

// 6. Criar apadrinhamento
const apadrinhamento = await axios.post('/api/apadrinhamentos', {
  inscricao_id: inscricaoConvidado.data.id,
  casal_padrinho_id: casalPadrinho.data.id
});
```

## Próximos Passos

1. Implementar autenticação JWT para rotas administrativas
2. Desenvolver endpoints adicionais para relatórios e exportação de dados
3. Integrar com o frontend Angular
4. Implementar validações adicionais e tratamento de erros mais robusto
5. Adicionar testes automatizados

## Considerações Finais

Esta API fornece a base para o Sistema de Administração ECC, permitindo o gerenciamento de casais, eventos, inscrições e apadrinhamentos. As correções solicitadas foram implementadas, tornando o sistema mais flexível e aderente às regras de negócio do ECC.
