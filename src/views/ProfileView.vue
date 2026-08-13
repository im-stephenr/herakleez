<script setup>
import { onMounted, ref } from "vue";
import { getDB } from "/src/services/database";
import { useToast } from "vue-toast-notification";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";
import { Capacitor } from "@capacitor/core";

const user_data = ref({
  first_name: "",
  last_name: "",
  height: "",
  weight: "",
  age: "",
  email_address: "",
});

const toast = useToast();

const handleUpdateProfile = async () => {
  try {
    const db = getDB();
    // Check if profile exist
    let check = await db.query("SELECT * FROM profile");
    if (check.values.length > 0) {
      let user_id = check.values[0].id;
      await db.query(
        "UPDATE profile SET first_name=?, last_name=?, age=?, height=?, weight=?, email_address=? WHERE id=?",
        [
          user_data.value.first_name,
          user_data.value.last_name,
          user_data.value.age,
          user_data.value.height,
          user_data.value.weight,
          user_data.value.email_address,
          user_id,
        ],
      );
    } else {
      await db.query(
        "INSERT INTO profile(first_name,last_name,age,height,weight,email_address) VALUES(?,?,?,?,?,?)",
        [
          user_data.value.first_name,
          user_data.value.last_name,
          user_data.value.age,
          user_data.value.height,
          user_data.value.weight,
          user_data.value.email_address,
        ],
      );
    }

    await loadProfile();

    // Show toast notif
    toast.success("Profile Updated Successfully!", {
      position: "bottom",
    });
  } catch (err) {
    console.log("Error updating profile", err);
  }
};

// Load Profile
const loadProfile = async () => {
  try {
    const db = getDB();
    const get_profile = await db.query("SELECT * FROM profile LIMIT 1");
    if (get_profile.values.length > 0) {
      let profile_data = get_profile.values[0];
      user_data.value.first_name = profile_data.first_name;
      user_data.value.last_name = profile_data.last_name;
      user_data.value.age = profile_data.age;
      user_data.value.height = profile_data.height;
      user_data.value.weight = profile_data.weight;
      user_data.value.email_address = profile_data.email_address;
    }
  } catch (err) {
    console.log("ERROR TEST DB", err);
  }
};

const fileInput = ref(null);
const selectedFile = ref(null);
// Handle change file
const handleFileChange = async (event) => {
  const file = event.target.files[0];

  if (file) {
    selectedFile.value = file;
    const fileName = `${Date.now()}-${file.name}`;
    const base64 = await fileToBase64(file);

    // Save the photo to capacitor's preferences
    await Filesystem.writeFile({
      path: `images/profile/${fileName}`,
      data: base64,
      directory: Directory.Data,
      recursive: true,
    });

    await Preferences.set({
      key: "profilePhoto",
      value: fileName,
    });
    // Show toast notif
    toast.success("Avatar Updated Successfully!", {
      position: "bottom",
    });
    loadProfilePhoto();
  }
};
// Trigger the hidden input click event
const triggerFileInput = () => {
  fileInput.value.click();
};

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

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      // Remove the "data:image/jpeg;base64," prefix
      resolve(reader.result.split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const testDB = async () => {
  try {
    const db = getDB();
    const result = await db.query("SELECT * FROM exercises");
    console.log("Result", result.values);
  } catch (err) {
    console.log("ERROR DB");
  }
};

onMounted(async () => {
  await loadProfile();
  loadProfilePhoto();
  testDB();
});
</script>
<template>
  <main class="content-container bg-white/60 shadow-sm p-2 mb-40 m-2">
    <!-- HEADER TITLE -->
    <h1 class="text-[#464543] text-lg text-center font-bold">PROFILE</h1>
    <!-- AVATAR -->
    <div class="p-1">
      <img
        :src="profile_photo || '/images/body-parts/abs.webp'"
        class="rounded-full border-2 mt-3 border-[#d76821] mx-auto"
        style="height: 100px !important; width: 100px !important"
      />
      <!-- Hidden file upload -->
      <input
        type="file"
        ref="fileInput"
        style="display: none"
        @change="handleFileChange"
      />
      <!-- UPLOAD BUTTON -->
      <button
        type="button"
        @click="triggerFileInput"
        class="py-1 px-2 mx-auto inline-flex items-center gap-x-2 text-xs font-medium rounded-lg bg-primary border border-primary-line text-primary-foreground hover:bg-primary-hover focus:outline-hidden focus:bg-primary-focus absolute right-18 top-22"
        data-hs-file-upload-trigger
      >
        <svg
          class="shrink-0 size-4"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" x2="12" y1="3" y2="15"></line>
        </svg>
        Avatar
      </button>
    </div>
    <!-- FORM -->
    <form @submit.prevent="handleUpdateProfile">
      <div class="grid gap-6 mb-6 md:grid-cols-2">
        <div>
          <label
            for="first_name"
            class="block mb-2.5 text-sm font-medium text-heading"
            >First name</label
          >
          <input
            type="text"
            id="first_name"
            class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body bg-white"
            placeholder=""
            required
            v-model="user_data.first_name"
          />
        </div>
        <div>
          <label
            for="last_name"
            class="block mb-2.5 text-sm font-medium text-heading"
            >Last name</label
          >
          <input
            type="text"
            id="last_name"
            class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body bg-white"
            placeholder=""
            required
            v-model="user_data.last_name"
          />
        </div>
        <div>
          <label
            for="company"
            class="block mb-2.5 text-sm font-medium text-heading"
            >Height (cm)</label
          >
          <input
            type="number"
            class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body bg-white"
            placeholder=""
            required
            v-model="user_data.height"
            step="any"
          />
        </div>
        <div>
          <label
            for="phone"
            class="block mb-2.5 text-sm font-medium text-heading"
            >Weight (kg)</label
          >
          <input
            type="number"
            step="any"
            class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body bg-white"
            placeholder=""
            required
            v-model="user_data.weight"
          />
        </div>
        <div>
          <label
            for="phone"
            class="block mb-2.5 text-sm font-medium text-heading"
            >Age</label
          >
          <input
            type="number"
            class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body bg-white"
            placeholder=""
            required
            v-model="user_data.age"
          />
        </div>
      </div>
      <div class="mb-6">
        <label for="email" class="block mb-2.5 text-sm font-medium text-heading"
          >Email address</label
        >
        <input
          type="email"
          id="email"
          class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body bg-white"
          placeholder="john.doe@company.com"
          required
          v-model="user_data.email_address"
        />
      </div>

      <div class="w-full relative text-center">
        <button
          type="submit"
          class="relative text-white w-[80%] bg-[#d76821] border border-transparent focus:ring-4 shadow-xs font-medium leading-5 rounded-md mb-5 text-sm px-4 py-2.5 focus:outline-none"
        >
          Update
        </button>
      </div>
    </form>
  </main>
</template>
