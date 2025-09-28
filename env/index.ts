// Environment Configuration Selector

import ENV_DEV from "./env.dev";
import ENV_PROD from "./env.prod";

// Set to false to use development environment, true for production
const IS_PROD = process.env.EXPO_PUBLIC_IS_PROD === "true" || false;

// Export the appropriate environment configuration
const ENV = IS_PROD ? ENV_PROD : ENV_DEV;

export default ENV;
