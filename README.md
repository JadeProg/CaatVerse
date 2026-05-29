# CaatVerse

O **CaatVerse** é um protocolo Web3 criado para unir educação ambiental, colecionáveis digitais, staking e governança comunitária em um ecossistema inspirado na Caatinga.

A proposta do projeto é mostrar como blockchain, smart contracts e tokens podem ser usados para criar uma experiência descentralizada de participação, recompensa e valorização simbólica do bioma Caatinga.

---

## Problema

A Caatinga é um bioma exclusivamente brasileiro, mas ainda é pouco valorizado em muitos contextos educacionais, culturais e tecnológicos.

Além disso, muitos projetos ambientais dependem de processos centralizados, pouca participação comunitária e baixa transparência nas decisões.

O CaatVerse busca responder ao seguinte problema:

> Como usar Web3 para criar uma experiência interativa que incentive educação ambiental, participação comunitária e valorização simbólica da Caatinga?

---

## Solução

O CaatVerse propõe um MVP funcional baseado em contratos inteligentes na rede Sepolia.

O projeto utiliza:

- **Token ERC-20**, chamado `CAAT`, para representar o token do ecossistema.
- **NFT ERC-721**, para representar colecionáveis digitais ligados à Caatinga.
- **Staking**, para permitir que usuários bloqueiem tokens e recebam recompensas.
- **DAO**, para permitir criação de propostas e votação comunitária.
- **Oráculo**, para consultar o preço do ETH/USD e ajustar a taxa de recompensa do staking.
- **Frontend React + ethers.js**, para interação com a MetaMask.

---

## Arquitetura

Fluxo geral do projeto:

```text
Usuário
  ↓
MetaMask
  ↓
Frontend React + ethers.js
  ↓
Sepolia Testnet
  ├── CaatToken
  ├── CaatNFT
  ├── CaatStaking
  ├── CaatDAO
  └── CaatOracle
```

Relação entre os contratos:

```text
CaatToken
  ├── usado no staking
  └── usado como poder de voto na DAO

CaatNFT
  └── representa colecionáveis digitais da Caatinga

CaatStaking
  ├── recebe tokens CAAT em stake
  ├── calcula recompensas
  └── usa o CaatOracle para definir a taxa de recompensa

CaatDAO
  ├── permite criação de propostas
  ├── permite votação
  └── usa saldo de CAAT como poder de voto

CaatOracle
  └── consulta preço ETH/USD via Chainlink
```

---

## Contratos inteligentes

| Contrato | Função | Endereço |
|---|---|---|
| CaatToken | Token ERC-20 do ecossistema | `0x0e366960C9B39ee0fAAD6D888C8B631Dd6a30BA5` |
| CaatNFT | Colecionáveis digitais ERC-721 | `0x29b97a58d2afa28BCa9928915DB9b53084733863` |
| CaatOracle | Consulta de preço ETH/USD | `0x08ebAF356cC30e6A4278ca4e1CF8F0Ee3F82876a` |
| CaatDAO | Governança descentralizada | `0xfB88aa7E40CfFAAAe9c510981BF9BEe3920bE035` |
| CaatStaking | Staking e recompensas | `0x2CDBF9b0cbe30e56B9E16eEAD893B43FFF71FB9d` |

---

## Funcionalidades

O MVP permite:

- Conectar carteira MetaMask.
- Ver conta conectada.
- Ver rede atual.
- Ver saldo de tokens CAAT.
- Mintar NFT temático da Caatinga.
- Aprovar tokens CAAT para staking.
- Fazer staking de CAAT.
- Sacar tokens em staking.
- Resgatar recompensas acumuladas.
- Criar proposta na DAO.
- Votar a favor ou contra uma proposta.
- Encerrar proposta.
- Consultar dados principais dos contratos no frontend.

---

## Tecnologias utilizadas

### Blockchain

- Solidity `^0.8.28`
- Hardhat
- OpenZeppelin Contracts
- Chainlink
- Sepolia Testnet

### Frontend

- React
- TypeScript
- Vite
- ethers.js
- MetaMask

### Auditoria

- Hardhat
- Slither
- Mythril

---

## Segurança

O projeto aplica algumas boas práticas de segurança em smart contracts:

- Uso de Solidity `^0.8.28`.
- Uso de contratos da OpenZeppelin.
- Controle de acesso com `Ownable`.
- Proteção contra reentrância com `ReentrancyGuard`.
- Separação de responsabilidades entre os contratos.
- Testes automatizados com Hardhat.
- Deploy realizado em ambiente de testnet.

