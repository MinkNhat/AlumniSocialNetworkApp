import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    CLIENT_ID: process.env.EXPO_PUBLIC_CLIENT_ID || "PmJ6CTiZC4g7mpsxWNP5Y6BhYPAz39icHdLR30FN",
    CLIENT_SECRET: process.env.EXPO_PUBLIC_CLIENT_SECRET || "Yj7vIXmE17TRg4ewKzxh14mWKJTmbrF49ZA5TMuYBboNXkHLYbY0EXtEfrUppWVApRhWOgEQCZQP1GufCznNZ9wCtcVhnaIR8uPAvzvlcqxCgKTcbOK6pwPZ3dohPAF7",
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || "https://web-production-b2ae.up.railway.app/",
    WEBSOCKET_URL: process.env.EXPO_PUBLIC_WEBSOCKET_URL || "ws://web-production-b2ae.up.railway.app/ws/posts/",
    eas: {
      projectId: "13a5b50b-0e33-415f-9092-b2f8f535c6a4"
    }
  },
  updates: {
    url: "https://u.expo.dev/13a5b50b-0e33-415f-9092-b2f8f535c6a4"
  },
  runtimeVersion: {
    policy: "appVersion"
  }
});