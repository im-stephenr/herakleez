<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { markRaw, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getDB } from "/src/services/database";
import { useGlobalStopwatch } from "@/composables/globalStopwatch";
import { transition } from "@vueuse/core";
import MuscleIcon from "@/components/icons/SettingsIcons.vue/MuscleIcon.vue";
import ProfileIcon from "@/components/icons/SettingsIcons.vue/ProfileIcon.vue";
import WeightIcon from "@/components/icons/SettingsIcons.vue/WeightIcon.vue";

// stopwatch
const { hours, minutes, seconds, isRunning, start, pause, reset } =
  useGlobalStopwatch();

const route = useRoute();
const router = useRouter();
const is_sidebar_status = ref("close");
const profile_data = ref({});

let current_page = ref("");
let workout_status = ref("stop");
const workout_id = ref(0);
const pages = ref([
  {
    title: "Profile",
    link: "/profile",
    icon: markRaw(ProfileIcon),
  },
  {
    title: "Weight Progress",
    link: "/weight-progress",
    icon: markRaw(WeightIcon),
  },
  {
    title: "Muscle Progress",
    link: "/muscle-progress",
    icon: markRaw(MuscleIcon),
  },
]);

const startTraining = async () => {
  const db = getDB();
  const current_time = new Date().toLocaleTimeString("en-GB", {
    hour12: false,
  });
  if (workout_status.value == "start") return false;
  workout_status.value = "start";
  const result = await db.run("INSERT INTO workouts(start_time) VALUES(?)", [
    current_time,
  ]);
  workout_id.value = result.changes.lastId;
  console.log("STARTING TRAINING: ", workout_status.value);
  // Start stopwatch
  start();
};

const stopTraining = async () => {
  const db = getDB();
  const current_time = new Date().toLocaleTimeString("en-GB", {
    hour12: false,
  });
  router.push("/");

  workout_status.value = "stop";
  await db.query("UPDATE workouts SET end_time=? WHERE id=?", [
    current_time,
    workout_id.value,
  ]);
  workout_id.value = 0;
  console.log("STOPPING TRAINING: ", workout_status.value);
  // Reset the stopwatch
  pause();
  reset(undefined, false);
};

watch(
  () => route.path,
  (newPath, oldPath) => {
    // UPDATE CURRENT PAGE PROPS
    current_page.value = newPath;
  },
);

// SWIPE FUNCTION
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50; // Minimum pixel distance for a swipe

function handleTouchStart(event) {
  touchStartX.value = event.changedTouches[0].screenX;
}

function handleTouchEnd(event) {
  touchEndX.value = event.changedTouches[0].screenX;
  checkSwipeDirection();
}

function checkSwipeDirection() {
  const distance = touchStartX.value - touchEndX.value;
  if (distance > minSwipeDistance) {
    // Trigger your swipe left logic here
    console.log("Swiped Left!");
    // Close sidebar
    toggleSidebar("close");
  }
}

// handle load profile
const loadProfile = async () => {
  try {
    const db = getDB();
    const get_profile = await db.query("SELECT * FROM profile LIMIT 1");
    if (get_profile.values.length > 0) {
      profile_data.value = get_profile?.values[0];
    }
  } catch (err) {
    console.log("Error loading profile", err);
  }
};

const toggleSidebar = (status) => {
  is_sidebar_status.value = status;
};

onMounted(async () => {
  await loadProfile();
});
</script>
<template>
  <!-- <div
    class="header-bg bg-linear-to-r shadow-md from-[#d76821] to-[#8ab605] text-white"
  ></div> -->
  <div class="flex justify-between flex-col">
    <Header @toggle-sidebar="toggleSidebar" />
    <!-- SIDEBAR MENU BACKGROUND / ON SIDEBAR OUTSIDE CLICK WILL CLOSE THE SIDEBAR -->
    <Transition name="fade">
      <div
        v-if="is_sidebar_status === 'open'"
        class="fixed inset-0 bg-black/50 z-30"
        @click="is_sidebar_status = 'closed'"
      ></div>
    </Transition>
    <!-- SIDEBAR MENU -->
    <transition name="slide">
      <div
        v-if="is_sidebar_status === 'open'"
        class="border w-[80%] fixed top-0 bg-white z-40 h-screen shadow-2xl"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <ul class="w-[95%] mx-auto divide-y divide-default">
          <li
            class="p-3 active:bg-gray-300 transition ease-in-out"
            v-for="(page, index) in pages"
            :key="index"
          >
            <router-link
              :to="`${page.link}`"
              class="flex items-center space-x-4 rtl:space-x-reverse"
              @click="is_sidebar_status = 'closed'"
            >
              <div class="shrink-0">
                <!-- ICON -->
                <component :is="page.icon" />
              </div>
              <div class="flex-1 min-w-0">
                <!-- Title -->
                <p class="text-md font-medium text-[#464543] truncate">
                  {{ page.title }}
                </p>
              </div>
              <div
                class="inline-flex items-center text-base font-semibold text-heading"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#d76821"
                  class="size-6"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </router-link>
          </li>
        </ul>
        <div class="fixed bottom-0 ml-15 text-xs mb-5">
          Copyright 2026 Stephen Ramo
        </div>
      </div>
    </transition>
    <main class="overflow-y-scroll w-full p-2" id="main_content">
      <transition name="slide">
        <router-view
          :profile_data="profile_data"
          :loadProfile="loadProfile"
          :startTraining="startTraining"
          :workout_status="workout_status"
          :stopTraining="stopTraining"
          :workout_id="workout_id"
        />
      </transition>
    </main>
    <Footer :workout_status="workout_status" :current_page="current_page" />
  </div>
</template>
