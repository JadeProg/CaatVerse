import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { network } from "hardhat";

const { viem, networkHelpers } = await network.create();

describe("CaatNFT", function () {
  async function deployCaatNFTFixture() {
    const [owner] = await viem.getWalletClients();
    const ownerAddress = owner.account.address;

    const caatNFT = await viem.deployContract("CaatNFT", [ownerAddress]);

    return {
      owner,
      ownerAddress,
      caatNFT,
    };
  }

  it("Deve mintar uma NFT para o endereco informado", async function () {
    const { caatNFT, ownerAddress } =
      await networkHelpers.loadFixture(deployCaatNFTFixture);

    await caatNFT.write.mintNFT([
      ownerAddress,
      "ipfs://mandacaru-metadata.json",
    ]);

    const nftOwner = await caatNFT.read.ownerOf([0n]);

    assert.equal(nftOwner.toLowerCase(), ownerAddress.toLowerCase());
  });

  it("Deve salvar corretamente a tokenURI da NFT", async function () {
    const { caatNFT, ownerAddress } =
      await networkHelpers.loadFixture(deployCaatNFTFixture);

    const tokenURI = "ipfs://xiquexique-metadata.json";

    await caatNFT.write.mintNFT([ownerAddress, tokenURI]);

    const savedTokenURI = await caatNFT.read.tokenURI([0n]);

    assert.equal(savedTokenURI, tokenURI);
  });
});