// Production Environment Configuration

const ENV_PROD = {
  ENVIRONMENT: "production",
  BACKEND_WS_HOST: "coride-api.fouiguira.com",
  BACKEND_WS_PORT: 443,
  API_URL: "https://coride-api.fouiguira.com/api",
  WS_PROTOCOL: "wss",
  WS_CONFIG: {
    AUTO_CONNECT: true,
    MAX_RETRY_ATTEMPTS: 5,
    INITIAL_RETRY_DELAY: 1000,
    MAX_RETRY_DELAY: 30000,
    COOLDOWN_PERIOD: 60000,
  },
};

export default ENV_PROD;