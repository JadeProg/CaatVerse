import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { viem, networkHelpers } = await network.create();

describe("CaatToken", function () {
  async function deployCaatTokenFixture() {
    const [owner, user] = await viem.getWalletClients();

    const ownerAddress = owner.account.address;
    const userAddress = user.account.address;

    const caatToken = await viem.deployContract("CaatToken", [ownerAddress]);

    return {
      owner,
      user,
      ownerAddress,
      userAddress,
      caatToken,
    };
  }

  it("Deve enviar o supply inicial para o dono do contrato", async function () {
    const { caatToken, ownerAddress } =
      await networkHelpers.loadFixture(deployCaatTokenFixture);

    const ownerBalance = await caatToken.read.balanceOf([ownerAddress]);
    const totalSupply = await caatToken.read.totalSupply();

    assert.equal(ownerBalance, totalSupply);
    assert.equal(totalSupply, 1_000_000n * 10n ** 18n);
  });

  it("Deve permitir que o dono crie novos tokens", async function () {
    const { caatToken, userAddress } =
      await networkHelpers.loadFixture(deployCaatTokenFixture);

    const mintAmount = 500n * 10n ** 18n;

    await caatToken.write.mint([userAddress, mintAmount]);

    const userBalance = await caatToken.read.balanceOf([userAddress]);

    assert.equal(userBalance, mintAmount);
  });
});