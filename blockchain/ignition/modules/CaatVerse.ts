import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("CaatVerseModule", (m) => {
  const deployer = m.getAccount(0);

  const ethUsdPriceFeed = m.getParameter("ethUsdPriceFeed");

  const caatToken = m.contract("CaatToken", [deployer]);

  const caatNFT = m.contract("CaatNFT", [deployer]);

  const caatOracle = m.contract("CaatOracle", [ethUsdPriceFeed]);

  const caatStaking = m.contract("CaatStaking", [
    caatToken,
    caatOracle,
    deployer,
  ]);

  const caatDAO = m.contract("CaatDAO", [
    caatToken,
    deployer,
  ]);

  return {
    caatToken,
    caatNFT,
    caatOracle,
    caatStaking,
    caatDAO,
  };
});