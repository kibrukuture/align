import { AlignValidationError } from "@/core/errors";
import { formatZodError } from "@/core/validation";
import { Providers } from "@/resources/blockchain/providers/providers.resource";
import * as Handlers from "@/resources/blockchain/transactions/handlers";
import type {
  Transaction,
  TransactionStatus,
  GasEstimate,
  TransactionReceiptData,
} from "@/resources/blockchain/transactions/transactions.types";
import {
  SendTransactionSchema,
  SendTokenTransactionSchema,
  GasEstimateRequestSchema,
  TransactionStatusRequestSchema,
} from "@/resources/blockchain/transactions/transactions.validator";
import type {
  Wallet as SDKWallet,
  Network,
  Token,
} from "@/resources/blockchain/wallets/wallets.types";
import { getTokenAddress } from "@/resources/blockchain/tokens/handlers/info.handler";

/**
 * Transactions
 *
 * The main entry point for transaction-related operations in the SDK.
 * This class acts as a facade/orchestrator that:
 * 1. Validates user inputs using Zod schemas
 * 2. Manages dependencies (like Providers)
 * 3. Delegates complex business logic to specialized handlers
 * 4. Standardizes error handling
 *
 * **Key Features:**
 * - Sending native transactions (ETH, MATIC)
 * - Sending ERC-20 token transactions (USDC, USDT)
 * - Gas estimation and cost calculation
 * - Transaction status monitoring
 * - Confirmation waiting
 *
 * @example
 * Initialize the resource
 * ```typescript
 * import Align from '@tolbel/align';
 *
 * const align = new Align({ apiKey: '...' });
 * const transactions = align.blockchain.transactions;
 * ```
 */
export class Transactions {
  constructor(private providers: Providers) {}

