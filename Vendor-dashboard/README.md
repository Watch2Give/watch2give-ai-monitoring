# Watch2Give Vendor Dashboard

This is the frontend for the Watch2Give Vendor Dashboard, allowing vendors to manage their $GIVE tokens, redeem them for xcUSDT, stake them to increase their Holding Metric, and record inventory.

## Polkadot/Astar Integration Guide

The application is designed to integrate with the Watch2Give smart contracts on the Astar Network (Polkadot ecosystem). The integration is handled through the `polkadot-service.ts` file.

### Prerequisites

1. Astar Network endpoint (WebSocket)
2. $GIVE token contract address (PSP22 standard)
3. Vendor Registry contract address

### Environment Variables

Set the following environment variables for production:

\`\`\`
NEXT_PUBLIC_ASTAR_ENDPOINT=wss://your-astar-endpoint
NEXT_PUBLIC_POLKADOT_ENDPOINT=wss://your-polkadot-endpoint
NEXT_PUBLIC_GIVE_TOKEN_ADDRESS=0xYourTokenContractAddress
NEXT_PUBLIC_VENDOR_REGISTRY_ADDRESS=0xYourVendorRegistryAddress
NEXT_PUBLIC_API_URL=https://your-api-url
\`\`\`

### Integration Steps

1. **Install Polkadot.js Dependencies**

\`\`\`bash
npm install @polkadot/api @polkadot/extension-dapp
\`\`\`

2. **Update the Polkadot Service**

Replace the mock implementations in `services/polkadot-service.ts` with actual Polkadot.js API calls. The key functions to implement are:

- `connect()`: Connect to the Astar network
- `getGiveTokenBalance()`: Query PSP22 token balance
- `getTokenPrice()`: Get token price from DEX
- `getHoldingMetric()`: Get vendor holding metric from smart contract
- `redeemTokens()`: Call redeem function on smart contract
- `stakeTokens()`: Call stake function on smart contract
- `validateToken()`: Validate token ID on blockchain

3. **Wallet Integration**

Add wallet connection functionality to allow vendors to connect their Polkadot/Astar wallets. This should be implemented in a new component (e.g., `components/wallet-connector.tsx`).

### Smart Contract Interaction

The application interacts with two main smart contracts:

1. **$GIVE Token Contract (PSP22)**
   - Functions: `transfer`, `balanceOf`, `approve`, `transferFrom`

2. **Vendor Registry Contract**
   - Functions: `getHoldingMetric`, `redeemTokens`, `stakeTokens`, `recordInventory`

### Testing

For local testing, you can use:

- Astar Development Network
- Polkadot.js Browser Extension
- Mock contracts for development

## API Integration

In addition to blockchain integration, the application also uses a traditional API for some functionality. See the API endpoints in `config/app-config.ts`.

## Deployment

1. Build the application:
\`\`\`bash
npm run build
\`\`\`

2. Deploy the built application to your hosting provider.

3. Set the required environment variables on your hosting provider.

4. Ensure your Astar RPC node is accessible from the deployed frontend.
\`\`\`

This README provides clear instructions for integrating with the Polkadot/Astar blockchain, which is essential for the Watch2Give platform.
