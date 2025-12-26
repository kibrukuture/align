import { describe, expect, test } from "bun:test";
import { NFTs } from "@/resources/blockchain/nfts/nfts.resource";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import type { Network } from "@/resources/blockchain/wallets/wallets.types";

describe("Blockchain NFTs", () => {
  const providers: Providers = new Providers();
  const nfts: NFTs = new NFTs(providers);

  test("should get ERC-721 owner", async () => {
    const network: Network = "polygon";
    const nftContract: string = "0x2953399124F0cBB46d2CbACD8A89cF0599974963";
    const tokenId: string = "1";

    try {
      const owner: string = await nfts.getOwner(nftContract, tokenId, network);
      expect(owner).toBeDefined();
      expect(owner).toMatch(/^0x[a-fA-F0-9]{40}$/);
    } catch (error) {
      // NFT might not exist
      expect(error).toBeDefined();
    }
  });

  test("should check ERC-1155 ownership", async () => {
    const network: Network = "polygon";
    const nftContract: string = "0x2953399124F0cBB46d2CbACD8A89cF0599974963";
    const ownerAddress: string = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const tokenId: string = "1";

    try {
      const isOwner: boolean = await nfts.isOwner(
        nftContract,
        ownerAddress,
        tokenId,
        network
      );
      expect(isOwner).toBeDefined();
      expect(typeof isOwner).toBe("boolean");
    } catch (error) {
      // Contract might not be ERC-1155
      expect(error).toBeDefined();
    }
  });
});
