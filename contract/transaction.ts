import {
    Account,
    Aptos,
    AptosConfig,
    Network,
  } from "@aptos-labs/ts-sdk";
   
  async function main() {
    // Initialize the Aptos client
    const config = new AptosConfig({ network: Network.DEVNET });
    const aptos = new Aptos(config);
    
    console.log("Connected to Aptos devnet");
    
    // More code will go here
  }
   
  main().catch(console.error);