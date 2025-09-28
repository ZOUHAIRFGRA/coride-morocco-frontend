// Production Environment Configuration

const ENV_PROD = {
  ENVIRONMENT: "production",
  BACKEND_WS_HOST: "trusted-frank-mudfish.ngrok-free.app",
  BACKEND_WS_PORT: 80,
  API_URL: "https://trusted-frank-mudfish.ngrok-free.app/api",
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