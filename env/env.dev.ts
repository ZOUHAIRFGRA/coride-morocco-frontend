// Development Environment Configuration
const USING_NGROK = process.env.EXPO_PUBLIC_USING_NGROK === "true" || false;
const WIFI_IP = process.env.EXPO_PUBLIC_WIFI_IP || "192.168.1.2"; // Fallback IP if script fails
const BACKEND_HOST = USING_NGROK ? "trusted-frank-mudfish.ngrok-free.app" : WIFI_IP;
const BACKEND_PORT = USING_NGROK ? 80 : 8000;
const PROTOCOL = USING_NGROK ? "https" : "http"
const ENV_DEV = {
  ENVIRONMENT: "development",
  BACKEND_WS_HOST: BACKEND_HOST,
  BACKEND_WS_PORT: USING_NGROK ? 80 : 8000,
  WS_PROTOCOL: USING_NGROK ? "wss" : "ws",
  API_URL: `${PROTOCOL}://${BACKEND_HOST}${USING_NGROK ? '' : ':' + BACKEND_PORT}/api`,
  WS_CONFIG: {
    AUTO_CONNECT: true,
    MAX_RETRY_ATTEMPTS: 5,
    INITIAL_RETRY_DELAY: 1000,
    MAX_RETRY_DELAY: 30000,
    COOLDOWN_PERIOD: 60000,
  },
};

export default ENV_DEV;