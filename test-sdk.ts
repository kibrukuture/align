import Align from "./src";

async function main() {
  console.log("Initializing Align SDK...");

  const client = new Align({
    apiKey: "test_api_key",
    environment: "sandbox",
  });

  console.log("SDK Initialized successfully.");
  console.log("Resources available:");
  console.log("- Customers:", !!client.customers);
  console.log("- Virtual Accounts:", !!client.virtualAccounts);
  console.log("- Transfers:", !!client.transfers);
  console.log("- Webhooks:", !!client.webhooks);
  console.log("- External Accounts:", !!client.externalAccounts);
  console.log("- Wallets:", !!client.wallets);
  console.log("- Files:", !!client.files);
  console.log("- Developers:", !!client.developers);
  console.log("- Cross-Chain:", !!client.crossChain);

  // Example usage (commented out to avoid actual network calls)
  /*
  try {
    const customers = await client.customers.list();
    console.log('Customers:', customers);
  } catch (error) {
    console.error('API Error:', error);
  }
  */
}

main().catch(console.error);
