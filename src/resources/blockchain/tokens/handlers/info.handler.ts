/**
 * Token Information Handler
 *
 * This file contains the complex business logic for retrieving token information.
 * Uses ethers.js to query ERC-20 token contracts for metadata.
 *
 * Handles:
 * - Token name, symbol, decimals retrieval
 * - Token contract address validation
 * - Token metadata fetching
 * - Token contract interaction
 *
 * All token information query logic is isolated here.
 */

import { Contract } from "ethers";
import type { JsonRpcProvider } from "ethers";
import type { Token, Network } from "../../wallets/wallets.types";
import type { TokenInfo } from "../tokens.types";

/**
 * Token address mappings per network
 *
 * Maps token identifiers to their contract addresses for each network.
 * This is a configuration that should be maintained and updated as needed.
 */
const TOKEN_ADDRESSES: Record<Network, Record<Token, string>> = {
  ethereum: {
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    eurc: "0x1aBaEA1f7C830bD89Acc34eC0Edb2BD8a7482088",
  },
  polygon: {
    usdc: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    usdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    eurc: "0xE111178A87A3BFf0c8d18DECBa5798827539Ae99",
  },
  base: {
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    usdt: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    eurc: "0x1aBaEA1f7C830bD89Acc34eC0Edb2BD8a7482088",
  },
  arbitrum: {
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    usdt: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    eurc: "0x1aBaEA1f7C830bD89Acc34eC0Edb2BD8a7482088",
  },
  optimism: {
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    usdt: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    eurc: "0x1aBaEA1f7C830bD89Acc34eC0Edb2BD8a7482088",
  },
  solana: {
    usdc: "", // Solana uses different address format
    usdt: "",
    eurc: "",
  },
  tron: {
    usdc: "", // Tron uses different address format
    usdt: "",
    eurc: "",
  },
};

/**
 * Get token contract address for a network
 *
 * Retrieves the contract address for a token on a specific network.
 *
 * @param token - The token identifier (usdc, usdt, eurc)
 * @param network - The network identifier
 * @returns The token contract address
 *
 * @throws {Error} If token or network is not supported
 *
 * @example
 * ```typescript
 * const address = getTokenAddressHandler('usdc', 'polygon');
 * console.log(address); // "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
 * ```
 */
export function getTokenAddressHandler(token: Token, network: Network): string {
  const address = TOKEN_ADDRESSES[network]?.[token];

  if (!address) {
    throw new Error(
      `Token ${token} is not supported on network ${network} or address not configured`
    );
  }

  return address;
}

/**
 * Get token information (name, symbol, decimals) from contract
 *
 * Queries the ERC-20 token contract for its metadata.
 *
 * @param tokenAddress - The ERC-20 token contract address
 * @param provider - The ethers.js provider instance
 * @param network - The network identifier
 * @param token - Optional token identifier (usdc, usdt, eurc) for type safety
 * @returns Promise resolving to token information
 *
 * @throws {Error} If the provider is not connected, token contract is invalid, or contract doesn't implement ERC-20
 *
 * @example
 * ```typescript
 * const info = await getTokenInfoHandler(
 *   '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
 *   provider,
 *   'polygon',
 *   'usdc'
 * );
 * console.log(info.name); // "USD Coin"
 * console.log(info.symbol); // "USDC"
 * console.log(info.decimals); // 6
 * ```
 */
export async function getTokenInfoHandler(
  tokenAddress: string,
  provider: JsonRpcProvider,
  network: Network,
  token?: Token
): Promise<TokenInfo> {
  // ERC-20 token standard ABI
  const erc20Abi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ];

  // Create contract instance
  const tokenContract = new Contract(tokenAddress, erc20Abi, provider);

  // Get token info functions
  const nameFunction = tokenContract.getFunction("name");
  const symbolFunction = tokenContract.getFunction("symbol");
  const decimalsFunction = tokenContract.getFunction("decimals");

  if (!nameFunction || !symbolFunction || !decimalsFunction) {
    throw new Error(
      "Token contract does not implement required ERC-20 functions"
    );
  }

  // Get token info in parallel
  const [name, symbol, decimals] = await Promise.all([
    nameFunction(),
    symbolFunction(),
    decimalsFunction(),
  ]);

  // Determine token from address if not provided
  // Check if address matches known token addresses
  let detectedToken: Token | undefined = token;
  if (!detectedToken) {
    for (const [tokenId, address] of Object.entries(
      TOKEN_ADDRESSES[network] || {}
    )) {
      if (address.toLowerCase() === tokenAddress.toLowerCase()) {
        detectedToken = tokenId as Token;
        break;
      }
    }
  }

  // Default to usdc if cannot be determined
  const finalToken: Token = detectedToken || "usdc";

  return {
    token: finalToken,
    name,
    symbol,
    decimals: Number(decimals),
    address: tokenAddress,
    network,
  };
}

/**
 * Validate token contract address
 *
 * Validates that an address is a valid ERC-20 token contract by checking
 * if it implements the required ERC-20 functions.
 *
 * @param address - The address to validate
 * @param provider - The ethers.js provider instance
 * @returns Promise resolving to true if valid token contract, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await validateTokenAddressHandler(
 *   '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
 *   provider
 * );
 * ```
 */
export async function validateTokenAddressHandler(
  address: string,
  provider: JsonRpcProvider,
  network: Network
): Promise<boolean> {
  try {
    // Try to get token info - if it succeeds, it's a valid token contract
    await getTokenInfoHandler(address, provider, network);
    return true;
  } catch {
    return false;
  }
}
