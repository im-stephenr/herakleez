<script setup>
import MuscleIcon from "@/components/icons/SettingsIcons.vue/MuscleIcon.vue";
import ProfileIcon from "@/components/icons/SettingsIcons.vue/ProfileIcon.vue";
import WeightIcon from "@/components/icons/SettingsIcons.vue/WeightIcon.vue";
import { ref, markRaw } from "vue";

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
</script>
<template>
  <main class="content-container bg-white/60 shadow-sm p-2 h-screen mb-40 m-2">
    <!-- HEADER TITLE -->
    <h1 class="text-[#464543] text-lg text-center">SETTINGS</h1>

    <ul class="w-[95%] mx-auto divide-y divide-default mt-10">
      <!-- PROFILE -->
      <li
        class="p-3 active:bg-gray-300 transition ease-in-out"
        v-for="(page, index) in pages"
        :key="index"
      >
        <router-link
          :to="`${page.link}`"
          class="flex items-center space-x-4 rtl:space-x-reverse"
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
  </main>
</template>
