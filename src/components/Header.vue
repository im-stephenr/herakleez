<script setup>
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";
import { onMounted, ref } from "vue";
import { Filesystem, Directory } from "@capacitor/filesystem";
// GET PROFILE PHOTO
const profile_photo = ref("");

const loadProfilePhoto = async () => {
  const { value } = await Preferences.get({
    key: "profilePhoto",
  });

  if (!value) return;

  const { uri } = await Filesystem.getUri({
    path: `images/profile/${value}`,
    directory: Directory.Data,
  });

  profile_photo.value = Capacitor.convertFileSrc(uri);

  console.log("PROFILE PHOTO", profile_photo.value);
};

// EMIT
const emit = defineEmits(["toggle-sidebar"]);

const sendToParent = (status) => {
  emit("toggle-sidebar", status);
};

onMounted(async () => {
  loadProfilePhoto();
});
</script>
<template>
  <header
    class="flex flex-row w-full h-15 relative border-b shadow-sm bg-white"
  >
    <div class="flex items-center justify-start">
      <!-- SIDEBAR MENU BUTTON -->
      <button
        class="ml-2 p-1 active:bg-[#f2f2f2] active:rounded-lg"
        @click.prevent="sendToParent('open')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="#445664"
          class="size-7 mx-auto"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
          />
        </svg>
      </button>

      <!-- <span class="ml-2 font-bold text-2xl text-[#445664]">Dashboard</span> -->
    </div>
    <!-- LOGO -->
    <div class="text-center w-full">
      <router-link to="/">
        <h1 class="text-shadow-lg header-title mt-4 ml-2 text-stroke">
          HERAKLEEZ
        </h1>
      </router-link>
    </div>
    <!-- AVATAR -->
    <div class="mr-5">
      <router-link to="/profile">
        <img
          v-if="profile_photo"
          :src="profile_photo || '/images/body-parts/abs.webp'"
          class="rounded-full border-2 mt-3 border-[#d76821] mr-5"
          style="height: 35px !important; width: 35px !important"
        />
        <div
          v-else
          class="rounded-full border-2 mt-3 border-[#d76821] bg-black text-white text-center w-6"
        >
          ^-^
        </div>
      </router-link>
    </div>
  </header>
</template>
