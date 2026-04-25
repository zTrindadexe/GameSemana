# Joga Essa 🎮

Aplicativo mobile para votação semanal de jogos entre amigos.

## Descrição

O **Joga Essa** é um app desenvolvido em React Native com Expo e TypeScript para organizar a escolha dos jogos mais requisitados para jogar no final de semana. O grupo pesquisa jogos pelo catálogo da RAWG API, indica para votação da semana e, ao fim de cada ciclo, o app registra automaticamente o campeão no histórico semanal do grupo.

## Objetivo Acadêmico

Projeto desenvolvido para a disciplina de Desenvolvimento Mobile da FATEC.

Demonstra na prática:
- Desenvolvimento mobile com React Native e Expo
- Persistência local com SQLite (expo-sqlite)
- CRUD completo de uma entidade principal
- Autenticação local com banco de dados (sem backend)
- Integração com API REST externa (RAWG)
- Navegação condicional entre fluxo de autenticação e fluxo principal
- TypeScript em todo o projeto

## Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React Native | 0.81 | Framework mobile |
| Expo | ~54 | Plataforma de desenvolvimento |
| TypeScript | ~5.9 | Tipagem estática |
| expo-sqlite | ~16 | Banco de dados local (indicações + usuários) |
| React Navigation | ^7 | Navegação entre telas |
| axios | ^1 | Requisições HTTP |

## Requisitos Atendidos

- [x] React Native com Expo
- [x] TypeScript em todo o projeto
- [x] SQLite com CRUD completo
- [x] Uma única entidade principal: `IndicacaoJogo`
- [x] Autenticação local via banco de dados
- [x] Funciona em Android e iOS
- [x] Interface em português
- [x] Funciona offline (CRUD local independente de internet)
- [x] Integração com RAWG API — catálogo com mais de 500 mil jogos
- [x] Regra de votação semanal com destaque automático
- [x] Histórico de campeões semanais do grupo
- [x] Pronto para GitHub

## Entidades do Banco de Dados

### IndicacaoJogo — entidade principal

```typescript
type IndicacaoJogo = {
  id: number;
  titulo: string;
  genero: string;
  votos: number;
  observacao?: string;
  jogadoresJson: string; // JSON com array de jogadores e motivos
  imagemUri?: string;
  destaque: boolean;
  origem: 'manual' | 'api';
  cheapSharkGameId?: string; // ID externo da RAWG
  createdAt: string;
  updatedAt: string;
};
```

Os votantes são armazenados diretamente no campo `jogadoresJson` como um array JSON serializado, sem entidade separada.

### Usuario

```typescript
type Usuario = {
  id: number;
  nome: string;
  createdAt: string;
};
```

Senhas armazenadas localmente no SQLite. Acesso ao app restrito a usuários previamente cadastrados.

## Funcionalidades

### Autenticação
- Tela de login com nome de usuário e senha
- Tela de cadastro com validação de campos e confirmação de senha
- Acesso negado para usuários não cadastrados
- Nome do usuário exibido no cabeçalho do app
- Botão de logout disponível em todas as telas principais

### CRUD de Indicações
- **Criar** indicação de duas formas:
  - **Buscar na API** — pesquisa na RAWG API e importa título, gênero e imagem automaticamente
  - **Indicar offline** — formulário local com nome do jogo e motivo, funciona sem internet; entra com 1 voto do usuário logado
- **Listar** indicações da semana atual com ranking por votos
- **Editar** título, gênero, observação e URL de imagem
- **Excluir** indicação

### Votação
- Voto registrado automaticamente com o nome do usuário logado
- Motivo do voto opcional
- Bloqueio de voto duplicado pelo mesmo usuário na mesma indicação
- Ranking ordenado por destaque e quantidade de votos

### Regra Semanal
- A semana vai de segunda-feira (00:00) a domingo (23:59)
- A tela principal exibe apenas indicações da semana atual
- Ao iniciar uma nova semana sem indicações, o jogo mais votado da semana anterior é promovido automaticamente como destaque
- Registros antigos nunca são deletados

### Busca na API (RAWG)
- Pesquisa por nome com retorno de título, gênero e imagem
- Catálogo geral com mais de 500 mil jogos (todos os gêneros e plataformas)
- Importação direta para o SQLite como indicação da semana
- Funciona de forma complementar; o app opera sem internet usando apenas dados locais

### Histórico Semanal
- Uma entrada por semana exibindo o **jogo campeão** (mais votado)
- Informações exibidas: imagem, título, gênero, votos e quem votou
- Agrupado por ano
- Toque no card abre os detalhes completos do jogo

## Fluxo do Aplicativo

```
Abertura
  └── Splash Screen (logo + inicialização do banco)
        └── Login
              ├── Cadastro (novo usuário)
              └── Home (usuário autenticado)
                    ├── Indicar jogo → Busca na API → Importar
                    ├── Ver detalhes → Votar / Editar / Excluir
                    └── Histórico → Campeões semanais
```

## Estrutura de Pastas

