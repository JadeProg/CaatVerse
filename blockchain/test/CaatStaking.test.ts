import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { viem, networkHelpers } = await network.create();

describe("CaatStaking", function () {
  async function deployCaatStakingFixture() {
    const [owner] = await viem.getWalletClients();
    const ownerAddress = owner.account.address;

    const caatToken = await viem.deployContract("CaatToken", [ownerAddress]);

    const mockPriceFeed = await viem.deployContract("MockPriceFeed", [
      8,
      2500n * 10n ** 8n,
    ]);

    const caatOracle = await viem.deployContract("CaatOracle", [
      mockPriceFeed.address,
    ]);

    const caatStaking = await viem.deployContract("CaatStaking", [
      caatToken.address,
      caatOracle.address,
      ownerAddress,
    ]);

    return {
      caatToken,
      mockPriceFeed,
      caatOracle,
      caatStaking,
    };
  }

  it("Deve retornar taxa de 4% quando ETH estiver em ate US$ 3000", async function () {
    const { caatStaking } =
      await networkHelpers.loadFixture(deployCaatStakingFixture);

    const rewardRate = await caatStaking.read.getCurrentRewardRate();

    assert.equal(rewardRate, 4n);
  });

  it("Deve retornar taxa de 6% quando ETH estiver acima de US$ 3000", async function () {
    const { caatStaking, mockPriceFeed } =
      await networkHelpers.loadFixture(deployCaatStakingFixture);

    await mockPriceFeed.write.updatePrice([3500n * 10n ** 8n]);

    const rewardRate = await caatStaking.read.getCurrentRewardRate();

    assert.equal(rewardRate, 6n);
  });
});