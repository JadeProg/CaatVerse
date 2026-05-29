import CaatTokenArtifact from "./abis/CaatToken.json";
import CaatNFTArtifact from "./abis/CaatNFT.json";
import CaatOracleArtifact from "./abis/CaatOracle.json";
import CaatDAOArtifact from "./abis/CaatDAO.json";
import CaatStakingArtifact from "./abis/CaatStaking.json";

export const CONTRACT_ABIS = {
  caatToken: CaatTokenArtifact.abi,
  caatNFT: CaatNFTArtifact.abi,
  caatOracle: CaatOracleArtifact.abi,
  caatDAO: CaatDAOArtifact.abi,
  caatStaking: CaatStakingArtifact.abi,
} as const;