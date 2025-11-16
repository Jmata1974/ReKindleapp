import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68f6a94b0bb2cee1cb3b8e4f", 
  requiresAuth: true // Ensure authentication is required for all operations
});
