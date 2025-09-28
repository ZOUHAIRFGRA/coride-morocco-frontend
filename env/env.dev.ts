// Development Environment Configuration
const USING_NGROK = process.env.EXPO_PUBLIC_USING_NGROK === "true" || false;
const BACKEND_HOST = USING_NGROK ? "prime-legible-turkey.ngrok-free.app" : "localhost" 
const PROTOCOL = USING_NGROK ? "https" : "http"
const ENV_DEV = {
  ENVIRONMENT: "development",
  BACKEND_WS_HOST: BACKEND_HOST,
  BACKEND_WS_PORT: 80,
  WS_PROTOCOL: USING_NGROK ? "wss" : "ws",
  API_URL: `${PROTOCOL}://${BACKEND_HOST}/api/graphql`,
  WS_CONFIG: {
    AUTO_CONNECT: true,
    MAX_RETRY_ATTEMPTS: 5,
    INITIAL_RETRY_DELAY: 1000,
    MAX_RETRY_DELAY: 30000,
    COOLDOWN_PERIOD: 60000,
  },
};

export default ENV_DEV;