import type { UserConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default {
  define: {
    __AR_VERSION__: JSON.stringify("0.4.4-dev"),
    __AR_FLAGS__: JSON.stringify("0"),
  },
  plugins: [basicSsl()],
  server: {
    host: true,
    port: 3000,
    https: true, // enable HTTPS
    allowedHosts: [".loca.lt"], // allow requests from localtunnel
  },
} satisfies UserConfig;
