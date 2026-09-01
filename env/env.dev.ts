// Development Environment Configuration
const BACKEND_HOST = "coride-api.fouiguira.com";
const ENV_DEV = {
  ENVIRONMENT: "development",
  BACKEND_WS_HOST: BACKEND_HOST,
  BACKEND_WS_PORT: 443,
  WS_PROTOCOL: "wss",
  API_URL: `https://${BACKEND_HOST}/api`,
  WS_CONFIG: {
    AUTO_CONNECT: true,
    MAX_RETRY_ATTEMPTS: 5,
    INITIAL_RETRY_DELAY: 1000,
    MAX_RETRY_DELAY: 30000,
    COOLDOWN_PERIOD: 60000,
  },
};

export default ENV_DEV;