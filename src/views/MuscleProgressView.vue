<script setup>
import { Camera } from "@capacitor/camera";
import { onLongPress } from "@vueuse/core";
import { nextTick, onMounted, ref, useTemplateRef } from "vue";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { getDB } from "/src/services/database";
import { useToast } from "vue-toast-notification";
import { formatDateFull } from "@/utils/helper";
import { onBeforeRouteLeave } from "vue-router";

const image_url = ref("");
const selected_image_id = ref(0);
const captured_photo = ref(null);
const toast = useToast();
const list_photos = ref({});
const modal_active = ref(false);
const modal_data = ref({});
const is_loading = ref(true);

const takePicture = async () => {
  try {
    const image = await Camera.takePhoto({
      quality: 90,
      correctOrientation: true,
    });

    console.log("IMAGE RESULT", image);

    // image_url.value = image.uri; // for phone
    image_url.value = image.webPath; // for web

    captured_photo.value = image;
  } catch (err) {
    console.log("Error taking picture", err);
  }
};

// Handle Approve Taken photo
const handleApprovePhoto = async () => {
  console.log("APPROVE PHOTO");
  try {
    const db = getDB();
    const file_name = `progress_${Date.now()}.jpg`;

    // Read the temporary image
    const image = await Filesystem.readFile({
      path: captured_photo.value.uri,
    });

    // Save into app's documents folder
    await Filesystem.writeFile({
      path: `muscle_progress/${file_name}`,
      data: image.data,
      directory: Directory.Documents,
      recursive: true,
    });

    const uri = await Filesystem.getUri({
      directory: Directory.Documents,
      path: `muscle_progress/${file_name}`,
    });

    // Save to database
    const insert_photo = await db.run(
      `INSERT INTO muscle_progress_photos(photo, date_added) VALUES(?, ?)`,
      [uri.uri, new Date().toISOString()],
    );
    const newly_added_photo = {
      id: insert_photo.lastId,
      photo: uri.uri,
      date_added: new Date().toISOString(),
    };
    // Add the newly added photo to existing list
    list_photos.value.unshift(newly_added_photo);
    toast.success("Photo added successfully!", {
      position: "bottom",
    });
  } catch (err) {
    console.log("Error saving photo", err);
  }

  //   Clear display photo
  image_url.value = "";
};
// Handle Cancel Taken photo
const handleCancelPhoto = async () => {
  image_url.value = "";
};

// On long press
const long_pressed_fired = ref(false);
const setImageRef = (el, photo) => {
  if (!el) return;

  onLongPress(
    el,
    async () => {
      const db = getDB();
      long_pressed_fired.value = true;
      console.log("Long Pressed Show Modal: ", photo);
      if (!confirm("Do you want to remove this photo?")) return false;
      try {
        // Get only the muscle_progress/ part of the file path stored
        // const relativePath = photo.photo.substring(
        //   photo.photo.indexOf("muscle_progress/"),
        // );

        // // DELETING FROM FOLDER
        // await Filesystem.deleteFile({
        //   path: relativePath,
        //   directory: Directory.Documents,
        // });

        //   DELETE FROM DATABASE
        await db.run("DELETE FROM muscle_progress_photos WHERE id=?", [
          photo.id,
        ]);
        // Remove the selected photo to the list
        list_photos.value = list_photos.value.filter((p) => p.id !== photo.id);

        toast.success("Photo removed successfully!", {
          position: "bottom",
        });
      } catch (err) {
        console.log("ERROR DELETING FROM FOLDER", err);
      }
    },
    { duration: 500 },
  );
};

const getPhotoUrl = (path) => {
  return Capacitor.convertFileSrc(path);
};

// handle load photos
const loadPhotos = async () => {
  try {
    const db = getDB();
    const result = await db.query(
      "SELECT * FROM muscle_progress_photos ORDER BY date_added DESC",
    );
    if (result.values.length > 0) {
      list_photos.value = result.values;
    }
    is_loading.value = false;
  } catch (err) {
    console.log("ERROR LOADING PHOTOS", err);
  }
};

const handleShowPhoto = async (selected_photo) => {
  console.log("Selected photo", selected_photo);
  modal_active.value = true;
  modal_data.value.date_added = selected_photo.date_added;
  modal_data.value.photo = selected_photo.photo;
};

// handle close modal
const handleCloseModal = () => {
  modal_active.value = false;
  modal_data.value.date_added = "";
  modal_data.value.photo = "";
};

