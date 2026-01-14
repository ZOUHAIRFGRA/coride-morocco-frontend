// Production Environment Configuration

const ENV_PROD = {
  ENVIRONMENT: "production",
  BACKEND_WS_HOST: "79.72.60.38",
  BACKEND_WS_PORT: 9443,
  API_URL: "http://79.72.60.38:9001/api", // Changed to HTTP for development - use HTTPS in real production
  WS_PROTOCOL: "ws", // Changed to ws for development
  WS_CONFIG: {
    AUTO_CONNECT: true,
    MAX_RETRY_ATTEMPTS: 5,
    INITIAL_RETRY_DELAY: 1000,
    MAX_RETRY_DELAY: 30000,
    COOLDOWN_PERIOD: 60000,
  },
};

export default ENV_PROD;