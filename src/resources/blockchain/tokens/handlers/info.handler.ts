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
import type { Token, Network } from "@/resources/blockchain/wallets/wallets.types";
import type { TokenInfo } from "@/resources/blockchain/tokens/tokens.types";

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
 * Retrieves the contract address for a known token on a specific network
 *
 * Uses the internal configuration to look up the correct contract address for supported tokens
 * (USDC, USDT, EURC) on supported networks (Ethereum, Polygon, Base, etc.).
 *
 * This helper ensures you're always using the official, verified contract address for
 * major stablecoins, avoiding the risk of interacting with fake or malicious tokens.
 *
 * **Supported Tokens:**
 * - USDC (USD Coin)
 * - USDT (Tether)
 * - EURC (Euro Coin)
 *
 * **Supported Networks:**
 * - Ethereum Mainnet
 * - Polygon (POS)
 * - Base
 * - Arbitrum One
 * - Optimism
 *
 * @param {Token} token - The token identifier
 *   Values: "usdc" | "usdt" | "eurc"
 *
 * @param {Network} network - The blockchain network identifier
 *   Values: "ethereum" | "polygon" | "base" | "arbitrum" | "optimism"
 *
 * @returns {string} The official contract address for the token
 *   Example: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"
 *
 * @throws {Error} If:
 *   - The token is not supported on the specified network
 *   - The network is not configured
 *   - The address is missing from configuration
 *
 * @example
 * Getting USDC address on Polygon
 * ```typescript
 * const address = getTokenAddress("usdc", "polygon");
 * console.log(address);
 * // Output: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
 * ```
 *
 * @example
 * Dynamic token lookup
 * ```typescript
 * function getStablecoinAddresses(network: Network) {
 *   return {
 *     USDC: getTokenAddress("usdc", network),
 *     USDT: getTokenAddress("usdt", network),
 *   };
 * }
 * ```
 */
export function getTokenAddress(token: Token, network: Network): string {
  const address = TOKEN_ADDRESSES[network]?.[token];

  if (!address) {
    throw new Error(
      `Token ${token} is not supported on network ${network} or address not configured`
    );
  }

  return address;
}

/**
 * Retrieves metadata (name, symbol, decimals) from an ERC-20 token contract
 *
 * Queries the blockchain to read the standard ERC-20 metadata functions from a contract.
 * This is useful for:
 * - Validating that an address is actually a token contract
 * - Getting the correct decimal places for balance formatting
 * - Displaying token details in the UI
 *
 * The function also attempts to identify if the token is one of the supported stablecoins
 * (USDC, USDT, EURC) by checking against the internal address registry.
 *
 * **Metadata Retrieved:**
 * - `name`: Full name (e.g., "USD Coin")
 * - `symbol`: Ticker symbol (e.g., "USDC")
 * - `decimals`: Number of decimal places (e.g., 6)
 *
 * @param {string} tokenAddress - The ERC-20 token contract address
 *   Must be a valid contract address on the connected network
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the network where the token exists
 *
 * @param {Network} network - The blockchain network identifier
 *   Used to cross-reference with known token addresses
 *
 * @param {Token} [token] - Optional known token identifier
 *   If provided, forces the result to use this identifier
 *
 * @returns {Promise<TokenInfo>} A promise that resolves to the token information object
 *   Contains: token, name, symbol, decimals, address, network
 *
 * @throws {Error} If:
 *   - Provider is not connected
 *   - Contract address is invalid
 *   - Contract does not implement ERC-20 standard functions (name, symbol, decimals)
 *   - Network RPC error
 *
 * @example
 * Getting info for a known token
 * ```typescript
 * const provider = new JsonRpcProvider("https://polygon-rpc.com");
 * const usdcAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
 * 
 * const info = await getTokenInfo(
 *   usdcAddress,
 *   provider,
 *   "polygon"
 * );
 * 
 * console.log(`${info.name} (${info.symbol})`);
 * console.log(`Decimals: ${info.decimals}`);
 * // Output:
 * // USD Coin (USDC)
 * // Decimals: 6
 * ```
 *
 * @example
 * Getting info for an unknown custom token
 * ```typescript
 * const customTokenAddress = "0x..."; // Some random token
 * const info = await getTokenInfo(customTokenAddress, provider, "ethereum");
 * 
 * console.log(`Found token: ${info.symbol}`);
 * // Output: Found token: PEPE
 * ```
 */
export async function getTokenInfo(
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
 * Validates if an address is a valid ERC-20 token contract
 *
 * Checks if the address exists on-chain and implements the required ERC-20 standard functions
 * (name, symbol, decimals). This is useful for verifying user input before attempting
 * token transfers or other operations.
 *
 * This is a "duck typing" check - if it walks like a token and quacks like a token,
 * we treat it as a token.
 *
 * @param {string} address - The contract address to validate
 *   Must be a valid Ethereum-style address
 *
 * @param {JsonRpcProvider} provider - Connected ethers.js JSON-RPC provider
 *   Must be connected to the network where the address exists
 *
 * @param {Network} network - The blockchain network identifier
 *
 * @returns {Promise<boolean>} A promise that resolves to:
 *   - `true`: If the address is a valid ERC-20 token contract
 *   - `false`: If the address is not a contract, or doesn't implement ERC-20
 *
 * @example
 * Validating user input
 * ```typescript
 * const userInput = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
 * const isValid = await validateTokenAddress(userInput, provider, "polygon");
 * 
 * if (isValid) {
 *   console.log("Valid token contract");
 * } else {
 *   console.log("Invalid token address");
 * }
 * ```
 *
 * @example
 * checking if address is a token or wallet
 * ```typescript
 * async function checkAddressType(address: string, provider: JsonRpcProvider) {
 *   // Check if it's a token
 *   const isToken = await validateTokenAddress(address, provider, "ethereum");
 *   if (isToken) return "token";
 *   
 *   // Check if it's a wallet (has code?)
 *   const code = await provider.getCode(address);
 *   return code === "0x" ? "wallet" : "contract";
 * }
 * ```
 */
export async function validateTokenAddress(
  address: string,
  provider: JsonRpcProvider,
  network: Network
): Promise<boolean> {
  try {
    // Try to get token info - if it succeeds, it's a valid token contract
    await getTokenInfo(address, provider, network);
    return true;
  } catch {
    return false;
  }
}
