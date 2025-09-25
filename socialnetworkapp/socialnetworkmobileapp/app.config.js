import "dotenv/config";

export default ({ config }) => ({
  ...config,
  extra: {
    CLIENT_ID: process.env.EXPO_PUBLIC_CLIENT_ID,
    CLIENT_SECRET: process.env.EXPO_PUBLIC_CLIENT_SECRET,
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL,
    WEBSOCKET_URL: process.env.EXPO_PUBLIC_WEBSOCKET_URL,
    eas: {
      projectId: "13a5b50b-0e33-415f-9092-b2f8f535c6a4",
    },
  },
  updates: {
    url: "https://u.expo.dev/13a5b50b-0e33-415f-9092-b2f8f535c6a4",
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  plugins: ["expo-secure-store", "expo-video"],
});
