import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    CLIENT_ID: process.env.EXPO_PUBLIC_CLIENT_ID || "tOEWn2MxBQNcUs2R0QK5yzp1XR3icqq1LfamuSxL",
    CLIENT_SECRET: process.env.EXPO_PUBLIC_CLIENT_SECRET || "iwtSU2T8VuJHf4wjUiOVdEH6wPGAoIlFgo07BjGVzJyIB8u8kMlOK4iD2RW0k6ArsonL2ANP17vAf2SESEVgP5ApYKJAJTSZxn7UnlixsdsMTtaLyHobMWR0LYZ60p9o",
    BASE_URL: process.env.EXPO_PUBLIC_BASE_URL || "https://alumnisocialnetwork-29b6a879a22d.herokuapp.com/",
    WEBSOCKET_URL: process.env.EXPO_PUBLIC_WEBSOCKET_URL || "ws://alumnisocialnetwork-29b6a879a22d.herokuapp.com/ws/posts/",
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