---

## Auditoria

A auditoria foi realizada com três ferramentas:

### Hardhat

O projeto foi compilado e testado com Hardhat.

Resultado dos testes:

```text
9 passing
```

### Slither

A análise estática foi executada com Slither.

Relatório disponível em:

```text
blockchain/slither-report.txt
```

Os alertas encontrados foram analisados manualmente e registrados no relatório de auditoria.

### Mythril

A análise simbólica foi executada com Mythril nos principais contratos.

Relatórios disponíveis em:

```text
blockchain/mythril-staking-report.txt
blockchain/mythril-dao-report.txt
blockchain/mythril-nft-report.txt
blockchain/mythril-token-report.txt
blockchain/mythril-oracle-report.txt
```

Resultado geral:

| Contrato | Resultado |
|---|---|
| CaatStaking.sol | Nenhuma issue detectada |
| CaatDAO.sol | Nenhuma issue detectada |
| CaatNFT.sol | Nenhuma issue detectada |
| CaatToken.sol | Nenhuma issue detectada |
| CaatOracle.sol | Nenhuma issue detectada |

Mensagem retornada pelo Mythril:

```text
The analysis was completed successfully. No issues were detected.
```

O relatório completo de auditoria está em:

```text
docs/relatorio-auditoria.md
```

---

## Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd CaatVerse
```

---

## Rodar a parte blockchain

Entre na pasta `blockchain`:

```bash
cd blockchain
```

Instale as dependências:

```bash
npm install
```

Compile os contratos:

```bash
npx hardhat compile
```

Execute os testes:

```bash
npx hardhat test
```

---

## Rodar o frontend

Entre na pasta `frontend`:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:5173
```

---

## Como usar o MVP

1. Abra o frontend.
2. Conecte a MetaMask.
3. Confirme que a carteira está na rede Sepolia.
4. Visualize saldo de CAAT.
5. Minte um NFT.
6. Aprove tokens CAAT para staking.
7. Faça staking.
8. Resgate recompensas ou saque tokens.
9. Crie uma proposta na DAO.
10. Vote na proposta.
11. Encerre a proposta.

---

## Estrutura do projeto

```text
CaatVerse/
├── blockchain/
│   ├── contracts/
│   │   ├── CaatDAO.sol
│   │   ├── CaatNFT.sol
│   │   ├── CaatOracle.sol
│   │   ├── CaatStaking.sol
│   │   ├── CaatToken.sol
│   │   └── MockPriceFeed.sol
│   ├── scripts/
│   ├── test/
│   ├── hardhat.config.ts
│   ├── slither-report.txt
│   ├── mythril-dao-report.txt
│   ├── mythril-nft-report.txt
│   ├── mythril-oracle-report.txt
│   ├── mythril-staking-report.txt
│   └── mythril-token-report.txt
│
├── frontend/
│   ├── src/
│   │   ├── contracts/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── docs/
│   ├── deployed-addresses.md
│   └── relatorio-auditoria.md
│
└── README.md
```

---

## Demonstração

Link do vídeo de demonstração:

```text
Adicionar link do vídeo aqui.
```

O vídeo deve demonstrar:

- Conexão com MetaMask.
- Consulta de saldo CAAT.
- Mint de NFT.
- Staking de tokens.
- Saque ou resgate de recompensa.
- Criação de proposta na DAO.
- Votação na DAO.
- Encerramento de proposta.
- Resultados da auditoria.

---

## Melhorias futuras

Algumas melhorias possíveis para versões futuras:

- Criar uma interface visual mais imersiva em 3D.
- Adicionar mais colecionáveis digitais da Caatinga.
- Melhorar a experiência de governança.
- Adicionar tempo de votação nas propostas.
- Exibir histórico de transações no frontend.
- Adicionar validações extras no oráculo.
- Ampliar os testes automatizados.
- Realizar auditoria profissional antes de uso em rede principal.

---

## Status do projeto

MVP funcional em testnet com:

- Token ERC-20.
- NFT ERC-721.
- Staking.
- DAO.
- Oráculo.
- Frontend integrado com MetaMask.
- Testes automatizados.
- Auditoria com Hardhat, Slither e Mythril.

---

## Licença

Projeto desenvolvido para fins educacionais.