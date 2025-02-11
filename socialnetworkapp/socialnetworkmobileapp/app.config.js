import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    BASE_URL: process.env.BASE_URL,
    WEBSOCKET_URL: process.env.WEBSOCKET_URL,
  },
});