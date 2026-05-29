import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { viem, networkHelpers } = await network.create();

describe("CaatDAO", function () {
  async function deployCaatDAOFixture() {
    const [owner] = await viem.getWalletClients();
    const ownerAddress = owner.account.address;

    const caatToken = await viem.deployContract("CaatToken", [ownerAddress]);

    const caatDAO = await viem.deployContract("CaatDAO", [
      caatToken.address,
      ownerAddress,
    ]);

    return {
      owner,
      ownerAddress,
      caatToken,
      caatDAO,
    };
  }

  it("Deve criar uma proposta", async function () {
    const { caatDAO } =
      await networkHelpers.loadFixture(deployCaatDAOFixture);

    await caatDAO.write.createProposal([
      "A proxima NFT em destaque deve ser o Mandacaru?",
    ]);

    const totalProposals = await caatDAO.read.totalProposals();

    assert.equal(totalProposals, 1n);
  });

  it("Deve permitir voto de quem possui CAAT", async function () {
    const { caatDAO, caatToken, ownerAddress } =
      await networkHelpers.loadFixture(deployCaatDAOFixture);

    await caatDAO.write.createProposal([
      "A proxima experiencia do CaatVerse deve destacar o Juazeiro?",
    ]);

    const ownerBalance = await caatToken.read.balanceOf([ownerAddress]);

    await caatDAO.write.vote([0n, true]);

    const proposal = await caatDAO.read.proposals([0n]);

    assert.equal(proposal[1], ownerBalance);
    assert.equal(proposal[2], 0n);
  });

  it("Deve permitir encerrar uma proposta", async function () {
    const { caatDAO } =
      await networkHelpers.loadFixture(deployCaatDAOFixture);

    await caatDAO.write.createProposal([
      "A comunidade deve priorizar conteudos sobre preservacao da Caatinga?",
    ]);

    await caatDAO.write.closeProposal([0n]);

    const proposal = await caatDAO.read.proposals([0n]);

    assert.equal(proposal[3], false);
  });
});