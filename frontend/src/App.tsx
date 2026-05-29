import { useState } from 'react'
import {
  BrowserProvider,
  Contract,
  formatUnits,
  parseUnits,
} from 'ethers'
import { CONTRACT_ADDRESSES, SEPOLIA_CHAIN_ID } from './contracts/addresses'
import { CONTRACT_ABIS } from './contracts/abis'
import './App.css'

function App() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [networkName, setNetworkName] = useState<string>('')
  const [statusMessage, setStatusMessage] = useState<string>(
    'Conecte sua carteira para começar a explorar o CaatVerse.'
  )

  const [tokenName, setTokenName] = useState<string>('')
  const [tokenSymbol, setTokenSymbol] = useState<string>('')
  const [tokenBalance, setTokenBalance] = useState<string>('')

  const [nftTokenURI, setNftTokenURI] = useState<string>(
    'ipfs://caatverse/mandacaru'
  )
  const [mintStatus, setMintStatus] = useState<string>('')
  const [isMinting, setIsMinting] = useState<boolean>(false)

  const [currentRewardRate, setCurrentRewardRate] = useState<string>('')
  const [stakedBalance, setStakedBalance] = useState<string>('')
  const [pendingReward, setPendingReward] = useState<string>('')

  const [stakingAmount, setStakingAmount] = useState<string>('')
  const [stakingStatus, setStakingStatus] = useState<string>('')
  const [isApproving, setIsApproving] = useState<boolean>(false)
  const [isStaking, setIsStaking] = useState<boolean>(false)
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false)
  const [isClaimingReward, setIsClaimingReward] = useState<boolean>(false)

  const [proposalDescription, setProposalDescription] = useState<string>('')
  const [daoStatus, setDaoStatus] = useState<string>('')
  const [isCreatingProposal, setIsCreatingProposal] = useState<boolean>(false)
  const [isVoting, setIsVoting] = useState<boolean>(false)
  const [isClosingProposal, setIsClosingProposal] = useState<boolean>(false)

  const [proposals, setProposals] = useState<
    Array<{
      id: number
      description: string
      votesFor: string
      votesAgainst: string
      active: boolean
      hasUserVoted: boolean
    }>
  >([])

  async function switchToSepolia() {
    if (!window.ethereum) {
      return false
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      })

      return true
    } catch (error) {
      console.error('Erro ao trocar para Sepolia:', error)
      setStatusMessage(
        'Não foi possível trocar automaticamente para Sepolia. Selecione a rede Sepolia na MetaMask.'
      )
      return false
    }
  }

  async function loadCaatTokenData(
    provider: BrowserProvider,
    address: string
  ) {
    const caatTokenContract = new Contract(
      CONTRACT_ADDRESSES.caatToken,
      CONTRACT_ABIS.caatToken,
      provider
    )

    const [name, symbol, decimals, balance] = await Promise.all([
      caatTokenContract.name(),
      caatTokenContract.symbol(),
      caatTokenContract.decimals(),
      caatTokenContract.balanceOf(address),
    ])

    setTokenName(name)
    setTokenSymbol(symbol)
    setTokenBalance(formatUnits(balance, decimals))
  }

  async function loadStakingData(
    provider: BrowserProvider,
    address: string
  ) {
    const caatStakingContract = new Contract(
      CONTRACT_ADDRESSES.caatStaking,
      CONTRACT_ABIS.caatStaking,
      provider
    )

    const caatTokenContract = new Contract(
      CONTRACT_ADDRESSES.caatToken,
      CONTRACT_ABIS.caatToken,
      provider
    )

    const decimals = await caatTokenContract.decimals()

    const [rewardRate, userStakedBalance, userPendingReward] =
      await Promise.all([
        caatStakingContract.getCurrentRewardRate(),
        caatStakingContract.stakedBalance(address),
        caatStakingContract.calculateReward(address),
      ])

    setCurrentRewardRate(rewardRate.toString())
    setStakedBalance(formatUnits(userStakedBalance, decimals))
    setPendingReward(formatUnits(userPendingReward, decimals))
  }

  async function loadDaoData(
    provider: BrowserProvider,
    address: string
  ) {
    const caatDAOContract = new Contract(
      CONTRACT_ADDRESSES.caatDAO,
      CONTRACT_ABIS.caatDAO,
      provider
    )

    const caatTokenContract = new Contract(
      CONTRACT_ADDRESSES.caatToken,
      CONTRACT_ABIS.caatToken,
      provider
    )

    const decimals = await caatTokenContract.decimals()
    const totalProposals = Number(await caatDAOContract.totalProposals())

    const loadedProposals = await Promise.all(
      Array.from({ length: totalProposals }, async (_, index) => {
        const proposal = await caatDAOContract.proposals(index)
        const userAlreadyVoted = await caatDAOContract.hasVoted(index, address)

        return {
          id: index,
          description: proposal.description,
          votesFor: formatUnits(proposal.votesFor, decimals),
          votesAgainst: formatUnits(proposal.votesAgainst, decimals),
          active: proposal.active,
          hasUserVoted: userAlreadyVoted,
        }
      })
    )

    setProposals(loadedProposals.reverse())
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        setStatusMessage(
          'MetaMask não encontrada. Instale a extensão para continuar.'
        )
        return
      }

      await window.ethereum.request({
        method: 'eth_requestAccounts',
      })

      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId',
      })

      const currentChainIdDecimal = parseInt(currentChainId as string, 16)

      if (currentChainIdDecimal !== SEPOLIA_CHAIN_ID) {
        setStatusMessage('Trocando sua carteira para a rede Sepolia...')

        const switched = await switchToSepolia()

        if (!switched) {
          return
        }
      }

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()

      setWalletAddress(address)
      setNetworkName(network.name === 'sepolia' ? 'Sepolia' : network.name)

      await loadCaatTokenData(provider, address)
      await loadStakingData(provider, address)
      await loadDaoData(provider, address)

      setStatusMessage('Carteira conectada na rede Sepolia com sucesso!')
    } catch (error) {
      console.error('Erro ao conectar carteira:', error)
      setStatusMessage('Não foi possível conectar a carteira.')
    }
  }

  async function mintNFT() {
    try {
      if (!window.ethereum) {
        setMintStatus('MetaMask não encontrada.')
        return
      }

      if (!walletAddress) {
        setMintStatus('Conecte sua carteira antes de mintar uma NFT.')
        return
      }

      if (!nftTokenURI.trim()) {
        setMintStatus('Informe uma tokenURI para a NFT.')
        return
      }

      setIsMinting(true)
      setMintStatus('Aguardando confirmação na MetaMask...')

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const caatNFTContract = new Contract(
        CONTRACT_ADDRESSES.caatNFT,
        CONTRACT_ABIS.caatNFT,
        signer
      )

      const transaction = await caatNFTContract.mintNFT(
        walletAddress,
        nftTokenURI
      )

      setMintStatus('Transação enviada. Aguardando confirmação na blockchain...')

      await transaction.wait()

      setMintStatus('NFT mintada com sucesso no CaatVerse!')
    } catch (error) {
      console.error('Erro ao mintar NFT:', error)
      setMintStatus(
        'Não foi possível mintar a NFT. Verifique se esta carteira é a dona do contrato e se há ETH Sepolia para pagar o gás.'
      )
    } finally {
      setIsMinting(false)
    }
  }

  async function approveStakingTokens() {
    try {
      if (!window.ethereum) {
        setStakingStatus('MetaMask não encontrada.')
        return
      }

      if (!walletAddress) {
        setStakingStatus('Conecte sua carteira antes de aprovar tokens.')
        return
      }

      if (!stakingAmount || Number(stakingAmount) <= 0) {
        setStakingStatus('Informe uma quantidade válida de CAAT.')
        return
      }

      setIsApproving(true)
      setStakingStatus('Aguardando aprovação na MetaMask...')

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const caatTokenContract = new Contract(
        CONTRACT_ADDRESSES.caatToken,
        CONTRACT_ABIS.caatToken,
        signer
      )

      const decimals = await caatTokenContract.decimals()
      const amountInTokenUnits = parseUnits(stakingAmount, decimals)

      const transaction = await caatTokenContract.approve(
        CONTRACT_ADDRESSES.caatStaking,
        amountInTokenUnits
      )

      setStakingStatus(
        'Aprovação enviada. Aguardando confirmação na blockchain...'
      )

      await transaction.wait()

      setStakingStatus(
        'CAAT aprovado com sucesso. Agora você já pode fazer o staking.'
      )
    } catch (error) {
      console.error('Erro ao aprovar tokens:', error)
      setStakingStatus(
        'Não foi possível aprovar os tokens. Verifique o valor informado e tente novamente.'
      )
    } finally {
      setIsApproving(false)
    }
  }

  async function stakeTokens() {
    try {
      if (!window.ethereum) {
        setStakingStatus('MetaMask não encontrada.')
        return
      }

      if (!walletAddress) {
        setStakingStatus('Conecte sua carteira antes de fazer staking.')
        return
      }

      if (!stakingAmount || Number(stakingAmount) <= 0) {
        setStakingStatus('Informe uma quantidade válida de CAAT.')
        return
      }

      setIsStaking(true)
      setStakingStatus('Aguardando confirmação do staking na MetaMask...')

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const caatTokenContract = new Contract(
        CONTRACT_ADDRESSES.caatToken,
        CONTRACT_ABIS.caatToken,
        provider
      )

      const caatStakingContract = new Contract(
        CONTRACT_ADDRESSES.caatStaking,
        CONTRACT_ABIS.caatStaking,
        signer
      )

      const decimals = await caatTokenContract.decimals()
      const amountInTokenUnits = parseUnits(stakingAmount, decimals)

      const transaction = await caatStakingContract.stake(amountInTokenUnits)

      setStakingStatus(
        'Staking enviado. Aguardando confirmação na blockchain...'
      )

      await transaction.wait()

      await loadCaatTokenData(provider, walletAddress)
      await loadStakingData(provider, walletAddress)

      setStakingStatus('Staking realizado com sucesso no CaatVerse!')
      setStakingAmount('')
    } catch (error) {
      console.error('Erro ao fazer staking:', error)
      setStakingStatus(
        'Não foi possível fazer staking. Verifique se você aprovou essa quantidade de CAAT antes.'
      )
    } finally {
      setIsStaking(false)
    }
  }

  async function withdrawTokens() {
    try {
      if (!window.ethereum) {
        setStakingStatus('MetaMask não encontrada.')
        return
      }

      if (!walletAddress) {
        setStakingStatus('Conecte sua carteira antes de sacar seus tokens.')
        return
      }

      if (!stakingAmount || Number(stakingAmount) <= 0) {
        setStakingStatus('Informe uma quantidade válida de CAAT para sacar.')
        return
      }

      setIsWithdrawing(true)
      setStakingStatus('Aguardando confirmação do saque na MetaMask...')

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const caatTokenContract = new Contract(
        CONTRACT_ADDRESSES.caatToken,
        CONTRACT_ABIS.caatToken,
        provider
      )

      const caatStakingContract = new Contract(
        CONTRACT_ADDRESSES.caatStaking,
        CONTRACT_ABIS.caatStaking,
        signer
      )

      const decimals = await caatTokenContract.decimals()
      const amountInTokenUnits = parseUnits(stakingAmount, decimals)

      const transaction = await caatStakingContract.withdraw(amountInTokenUnits)

      setStakingStatus(
        'Saque enviado. Aguardando confirmação na blockchain...'
      )

      await transaction.wait()

      await loadCaatTokenData(provider, walletAddress)
      await loadStakingData(provider, walletAddress)

      setStakingStatus('Saque realizado com sucesso no CaatVerse!')
      setStakingAmount('')
    } catch (error) {
      console.error('Erro ao sacar tokens:', error)
      setStakingStatus(
        'Não foi possível sacar os tokens. Verifique se a quantidade não é maior que seu saldo em staking.'
      )
    } finally {
      setIsWithdrawing(false)
    }
  }

  async function claimStakingReward() {
    try {
      if (!window.ethereum) {
        setStakingStatus('MetaMask não encontrada.')
        return
      }

      if (!walletAddress) {
        setStakingStatus('Conecte sua carteira antes de resgatar recompensas.')
        return
      }

      setIsClaimingReward(true)
      setStakingStatus('Aguardando confirmação do resgate na MetaMask...')

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const caatStakingContract = new Contract(
        CONTRACT_ADDRESSES.caatStaking,
        CONTRACT_ABIS.caatStaking,
        signer
      )

      const transaction = await caatStakingContract.claimReward()

      setStakingStatus(
        'Resgate enviado. Aguardando confirmação na blockchain...'
      )

      await transaction.wait()

      await loadCaatTokenData(provider, walletAddress)
      await loadStakingData(provider, walletAddress)

      setStakingStatus('Recompensa resgatada com sucesso no CaatVerse!')
    } catch (error) {
      console.error('Erro ao resgatar recompensa:', error)
      setStakingStatus(
        'Não foi possível resgatar a recompensa. Talvez ainda não exista recompensa disponível.'
      )
    } finally {
      setIsClaimingReward(false)
    }
  }

  async function createProposal() {
    try {
      if (!window.ethereum) {
        setDaoStatus('MetaMask não encontrada.')
        return
      }

      if (!walletAddress) {
        setDaoStatus('Conecte sua carteira antes de criar uma proposta.')
        return
      }

      if (!proposalDescription.trim()) {
        setDaoStatus('Digite uma descrição para a proposta.')
        return
      }

      setIsCreatingProposal(true)
      setDaoStatus('Aguardando confirmação da criação da proposta na MetaMask...')

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const caatDAOContract = new Contract(
        CONTRACT_ADDRESSES.caatDAO,
        CONTRACT_ABIS.caatDAO,
        signer
      )

      const transaction = await caatDAOContract.createProposal(
        proposalDescription.trim()
      )

      setDaoStatus('Proposta enviada. Aguardando confirmação na blockchain...')

      await transaction.wait()

      await loadDaoData(provider, walletAddress)

      setProposalDescription('')
      setDaoStatus('Proposta criada com sucesso na CaatDAO!')
    } catch (error) {
      console.error('Erro ao criar proposta:', error)
      setDaoStatus(
        'Não foi possível criar a proposta. Verifique se esta carteira é a dona do contrato.'
      )
    } finally {
      setIsCreatingProposal(false)
    }
  }

  async function voteOnProposal(proposalId: number, support: boolean) {
    try {
      if (!window.ethereum) {
        setDaoStatus('MetaMask não encontrada.')
        return
      }

      if (!walletAddress) {
        setDaoStatus('Conecte sua carteira antes de votar.')
        return
      }

      setIsVoting(true)
      setDaoStatus('Aguardando confirmação do voto na MetaMask...')

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const caatDAOContract = new Contract(
        CONTRACT_ADDRESSES.caatDAO,
        CONTRACT_ABIS.caatDAO,
        signer
      )

      const transaction = await caatDAOContract.vote(proposalId, support)

      setDaoStatus('Voto enviado. Aguardando confirmação na blockchain...')

      await transaction.wait()

      await loadDaoData(provider, walletAddress)

      setDaoStatus('Voto registrado com sucesso na CaatDAO!')
    } catch (error) {
      console.error('Erro ao votar na proposta:', error)
      setDaoStatus(
        'Não foi possível registrar o voto. Você pode já ter votado ou a proposta pode estar inativa.'
      )
    } finally {
      setIsVoting(false)
    }
  }

  async function closeProposal(proposalId: number) {
    try {
      if (!window.ethereum) {
        setDaoStatus('MetaMask não encontrada.')
        return
      }

      if (!walletAddress) {
        setDaoStatus('Conecte sua carteira antes de encerrar uma proposta.')
        return
      }

      setIsClosingProposal(true)
      setDaoStatus('Aguardando confirmação para encerrar a proposta...')

      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      const caatDAOContract = new Contract(
        CONTRACT_ADDRESSES.caatDAO,
        CONTRACT_ABIS.caatDAO,
        signer
      )

      const transaction = await caatDAOContract.closeProposal(proposalId)

      setDaoStatus(
        'Encerramento enviado. Aguardando confirmação na blockchain...'
      )

      await transaction.wait()

      await loadDaoData(provider, walletAddress)

      setDaoStatus('Proposta encerrada com sucesso na CaatDAO!')
    } catch (error) {
      console.error('Erro ao encerrar proposta:', error)
      setDaoStatus(
        'Não foi possível encerrar a proposta. Verifique se esta carteira é a dona do contrato.'
      )
    } finally {
      setIsClosingProposal(false)
    }
  }

  function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
  <main className="caatverse-container">
    <section className="hero-card">
      <span className="project-tag">Web3 • Caatinga • Governança</span>

      <h1>CaatVerse</h1>

      <p className="project-description">
        Uma experiência Web3 que une educação ambiental, NFTs, staking e
        participação comunitária em um ecossistema inspirado na Caatinga.
      </p>

      <button className="wallet-button" onClick={connectWallet}>
        {walletAddress ? 'Carteira conectada' : 'Conectar MetaMask'}
      </button>

      <p className="status-message">{statusMessage}</p>
    </section>

    {walletAddress && (
      <section className="dashboard-grid">
        <div className="section-card">
          <h2>Carteira</h2>

          <div className="info-row">
            <span>Conta ativa</span>
            <strong>{formatAddress(walletAddress)}</strong>
          </div>

          <div className="info-row">
            <span>Rede</span>
            <strong>{networkName}</strong>
          </div>
        </div>

        {tokenName && (
          <div className="section-card">
            <h2>Token do ecossistema</h2>

            <div className="info-row">
              <span>Nome</span>
              <strong>{tokenName}</strong>
            </div>

            <div className="info-row">
              <span>Símbolo</span>
              <strong>{tokenSymbol}</strong>
            </div>

            <div className="info-row">
              <span>Seu saldo</span>
              <strong>
                {tokenBalance} {tokenSymbol}
              </strong>
            </div>
          </div>
        )}

        <div className="section-card">
          <h2>Mintar NFT</h2>

          <p className="section-description">
            Crie um colecionável digital inspirado na Caatinga usando uma URI
            de metadados.
          </p>

          <label htmlFor="tokenURI">URI do NFT</label>

          <div className="form-row">
            <input
              id="tokenURI"
              type="text"
              value={nftTokenURI}
              onChange={(event) => setNftTokenURI(event.target.value)}
            />

            <button
              className="wallet-button"
              onClick={mintNFT}
              disabled={isMinting}
            >
              {isMinting ? 'Mintando...' : 'Mintar NFT'}
            </button>
          </div>

          {mintStatus && <p className="status-message">{mintStatus}</p>}
        </div>

        <div className="section-card">
          <h2>Staking do CaatVerse</h2>

          <div className="info-row">
            <span>Taxa atual</span>
            <strong>{currentRewardRate}% ao ano</strong>
          </div>

          <div className="info-row">
            <span>Saldo em staking</span>
            <strong>{stakedBalance} CAAT</strong>
          </div>

          <div className="info-row">
            <span>Recompensa acumulada</span>
            <strong>{pendingReward} CAAT</strong>
          </div>

          <label htmlFor="stakingAmount">Quantidade de CAAT</label>

          <div className="form-row">
            <input
              id="stakingAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex.: 100"
              value={stakingAmount}
              onChange={(event) => setStakingAmount(event.target.value)}
            />
          </div>

          <div className="action-row">
            <button
              className="wallet-button"
              onClick={approveStakingTokens}
              disabled={isApproving}
            >
              {isApproving ? 'Aprovando...' : 'Aprovar CAAT'}
            </button>

            <button
              className="wallet-button"
              onClick={stakeTokens}
              disabled={isStaking}
            >
              {isStaking ? 'Realizando staking...' : 'Fazer staking'}
            </button>

            <button
              className="wallet-button"
              onClick={withdrawTokens}
              disabled={isWithdrawing}
            >
              {isWithdrawing ? 'Sacando...' : 'Sacar tokens'}
            </button>

            <button
              className="wallet-button"
              onClick={claimStakingReward}
              disabled={isClaimingReward}
            >
              {isClaimingReward ? 'Resgatando...' : 'Resgatar recompensas'}
            </button>
          </div>

          {stakingStatus && <p className="status-message">{stakingStatus}</p>}
        </div>

        <div className="section-card full-width">
          <h2>Governança CaatDAO</h2>

          <p className="section-description">
            Crie propostas e participe das decisões do ecossistema com seus
            tokens CAAT.
          </p>

          <label htmlFor="proposalDescription">Nova proposta</label>

          <div className="form-row">
            <input
              id="proposalDescription"
              type="text"
              placeholder="Ex.: Criar uma nova coleção sobre o Mandacaru"
              value={proposalDescription}
              onChange={(event) => setProposalDescription(event.target.value)}
            />

            <button
              className="wallet-button"
              onClick={createProposal}
              disabled={isCreatingProposal}
            >
              {isCreatingProposal ? 'Criando...' : 'Criar proposta'}
            </button>
          </div>

          {daoStatus && <p className="status-message">{daoStatus}</p>}

          <h3>Propostas</h3>

          {proposals.length === 0 ? (
            <p>Nenhuma proposta criada até o momento.</p>
          ) : (
            <div className="proposals-grid">
              {proposals.map((proposal) => (
                <div className="proposal-card" key={proposal.id}>
                  <h3>Proposta #{proposal.id}</h3>

                  <p>{proposal.description}</p>

                  <div className="info-row">
                    <span>Status</span>
                    <strong>{proposal.active ? 'Ativa' : 'Encerrada'}</strong>
                  </div>

                  <div className="info-row">
                    <span>Votos a favor</span>
                    <strong>{proposal.votesFor} CAAT</strong>
                  </div>

                  <div className="info-row">
                    <span>Votos contra</span>
                    <strong>{proposal.votesAgainst} CAAT</strong>
                  </div>

                  <div className="info-row">
                    <span>Seu voto</span>
                    <strong>
                      {proposal.hasUserVoted
                        ? 'Já registrado'
                        : 'Ainda não votou'}
                    </strong>
                  </div>

                  <div className="action-row">
                    <button
                      className="wallet-button"
                      onClick={() => voteOnProposal(proposal.id, true)}
                      disabled={
                        isVoting || !proposal.active || proposal.hasUserVoted
                      }
                    >
                      Votar a favor
                    </button>

                    <button
                      className="wallet-button"
                      onClick={() => voteOnProposal(proposal.id, false)}
                      disabled={
                        isVoting || !proposal.active || proposal.hasUserVoted
                      }
                    >
                      Votar contra
                    </button>

                    <button
                      className="wallet-button"
                      onClick={() => closeProposal(proposal.id)}
                      disabled={isClosingProposal || !proposal.active}
                    >
                      {isClosingProposal
                        ? 'Encerrando...'
                        : 'Encerrar proposta'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    )}
  </main>
)
}

export default App