onMounted(async () => {
  await loadPhotos();
});
</script>
<template>
  <main class="content-container bg-white/60 shadow-sm p-2 h-full mb-40 m-2">
    <!-- MODAL -->
    <Transition name="modal">
      <div
        v-if="modal_active"
        id="modalOverlay"
        class="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-1000 before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)]"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          tabindex="-1"
          class="w-full max-w-lg bg-white border border-slate-100 shadow-lg rounded-lg relative max-h-[95vh] overflow-y-auto outline-none p-4 md:p-6"
        >
          <div class="flex items-center pb-3 border-b border-slate-300">
            <h3
              id="modal-title"
              class="text-slate-900 text-lg font-semibold flex-1"
            >
              Photo taken {{ formatDateFull(modal_data.date_added) }}
            </h3>

            <button
              @click.prevent="handleCloseModal"
              type="button"
              id="closeModal"
              aria-label="Close modal"
              class="ml-auto flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="size-3 cursor-pointer fill-slate-500 hover:fill-red-600"
                aria-hidden="true"
                viewBox="0 0 329.269 329"
              >
                <path
                  d="M194.8 164.77 323.013 36.555c8.343-8.34 8.343-21.825 0-30.164-8.34-8.34-21.825-8.34-30.164 0L164.633 134.605 36.422 6.391c-8.344-8.34-21.824-8.34-30.164 0-8.344 8.34-8.344 21.824 0 30.164l128.21 128.215L6.259 292.984c-8.344 8.34-8.344 21.825 0 30.164a21.27 21.27 0 0 0 15.082 6.25c5.46 0 10.922-2.09 15.082-6.25l128.21-128.214 128.216 128.214a21.27 21.27 0 0 0 15.082 6.25c5.46 0 10.922-2.09 15.082-6.25 8.343-8.34 8.343-21.824 0-30.164zm0 0"
                />
              </svg>
            </button>
          </div>

          <div class="my-6">
            <img :src="getPhotoUrl(modal_data.photo)" loading="lazy" alt="" />
          </div>
        </div>
      </div>
    </Transition>

    <!-- HEADER TITLE -->
    <h1 class="text-[#464543] text-lg text-center font-bold">
      MUSCLE PROGRESS
    </h1>
    <div class="flex flex-col">
      <!-- OPEN CAMERA BUTTON -->
      <div class="pb-2">
        <button
          class="p-2 m-2 bg-[#d76821] flex flex-row mx-auto rounded-sm shadow-sm"
          @click.prevent="takePicture"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#fff"
            class="size-6"
          >
            <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
            <path
              fill-rule="evenodd"
              d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3h-15a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
              clip-rule="evenodd"
            />
          </svg>

          <span class="ml-2 text-white">Take A Photo</span>
        </button>
        <!-- Taken photo container -->
        <div v-if="image_url" class="w-[50%] border mx-auto p-1">
          <img :src="image_url" alt="Captured image" />
          <div class="flex flex-row items-center justify-center">
            <!-- Approve -->
            <button
              class="p-3 bg-blue-700 rounded-full m-2"
              @click.prevent="handleApprovePhoto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                class="size-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <!-- Cancel -->
            <button
              class="p-3 bg-red-700 rounded-full m-2"
              @click.prevent="handleCancelPhoto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                class="size-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <!-- LOADING -->
      <div
        v-if="is_loading"
        class="grid min-h-35 w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible"
      >
        <svg
          class="text-gray-300 animate-spin"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
        >
          <path
            d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
            stroke="currentColor"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
          <path
            d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
            stroke="currentColor"
            stroke-width="5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-gray-900"
          ></path>
        </svg>
        Fetching your photos...
      </div>
      <!-- ALBUM CONTAINER -->
      <div v-if="list_photos.length > 0">
        <div class="grid grid-cols-2 gap-4 m-2" v-if="!is_loading">
          <div
            class="border p-1 relative bg-white"
            v-for="(photo, i) in list_photos"
            :ref="(el) => setImageRef(el, photo)"
            :key="i"
            @click.prevent="handleShowPhoto(photo)"
          >
            <img :src="getPhotoUrl(photo.photo)" alt="" />
            <!-- DESCRIPTION -->
            <div
              class="w-full p-2 text-center absolute bottom-0 text-black bg-gray-100/50"
            >
              <span class="text-shadow-sm">{{
                formatDateFull(photo.date_added)
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="mt-10 mb-10 text-center">
        You don't have photo taken yet. <br />
        Take a photo now and show your muscle progress!
      </div>
    </div>
  </main>
</template>
