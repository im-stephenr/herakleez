<script setup>
import WorkoutImage from "@/components/WorkoutImage.vue";
import { getDB } from "/src/services/database";
import { onMounted, ref } from "vue";
import { nextTick, watch } from "vue";

const selected_modal_image = ref("");
const selected_modal_title = ref("");
const active_tab = ref("chest");
const is_loading = ref(true);
const modal_active = ref(false);

// CHEST WORKOUTS
const workouts = ref({});
const body_parts = ref({});

const getImageUrl = (name, category) => {
  return new URL(
    `../assets/images/workouts/${category}/${name}.gif`,
    import.meta.url,
  ).href;
};

const loadBodyParts = async () => {
  try {
    const db = getDB();
    const result = await db.query("SELECT * FROM body_parts");
    if (result.values.length > 0) {
      body_parts.value = result.values;
    }
    console.log("Exercises", result.values);
  } catch (err) {
    console.log("Error loading exercises", err);
  }
};

const loadExercises = async () => {
  try {
    const db = getDB();
    const result = await db.query(
      "SELECT * FROM exercises JOIN body_parts ON exercises.body_part_id=body_parts.id",
    );
    if (result.values.length > 0) {
      // Filter the exercises by its body_part.name
      workouts.value = result.values.reduce((acc, item) => {
        const key = item.name;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
    }
    is_loading.value = false;
  } catch (err) {
    console.log("Error loading exercises", err);
  }
};

// handle change active tab
const handleActiveTab = (category) => {
  active_tab.value = category;
  console.log("active_tab.value", active_tab.value);
};

// handle close modal
const handleCloseModal = () => {
  modal_active.value = false;
};

const handleDisplayExerciseModal = (title, category) => {
  modal_active.value = true;
  selected_modal_title.value = title;
  selected_modal_image.value = getImageUrl(title, category);
};

onMounted(async () => {
  await loadBodyParts();
  await loadExercises();
});
</script>
<template>
  <main class="content-container bg-white/60 shadow-sm p-2 m-2 h-full mb-40">
    <h1 class="text-[#464543] text-lg text-center font-bold">EXERCISES</h1>

    <div class="w-full p-2">
      <!-- WORKOUTS -->
      <!-- Tab Nav -->
      <div class="border-b border-line-2">
        <nav
          id="hs-tabs"
          class="flex gap-x-1"
          aria-label="Tabs"
          role="tablist"
          aria-orientation="horizontal"
        >
          <button
            v-for="(body_part, i) in body_parts"
            :key="i"
            type="button"
            @click.prevent="handleActiveTab(body_part.name)"
            :class="`${
              body_part.name === active_tab ? 'active' : ''
            } capitalize hs-tab-active:font-semibold hs-tab-active:text-primary-active hs-tab-active:after:bg-primary-active relative py-4 px-1 inline-flex items-center gap-x-2 text-sm whitespace-nowrap text-muted-foreground-1 after:absolute after:-bottom-px after:inset-x-0 after:w-full after:h-0.5 after:bg-transparent hover:text-primary-hover focus:outline-hidden focus:text-primary-focus disabled:opacity-50 disabled:pointer-events-none `"
            :data-hs-tab="`#${body_part.name}_tab`"
            :aria-controls="`${body_part.name}_tab`"
            :aria-selected="`${
              body_part.name === active_tab ? 'true' : 'false'
            }`"
            role="tab"
          >
            {{ body_part.name }}
          </button>
        </nav>
      </div>
      <!-- End Tab Nav -->

      <!-- Tab Content -->
      <div class="mt-3">
        <div
          v-for="(body_part, i) in body_parts"
          :key="i"
          :id="`${body_part.name}_tab`"
          :class="`${active_tab === body_part.name ? '' : 'hidden'} `"
          role="tabpanel"
        >
          <div class="grid grid-cols-3 gap-2">
            <WorkoutImage
              v-for="workout in workouts[body_part.name]"
              :key="workout.title"
              :title="`${workout.title}`"
              :category="body_part.name"
              @click.prevent="
                handleDisplayExerciseModal(workout.title, body_part.name)
              "
            />
          </div>
        </div>
      </div>
      <!-- End Tab Content -->
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
      Fetching Exercises...
    </div>

    <!-- MODAL -->
    <Transition name="modal">
      <div
        v-if="modal_active"
        id="modalOverlay"
        class="fixed inset-0 p-4 flex flex-wrap justify-center items-center w-full h-full z-[1000] before:fixed before:inset-0 before:w-full before:h-full before:bg-[rgba(0,0,0,0.5)]"
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
              {{ selected_modal_title }}
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
            <img :src="selected_modal_image" loading="lazy" class="w-full" />
          </div>
        </div>
      </div>
    </Transition>
  </main>
</template>
