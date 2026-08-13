import "./assets/main.css";

import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-sugar.css";
import VueApexCharts from "vue3-apexcharts";
import "preline";
import { initDB } from "./services/database";

async function bootstrap() {
  await initDB(); // ⬅⬅ FULLY wait for the DB to finish
  console.log("SQLite DB initialized — starting Vue app...");
  const app = createApp(App);
  app.use(router);
  app.use(ToastPlugin);
  app.use(VueApexCharts);
  app.mount("#app");
}

bootstrap();
