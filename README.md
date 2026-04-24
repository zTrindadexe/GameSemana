# Joga Essa 🎮

Aplicativo mobile para votação semanal de jogos entre amigos.

## Descrição

O **Joga Essa** é um app desenvolvido em React Native com Expo e TypeScript para organizar a escolha dos jogos mais requisitados para jogar no final de semana. O grupo pode indicar jogos, votar, e ao fim de cada semana o app destaca automaticamente o jogo mais votado para a próxima semana.

## Objetivo Acadêmico

Projeto desenvolvido para a disciplina de Desenvolvimento Mobile da FATEC.

Demonstra na prática:
- Desenvolvimento mobile com React Native e Expo
- Persistência local com SQLite (expo-sqlite)
- CRUD completo de uma entidade principal
- Integração com API REST externa (CheapShark)
- Navegação entre telas com React Navigation
- TypeScript em todo o projeto

## Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React Native | 0.81 | Framework mobile |
| Expo | ~54 | Plataforma de desenvolvimento |
| TypeScript | ~5.9 | Tipagem estática |
| expo-sqlite | ~16 | Banco de dados local |
| React Navigation | ^7 | Navegação entre telas |
| axios | ^1 | Requisições HTTP |

## Requisitos Atendidos

- [x] React Native com Expo
- [x] TypeScript em todo o projeto
- [x] SQLite com CRUD completo
- [x] Uma única entidade principal: `IndicacaoJogo`
- [x] Funciona em Android e iOS
- [x] Interface em português
- [x] Funciona offline (apenas CRUD local)
- [x] Integração com API externa (CheapShark)
- [x] Regra de votação semanal com destaque automático
- [x] Pronto para GitHub

## Entidade Principal

```typescript
type IndicacaoJogo = {
  id: number;
  titulo: string;
  genero: string;
  votos: number;
  observacao?: string;
  jogadoresJson: string; // JSON com array de jogadores
  imagemUri?: string;
  destaque: boolean;
  origem: 'manual' | 'api';
  cheapSharkGameId?: string;
  createdAt: string;
  updatedAt: string;
};
```

Os jogadores/votantes são armazenados diretamente no campo `jogadoresJson` como um array JSON serializado, sem entidade separada.

## Funcionalidades

### CRUD Principal
- **Criar** indicação de jogo manualmente ou via API
- **Listar** indicações da semana atual com ranking
- **Editar** título, gênero, observação e imagem
- **Excluir** indicação

### Votação
- Registrar voto com nome e motivo do jogador
- Impede voto duplicado pelo mesmo nome
- Ranking ordenado por destaque e votos

### Regra Semanal
- Exibe apenas indicações da semana atual (seg–dom)
- Ao iniciar uma nova semana sem registros, o jogo mais votado da semana anterior é automaticamente criado como destaque
- Histórico completo de semanas anteriores disponível

### API CheapShark
- Busca jogos por nome
- Exibe título, imagem e preço
- Importa jogo direto para o SQLite como indicação
- Funciona de forma complementar; o app continua funcionando sem internet

## Estrutura de Pastas

```
src/
  components/
    GameCard.tsx          # Card do jogo no ranking
    EmptyState.tsx        # Estado vazio das listas
    PrimaryButton.tsx     # Botão reutilizável

  database/
    database.ts                    # Inicialização do SQLite
    indicacaoJogoRepository.ts     # Todas as operações CRUD

  navigation/
    AppNavigator.tsx      # Stack navigator principal

  screens/
    HomeScreen.tsx              # Ranking semanal + busca
    IndicacaoFormScreen.tsx     # Cadastro e edição
    IndicacaoDetailsScreen.tsx  # Detalhes + votar + excluir
    ApiSearchScreen.tsx         # Busca na CheapShark
    HistoryScreen.tsx           # Histórico de semanas

  services/
    gameApiService.ts     # Integração com CheapShark
    weeklyService.ts      # Lógica do ciclo semanal

  types/
    IndicacaoJogo.ts      # Tipos da entidade principal
    Navigation.ts         # Tipos das rotas
    GameApiResult.ts      # Tipos da resposta da API

  utils/
    dateUtils.ts          # Funções de data e semana
    jsonUtils.ts          # Parse/stringify do jogadoresJson

App.tsx                   # Componente raiz
app.json                  # Configuração Expo
package.json              # Dependências
```

## Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go no celular (Android ou iOS)

### Passos

```bash
# Clonar o repositório
git clone https://github.com/zTrindadexe/GameSemana.git
cd GameSemana

# Instalar dependências
npm install

# Iniciar o projeto
npx expo start
```

## Rodar no Android

```bash
npm run android
# ou
npx expo start --android
```

Escaneie o QR Code com o app **Expo Go** no Android.

## Rodar no iOS

```bash
npm run ios
# ou
npx expo start --ios
```

Escaneie o QR Code com a câmera do iPhone (Expo Go instalado).

> **Nota:** Para build nativo iOS é necessário macOS com Xcode.

## Persistência com SQLite

O app usa `expo-sqlite` para armazenar todos os dados localmente no dispositivo.

A tabela principal é `indicacoes_jogos`:

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

O campo `jogadores_json` armazena os votantes como um JSON serializado, evitando a necessidade de uma tabela separada de usuários.

## Integração com CheapShark

A [CheapShark API](https://www.cheapshark.com/api) é uma API pública de monitoramento de preços de jogos digitais.

Endpoint utilizado:
```
GET https://www.cheapshark.com/api/1.0/games?title={termo}
```

Mapeamento dos campos:
| CheapShark | App |
|---|---|
| `external` | `titulo` |
| `thumb` | `imagemUri` |
| `gameID` | `cheapSharkGameId` |
| `cheapest` | `precoReferencia` |

O gênero não é retornado pela CheapShark nesse endpoint, sendo salvo como "Não informado" e podendo ser editado pelo usuário depois.

## Regra Semanal

- A semana vai de segunda-feira (00:00) a domingo (23:59)
- Ao abrir o app em uma nova semana vazia:
  1. O app busca o jogo mais votado da semana anterior
  2. Cria uma nova `IndicacaoJogo` com `destaque = true` e `votos = 0`
  3. Essa indicação aparece no topo do ranking com o badge "🔥 Destaque da semana anterior"
- Registros antigos nunca são deletados (apenas filtrados por data na tela principal)

## Melhorias Futuras

- Autenticação de usuários
- Sincronização em nuvem (Firebase/Supabase)
- Grupos online com código de convite
- Notificações push para lembrar a votação
- Integração com IGDB para dados completos de gênero
- Modo dark

## Prints

> *Adicionar prints do app aqui após execução*

---

## Autor

**Leonardo Henrique Trindade**  
GitHub: [@zTrindadexe](https://github.com/zTrindadexe)  
FATEC — Desenvolvimento Mobile
