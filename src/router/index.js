import { createRouter, createWebHistory } from "vue-router";
import DashboardView from "@/views/DashboardView.vue";
import ExcercisesView from "@/views/ExcercisesView.vue";
import DefaultLayout from "@/assets/layouts/DefaultLayout.vue";
import StartView from "@/views/StartView.vue";
import ProfileView from "@/views/ProfileView.vue";
import SettingsView from "@/views/SettingsView.vue";
import StartSelectedBodyPartView from "@/views/StartSelectedBodyPartView.vue";
import WorkoutHistoryView from "@/views/WorkoutHistoryView.vue";
import WeightProgressView from "@/views/WeightProgressView.vue";
import MuscleProgressView from "@/views/MuscleProgressView.vue";

const routes = [
  {
    path: "/",
    component: DefaultLayout,
    children: [
      {
        path: "/",
        name: "dashboard",
        component: DashboardView,
      },
      {
        path: "/exercises",
        name: "exercises",
        component: ExcercisesView,
      },
      {
        path: "/start",
        name: "start",
        component: StartView,
      },
      {
        path: "/profile",
        name: "profile",
        component: ProfileView,
      },
      {
        path: "/settings",
        name: "settings",
        component: SettingsView,
      },
      {
        path: "/start-selected-body-part/:body_part",
        name: "start-selected-body-part",
        component: StartSelectedBodyPartView,
      },
      {
        path: "/workout-history",
        name: "workout-history",
        component: WorkoutHistoryView,
      },
      {
        path: "/weight-progress",
        name: "weight-progress",
        component: WeightProgressView,
      },
      {
        path: "/muscle-progress",
        name: "muscle-progress",
        component: MuscleProgressView,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// FOR PRELINE
router.afterEach((to, from, failure) => {
  if (!failure) {
    setTimeout(() => {
      window.HSTabs?.autoInit(); // for preline tabs
      window.HSOverlay?.autoInit(); // for preline modal
    }, 100);
  }

  // Remove any orphaned Preline overlay backdrops
  document
    .querySelectorAll(".hs-overlay-backdrop")
    .forEach((el) => el.remove());
  // Reset body styles/classes Preline applies when an overlay is open
  document.body.classList.remove("hs-overlay-body-open");
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
});

export default router;