  /**
   * Sends a native token transaction (ETH, MATIC, etc.).
   *
   * This method sends the blockchain's native currency from one address to another.
   * Native tokens are the base currency of each chain (ETH on Ethereum, MATIC on Polygon, etc.).
   * This is the simplest type of transaction - just sending value from A to B.
   *
   * **What This Does:**
   * 1. Takes your wallet, recipient address, and amount
   * 2. Creates and signs a transaction using your wallet's private key
   * 3. Broadcasts the transaction to the blockchain network
   * 4. Returns immediately with the transaction hash (doesn't wait for confirmation)
   *
   * **Native Tokens by Network:**
   * - Ethereum: ETH (18 decimals)
   * - Polygon: MATIC (18 decimals)
   * - Base: ETH (18 decimals)
   * - Arbitrum: ETH (18 decimals)
   * - Optimism: ETH (18 decimals)
   *
   * **How It Works:**
   * - The wallet must have sufficient balance to cover: amount + gas fees
   * - Gas fees are paid in the native token
   * - Transaction is broadcast immediately but takes time to confirm
   * - Use `waitForConfirmation()` to wait for the transaction to be mined
   *
   * **Gas Considerations:**
   * - Native token transfers typically cost ~21,000 gas
   * - Total cost = gas limit × gas price
   * - Ensure wallet has enough for both amount AND gas
   * - Use `estimateGas()` to preview costs before sending
   *
   * @param {SDKWallet} wallet - The sender's wallet object (must contain private key)
   * @param {string} to - The recipient's address (must be a valid Ethereum address)
   * @param {string} amount - Amount to send in human-readable format (e.g., "0.1" for 0.1 ETH)
   * @param {Network} network - The network to use ("ethereum", "polygon", "base", etc.)
   *
   * @returns {Promise<Transaction>} The submitted transaction object containing:
   *          - hash: Transaction hash for tracking
   *          - from: Sender address
   *          - to: Recipient address
   *          - value: Amount sent in wei
   *          - gasLimit: Gas limit for the transaction
   *          - gasPrice: Gas price used
   *
   * @throws {AlignValidationError} If inputs are invalid (bad address, negative amount, etc.)
   * @throws {Error} If wallet has insufficient balance or transaction fails
   *
   * @example
   * Send ETH on Ethereum
   * ```typescript
   * const wallet = await align.blockchain.wallets.create();
   *
   * const tx = await align.blockchain.transactions.sendNativeToken(
   *   wallet,
   *   "0xRecipient...",
   *   "0.1", // 0.1 ETH
   *   "ethereum"
   * );
   *
   * console.log(`Transaction sent: ${tx.hash}`);
   *
   * // Wait for confirmation
   * const receipt = await align.blockchain.transactions.waitForConfirmation(
   *   tx.hash,
   *   "ethereum",
   *   1 // Wait for 1 confirmation
   * );
   * console.log(`Confirmed in block ${receipt.blockNumber}`);
   * ```
   *
   * @example
   * Send MATIC on Polygon
   * ```typescript
   * const tx = await align.blockchain.transactions.sendNativeToken(
   *   wallet,
   *   "0xRecipient...",
   *   "10.0", // 10 MATIC
   *   "polygon"
   * );
   * ```
   *
   * @example
   * Check balance before sending
   * ```typescript
   * const balance = await align.blockchain.wallets.getBalance(
   *   wallet.address,
   *   "ethereum"
   * );
   *
   * if (parseFloat(balance) >= 0.1) {
   *   const tx = await align.blockchain.transactions.sendNativeToken(
   *     wallet,
   *     "0xRecipient...",
   *     "0.1",
   *     "ethereum"
   *   );
   * }
   * ```
   */
  public async sendNativeToken(
    wallet: SDKWallet,
    to: string,
    amount: string,
    network: Network
  ): Promise<Transaction> {
    // Validate inputs
    const validation = SendTransactionSchema.safeParse({ to, amount, network });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid transaction data",
        formatZodError(validation.error)
      );
    }
    const parsed = validation.data;

    // Get provider
    const provider = this.providers.getProvider(parsed.network);

    // Call handler for complex logic
    return Handlers.sendNativeToken(wallet, parsed.to, parsed.amount, provider);
  }

  /**
   * Sends an ERC-20 token transaction.
   *
   * This method transfers ERC-20 tokens (like USDC, USDT, DAI) from one address to another.
   * ERC-20 is the standard for fungible tokens on Ethereum and EVM-compatible chains.
   * Unlike native tokens, ERC-20 transfers interact with a smart contract.
   *
   * **What This Does:**
   * 1. Takes your wallet, token identifier, recipient, and amount
   * 2. Resolves the token contract address for the specified network
   * 3. Creates a contract interaction to call the `transfer` function
   * 4. Signs and broadcasts the transaction
   * 5. Returns immediately with the transaction hash
   *
   * **Supported Tokens:**
   * - USDC: USD Coin (stablecoin, 6 decimals)
   * - USDT: Tether (stablecoin, 6 decimals)
   * - EURC: Euro Coin (stablecoin, 6 decimals)
   * - Or any ERC-20 token by contract address
   *
   * **How It Works:**
   * - Calls the token contract's `transfer(address to, uint256 amount)` function
   * - Gas fees are paid in the native token (ETH, MATIC, etc.)
   * - The amount is automatically converted to the token's decimal format
   * - Wallet must have both: enough tokens AND enough native tokens for gas
   *
   * **Gas Considerations:**
   * - ERC-20 transfers cost more gas than native transfers (~50,000-65,000 gas)
   * - Gas is paid in native tokens (ETH, MATIC), NOT in the token being sent
   * - Different tokens may have different gas costs (some have transfer fees)
   * - Use `estimateGas()` to preview costs
   *
   * **Important Notes:**
   * - Amount is in human-readable format (e.g., "100.5" for 100.5 USDC)
   * - SDK automatically handles decimal conversion (USDC has 6 decimals)
   * - Wallet must have approved the token contract (not needed for direct transfers)
   *
   * @param {SDKWallet} wallet - The sender's wallet object (must contain private key)
   * @param {Token} token - The token identifier ("usdc", "usdt", "eurc") or contract address
   * @param {string} to - The recipient's address (must be a valid Ethereum address)
   * @param {string} amount - Amount to send in human-readable format (e.g., "100.0" for 100 tokens)
   * @param {Network} network - The network to use ("ethereum", "polygon", "base", etc.)
   *
   * @returns {Promise<Transaction>} The submitted transaction object containing:
   *          - hash: Transaction hash for tracking
   *          - from: Sender address
   *          - to: Token contract address
   *          - data: Encoded transfer function call
   *          - gasLimit: Gas limit for the transaction
   *
   * @throws {AlignValidationError} If inputs are invalid
   * @throws {Error} If wallet has insufficient token balance, insufficient gas, or transaction fails
   *
   * @example
   * Send USDC on Polygon
   * ```typescript
   * const wallet = await align.blockchain.wallets.create();
   *
   * const tx = await align.blockchain.transactions.sendToken(
   *   wallet,
   *   "usdc",
   *   "0xRecipient...",
   *   "50.0", // 50 USDC
   *   "polygon"
   * );
   *
   * console.log(`USDC transfer sent: ${tx.hash}`);
   *
   * // Wait for confirmation
   * const receipt = await align.blockchain.transactions.waitForConfirmation(
   *   tx.hash,
   *   "polygon"
   * );
   * ```
   *
   * @example
   * Send USDT on Ethereum
   * ```typescript
   * const tx = await align.blockchain.transactions.sendToken(
   *   wallet,
   *   "usdt",
   *   "0xRecipient...",
   *   "1000.0", // 1000 USDT
   *   "ethereum"
   * );
   * ```
   *
   * @example
   * Check token balance before sending
   * ```typescript
   * const balance = await align.blockchain.tokens.getBalance(
   *   wallet.address,
   *   "usdc",
   *   "polygon"
   * );
   *
   * if (parseFloat(balance) >= 50) {
   *   const tx = await align.blockchain.transactions.sendToken(
   *     wallet,
   *     "usdc",
   *     "0xRecipient...",
   *     "50.0",
   *     "polygon"
   *   );
   * }
   * ```
   */
  public async sendToken(
    wallet: SDKWallet,
    token: Token,
    to: string,
    amount: string,
    network: Network
  ): Promise<Transaction> {
    // Validate inputs
    const validation = SendTokenTransactionSchema.safeParse({
      token,
      to,
      amount,
      network,
    });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid transaction data",
        formatZodError(validation.error)
      );
    }

    // Get provider
    const parsed = validation.data;
    const provider = this.providers.getProvider(parsed.network);

    // Resolve token contract address
    const tokenAddress = getTokenAddress(parsed.token, parsed.network);

    // Call handler for complex logic
    return Handlers.sendToken(
      wallet,
      tokenAddress,
      parsed.to,
      parsed.amount,
      provider
    );
  }

  /**
   * Estimates the gas cost for a transaction.
   *
   * This method calculates how much gas a transaction will consume and what it will cost
   * in the native token. This is essential for showing users the "Max Network Fee" before
   * they confirm a transaction.
   *
   * **What This Does:**
   * 1. Takes transaction details (from, to, amount, optional data)
   * 2. Simulates the transaction on the network without actually sending it
   * 3. Calculates the gas limit (how much gas is needed)
   * 4. Gets the current gas price from the network
   * 5. Returns the estimated cost in both wei and human-readable format
   *
   * **Why This Matters:**
   * - Users need to know fees before sending transactions
   * - Prevents "out of gas" errors by setting proper gas limits
   * - Helps users decide if gas prices are too high (wait for lower fees)
   * - Required for wallet UIs to show accurate fee estimates
   *
   * **How Gas Works:**
   * - **Gas Limit**: Maximum amount of gas the transaction can use
   * - **Gas Price**: Price per unit of gas (in gwei)
   * - **Total Cost**: gas limit × gas price (in native token)
   * - Different operations cost different amounts of gas
   *
   * **Gas Costs by Operation:**
   * - Native token transfer: ~21,000 gas
   * - ERC-20 transfer: ~50,000-65,000 gas
   * - Contract interactions: Varies widely (can be 100,000+)
   * - Complex DeFi operations: Can exceed 500,000 gas
   *
   * **Important Notes:**
   * - Estimates are not guaranteed (actual cost may vary slightly)
   * - Gas prices fluctuate based on network congestion
   * - Always add a small buffer (5-10%) to the estimate
   * - On EIP-1559 networks (Ethereum), uses maxFeePerGas
   *
   * @param {string} from - Sender address (must be a valid Ethereum address)
   * @param {string} to - Recipient address or contract address
   * @param {string} amount - Amount to send in human-readable format (e.g., "1.0")
   * @param {Network} network - Network to estimate on ("ethereum", "polygon", etc.)
   * @param {string} [data] - Optional transaction data (for contract interactions)
   *
   * @returns {Promise<GasEstimate>} Gas estimation details containing:
   *          - gasLimit: Estimated gas limit (as string)
   *          - gasPrice: Current gas price in wei (as string)
   *          - totalCost: Total cost in wei (gasLimit × gasPrice)
   *          - totalCostFormatted: Total cost in native token (e.g., "0.0042 ETH")
   *
   * @throws {AlignValidationError} If inputs are invalid
   * @throws {Error} If estimation fails (e.g., transaction would revert)
   *
   * @example
   * Estimate native token transfer
   * ```typescript
   * const estimate = await align.blockchain.transactions.estimateGas(
   *   "0xFrom...",
   *   "0xTo...",
   *   "1.0",
   *   "ethereum"
   * );
   *
   * console.log(`Estimated Fee: ${estimate.totalCostFormatted}`);
   * console.log(`Gas Limit: ${estimate.gasLimit}`);
   * console.log(`Gas Price: ${estimate.gasPrice} wei`);
   * ```
   *
   * @example
   * Show fee to user before transaction
   * ```typescript
   * const estimate = await align.blockchain.transactions.estimateGas(
   *   wallet.address,
   *   recipientAddress,
   *   "0.5",
   *   "polygon"
   * );
   *
   * const confirmed = confirm(
   *   `Send 0.5 MATIC?\nNetwork Fee: ${estimate.totalCostFormatted}`
   * );
   *
   * if (confirmed) {
   *   const tx = await align.blockchain.transactions.sendNativeToken(
   *     wallet,
   *     recipientAddress,
   *     "0.5",
   *     "polygon"
   *   );
   * }
   * ```
   *
   * @example
   * Estimate with contract data
   * ```typescript
   * const estimate = await align.blockchain.transactions.estimateGas(
   *   wallet.address,
   *   contractAddress,
   *   "0",
   *   "ethereum",
   *   "0xa9059cbb..." // Encoded function call
   * );
   * ```
   */
  public async estimateGas(
    from: string,
    to: string,
    amount: string,
    network: Network,
    data?: string
  ): Promise<GasEstimate> {
    // Validate inputs
    const validation = GasEstimateRequestSchema.safeParse({
      from,
      to,
      amount,
      network,
      data,
    });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid gas estimate data",
        formatZodError(validation.error)
      );
    }

    // Get provider
    const parsed = validation.data;
    const provider = this.providers.getProvider(parsed.network);

    // Estimate gas limit and price, then calculate total cost
    const gasLimit = await Handlers.estimateGas(
      parsed.from,
      parsed.to,
      parsed.amount,
      parsed.data,
      provider
    );

    const gasPrice = await Handlers.getGasPrice(provider);

    return Handlers.calculateTransactionCost(gasLimit, gasPrice);
  }

  /**
   * Gets the current status of a transaction.
   *
   * This method checks whether a transaction has been confirmed, is still pending,
   * or has failed. Use this to monitor transaction progress and update your UI accordingly.
   *
   * **What This Does:**
   * 1. Takes a transaction hash and network
   * 2. Queries the blockchain for the transaction receipt
   * 3. Returns the current status: "pending", "confirmed", or "failed"
   *
   * **Transaction Lifecycle:**
   * 1. **Pending**: Transaction broadcast but not yet mined
   * 2. **Confirmed**: Transaction included in a block (successful)
   * 3. **Failed**: Transaction reverted or ran out of gas
   *
   * **Status Meanings:**
   * - **"pending"**: Transaction is in the mempool, waiting to be mined
   * - **"confirmed"**: Transaction successfully executed and is in a block
   * - **"failed"**: Transaction was mined but execution failed (reverted)
   *
   * **When to Use This:**
   * - Poll this method to show transaction progress in your UI
   * - Check if a transaction completed before proceeding
   * - Verify transaction success before updating application state
   * - Debug why a transaction might be stuck
   *
   * **Important Notes:**
   * - Pending transactions can stay pending for minutes (or hours on congested networks)
   * - A transaction can be "confirmed" but still revert (status will be "failed")
   * - For critical operations, wait for multiple confirmations (use `waitForConfirmation`)
   * - Transaction can be dropped from mempool if gas price is too low
   *
   * @param {string} txHash - Transaction hash to check (66-character hex string starting with "0x")
   * @param {Network} network - Network where the transaction was sent
   *
   * @returns {Promise<TransactionStatus>} One of: "pending" | "confirmed" | "failed"
   *
   * @throws {AlignValidationError} If txHash or network is invalid
   * @throws {Error} If unable to query the network
   *
   * @example
   * Check transaction status
   * ```typescript
   * const tx = await align.blockchain.transactions.sendNativeToken(
   *   wallet,
   *   "0xRecipient...",
   *   "0.1",
   *   "polygon"
   * );
   *
   * const status = await align.blockchain.transactions.getStatus(
   *   tx.hash,
   *   "polygon"
   * );
   *
   * console.log(`Transaction status: ${status}`);
   * ```
   *
   * @example
   * Poll for status updates
   * ```typescript
   * const checkStatus = async (hash: string) => {
   *   const status = await align.blockchain.transactions.getStatus(hash, "ethereum");
   *
   *   if (status === "pending") {
   *     console.log("Still pending...");
   *     setTimeout(() => checkStatus(hash), 5000); // Check again in 5s
   *   } else if (status === "confirmed") {
   *     console.log("Transaction confirmed!");
   *   } else {
   *     console.log("Transaction failed!");
   *   }
   * };
   *
   * await checkStatus(tx.hash);
   * ```
   *
   * @example
   * Wait for confirmation before proceeding
   * ```typescript
   * const tx = await align.blockchain.transactions.sendToken(
   *   wallet,
   *   "usdc",
   *   "0xRecipient...",
   *   "100",
   *   "polygon"
   * );
   *
   * let status = "pending";
   * while (status === "pending") {
   *   await new Promise(resolve => setTimeout(resolve, 3000));
   *   status = await align.blockchain.transactions.getStatus(tx.hash, "polygon");
   * }
   *
   * if (status === "confirmed") {
   *   console.log("Payment confirmed!");
   *   // Update database, send confirmation email, etc.
   * }
   * ```
   */
  public async getStatus(
    txHash: string,
    network: Network
  ): Promise<TransactionStatus> {
    const validation = TransactionStatusRequestSchema.safeParse({
      txHash,
      network,
    });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid transaction status request",
        formatZodError(validation.error)
      );
    }

    const parsed = validation.data;
    const provider = this.providers.getProvider(parsed.network);

    return Handlers.getTransactionStatus(parsed.txHash, provider);
  }

  /**
   * Waits for a transaction to be confirmed.
   *
   * This method blocks execution until a transaction reaches the specified number of
   * confirmations. This is essential for ensuring transaction finality before proceeding
   * with dependent operations.
   *
   * **What This Does:**
   * 1. Takes a transaction hash, network, and desired confirmation count
   * 2. Polls the blockchain until the transaction is mined
   * 3. Waits for additional blocks to be mined (confirmations)
   * 4. Returns the transaction receipt with full details
   *
   * **What Are Confirmations?**
   * - A confirmation is a block mined after the block containing your transaction
   * - More confirmations = more secure (harder to reverse)
   * - 1 confirmation = transaction is in a block
   * - 6+ confirmations = generally considered final on Ethereum
   *
   * **Confirmation Guidelines:**
   * - **1 confirmation**: Sufficient for most applications (low-value transactions)
   * - **3 confirmations**: Recommended for medium-value transactions
   * - **6+ confirmations**: Required for high-value transactions or exchanges
   * - **12+ confirmations**: Maximum security (very unlikely to be reversed)
   *
   * **Block Times by Network:**
   * - Ethereum: ~12 seconds per block
   * - Polygon: ~2 seconds per block
   * - Base: ~2 seconds per block
   * - Arbitrum: ~0.25 seconds per block
   * - Optimism: ~2 seconds per block
   *
   * **When to Use This:**
   * - Before updating database records
   * - Before sending confirmation emails
   * - Before releasing goods/services
   * - Before executing dependent transactions
   * - When you need transaction finality guarantees
   *
   * **Important Notes:**
   * - This method BLOCKS until confirmations are reached (can take minutes)
   * - Use `await` or handle the promise properly
   * - Transaction can still fail even after being mined (check receipt.status)
   * - On congested networks, this can take a very long time
   * - Consider using `getStatus()` with polling for better UX
   *
   * @param {string} txHash - Transaction hash to wait for (66-character hex string)
   * @param {Network} network - Network where the transaction was sent
   * @param {number} [confirmations=1] - Number of confirmations to wait for (default: 1)
   *
   * @returns {Promise<TransactionReceiptData>} The transaction receipt containing:
   *          - blockNumber: Block number where transaction was mined
   *          - blockHash: Hash of the block
   *          - transactionHash: The transaction hash
   *          - from: Sender address
   *          - to: Recipient address
   *          - gasUsed: Actual gas consumed
   *          - status: 1 for success, 0 for failure
   *          - logs: Event logs emitted by the transaction
   *
   * @throws {AlignValidationError} If txHash or network is invalid
   * @throws {Error} If transaction fails or is not found
   *
   * @example
   * Wait for 1 confirmation (default)
   * ```typescript
   * const tx = await align.blockchain.transactions.sendNativeToken(
   *   wallet,
   *   "0xRecipient...",
   *   "0.1",
   *   "ethereum"
   * );
   *
   * console.log("Transaction sent, waiting for confirmation...");
   *
   * const receipt = await align.blockchain.transactions.waitForConfirmation(
   *   tx.hash,
   *   "ethereum"
   * );
   *
   * console.log(`Confirmed in block ${receipt.blockNumber}`);
   * console.log(`Gas used: ${receipt.gasUsed}`);
   * ```
   *
   * @example
   * Wait for multiple confirmations (more secure)
   * ```typescript
   * const tx = await align.blockchain.transactions.sendToken(
   *   wallet,
   *   "usdc",
   *   "0xRecipient...",
   *   "1000",
   *   "ethereum"
   * );
   *
   * // Wait for 6 confirmations for high-value transfer
   * const receipt = await align.blockchain.transactions.waitForConfirmation(
   *   tx.hash,
   *   "ethereum",
   *   6
   * );
   *
   * if (receipt.status === 1) {
   *   console.log("Transfer confirmed with 6 confirmations!");
   *   // Safe to update database, send confirmation, etc.
   * }
   * ```
   *
   * @example
   * Show progress while waiting
   * ```typescript
   * const tx = await align.blockchain.transactions.sendNativeToken(
   *   wallet,
   *   "0xRecipient...",
   *   "0.5",
   *   "polygon"
   * );
   *
   * console.log("Waiting for confirmation...");
   * const startTime = Date.now();
   *
   * const receipt = await align.blockchain.transactions.waitForConfirmation(
   *   tx.hash,
   *   "polygon",
   *   3
   * );
   *
   * const elapsed = (Date.now() - startTime) / 1000;
   * console.log(`Confirmed in ${elapsed.toFixed(1)} seconds`);
   * ```
   */
  public async waitForConfirmation(
    txHash: string,
    network: Network,
    confirmations: number = 1
  ): Promise<TransactionReceiptData> {
    const validation = TransactionStatusRequestSchema.safeParse({
      txHash,
      network,
    });
    if (!validation.success) {
      throw new AlignValidationError(
        "Invalid transaction hash",
        formatZodError(validation.error)
      );
    }

    const parsed = validation.data;
    const provider = this.providers.getProvider(parsed.network);

    return Handlers.waitForConfirmation(parsed.txHash, confirmations, provider);
  }
}