```
src/
  components/
    GameCard.tsx          # Card do jogo no ranking
    EmptyState.tsx        # Estado vazio das listas
    PrimaryButton.tsx     # Botão reutilizável
    VoteModal.tsx         # Modal de votação (Android e iOS)

  config/
    apiConfig.ts          # Chave da RAWG API

  context/
    AuthContext.tsx        # Estado global de autenticação

  database/
    database.ts                    # Inicialização do SQLite (2 tabelas)
    indicacaoJogoRepository.ts     # CRUD de indicações + histórico semanal
    usuarioRepository.ts           # Cadastro e login de usuários

  navigation/
    AppNavigator.tsx      # Navegação condicional: auth vs app

  screens/
    SplashScreenApp.tsx         # Tela de carregamento inicial com logo
    LoginScreen.tsx             # Login
    RegisterScreen.tsx          # Cadastro de usuário
    HomeScreen.tsx              # Ranking semanal + busca local
    IndicacaoFormScreen.tsx     # Edição de indicação (somente edição)
    IndicacaoDetailsScreen.tsx  # Detalhes + votar + excluir
    ApiSearchScreen.tsx         # Busca e importação via RAWG API
    HistoryScreen.tsx           # Histórico de campeões semanais

  services/
    gameApiService.ts     # Integração com RAWG API
    weeklyService.ts      # Lógica do ciclo semanal

  types/
    IndicacaoJogo.ts      # Tipos da entidade principal
    Usuario.ts            # Tipo do usuário
    Navigation.ts         # Tipos das rotas (auth e app)
    GameApiResult.ts      # Tipos da resposta da RAWG

  utils/
    dateUtils.ts          # Funções de data e semana
    jsonUtils.ts          # Parse/stringify do jogadoresJson

App.tsx                   # Componente raiz com AuthProvider
app.json                  # Configuração Expo
package.json              # Dependências
```

## Instalação

### Pré-requisitos
- Node.js 18+
- npm
- Expo Go no celular (Android ou iOS)

### Passos

```bash
# Clonar o repositório
git clone https://github.com/zTrindadexe/GameSemana.git
cd GameSemana

# Instalar dependências
npm install

# Iniciar o projeto
npx expo start --clear
```

## Rodar no Android

```bash
npx expo start --android
```

Escaneie o QR Code com o app **Expo Go** no Android.

## Rodar no iOS

```bash
npx expo start --ios
```

Escaneie o QR Code com a câmera do iPhone (Expo Go instalado).

> **Nota:** Para build nativo iOS é necessário macOS com Xcode.

## Configuração da RAWG API

O app usa a [RAWG API](https://rawg.io/apidocs) para buscar jogos. A chave já está configurada em `src/config/apiConfig.ts`.

Para trocar a chave:
1. Acesse [rawg.io/apidocs](https://rawg.io/apidocs) e registre-se gratuitamente
2. Copie sua API Key
3. Edite `src/config/apiConfig.ts`:

```typescript
export const RAWG_API_KEY = 'sua_chave_aqui';
```

## Persistência com SQLite

O app usa `expo-sqlite` para armazenar todos os dados localmente no dispositivo, sem necessidade de backend.

### Tabela `usuarios`

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

### Tabela `indicacoes_jogos`

```sql
CREATE TABLE IF NOT EXISTS indicacoes_jogos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  genero TEXT DEFAULT 'Não informado',
  votos INTEGER DEFAULT 0,
  observacao TEXT,
  jogadores_json TEXT DEFAULT '[]',
  imagem_uri TEXT,
  destaque INTEGER DEFAULT 0,
  origem TEXT DEFAULT 'manual',
  cheap_shark_game_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## Integração com RAWG API

A [RAWG API](https://rawg.io/apidocs) é um catálogo público com mais de 500 mil jogos de todos os gêneros e plataformas.

Endpoint utilizado:
```
GET https://api.rawg.io/api/games?search={termo}&key={chave}&page_size=20
```

Mapeamento dos campos:
| RAWG | App |
|---|---|
| `id` | `externalId` |
| `name` | `titulo` |
| `background_image` | `imagemUri` |
| `genres[].name` | `genero` |

## Regra Semanal

- A semana vai de segunda-feira (00:00) a domingo (23:59)
- A Home exibe apenas indicações criadas na semana atual
- Ao abrir o app em uma nova semana sem indicações:
  1. O app busca o jogo mais votado da semana anterior
  2. Cria uma nova `IndicacaoJogo` com `destaque = true` e `votos = 0`
  3. Esse destaque aparece no topo do ranking com o badge "🔥 Destaque da semana anterior"
- Registros antigos nunca são deletados (histórico preservado)

## Melhorias Futuras

- Sincronização em nuvem (Firebase/Supabase)
- Grupos online com código de convite
- Notificações push para lembrar a votação
- Modo dark
- Estatísticas do grupo (jogo mais indicado no mês, usuário mais ativo etc.)

## Prints

> *Adicionar prints do app aqui após execução*

---

## Autor

**Leonardo Henrique Trindade**  
GitHub: [@zTrindadexe](https://github.com/zTrindadexe)  
FATEC — Desenvolvimento Mobile
