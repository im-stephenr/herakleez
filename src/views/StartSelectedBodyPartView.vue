<script setup>
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import WorkoutImage from "@/components/WorkoutImage.vue";
import { onMounted, ref, nextTick, watch } from "vue";
import { getDB } from "/src/services/database";

const props = defineProps({
  workout_id: Number,
});

const selected_modal_image = ref("");
const selected_modal_category = ref("");
const isSelectButtonDisabled = ref(false);
const sets = ref(1);
const reps = ref(1);
const route = useRoute();
const router = useRouter();
const body_part_id = ref(route.params.body_part);
const body_part = ref([]);
const exercises = ref([]);
const selected_exercise_id = ref(0);
const selected_exercises = ref([]);
const is_loading = ref(true);
const previous_selected_exercise = ref([]);

const handleQuantity = (category, update_category) => {
  const target = category === "set" ? sets : reps;

  if (update_category === "increment") {
    target.value++;
  } else {
    target.value--;
  }
};

const updateSelectedModalImage = async (title, category, exercise_id) => {
  selected_modal_image.value = title;
  selected_modal_category.value = category;
  selected_exercise_id.value = exercise_id;
  await nextTick();

  const modal = document.querySelector("#hs-scale-animation-modal");
  if (window.HSOverlay && modal) {
    window.HSOverlay.open(modal);
  }
};

// Handle Selected Exercise
const handleSelectExercise = async () => {
  // console.log("Exercise", selected_exercise_id.value);
  // console.log("Sets", sets.value);
  // console.log("Reps", reps.value);
  // console.log("Workout ID", props.workout_id);

  isSelectButtonDisabled.value = true;
  // Add Exercise to Database
  const db = getDB();
  try {
    await db.query(
      "INSERT INTO workout_exercises(workout_id, exercise_id, sets, reps) VALUES(?,?,?,?)",
      [props.workout_id, selected_exercise_id.value, sets.value, reps.value],
    );
    // Close the overlay first so Preline cleans up the backdrop properly
    const modal = document.querySelector("#hs-scale-animation-modal");
    window.HSOverlay?.close(modal);

    // Give Preline's close animation/cleanup a tick to finish
    await nextTick();

    router.push("/start");
  } catch (err) {
    console.log("ERROR ADDING SELECTED EXERCISE", err);
  }
  // Redirect back to Start view
};

// HANDLE LOAD WORKOUTS
const loadExercises = async () => {
  const db = getDB();
  try {
    let get_exercises = await db.query(
      "SELECT * FROM exercises WHERE body_part_id=?",
      [body_part_id.value],
    );
    exercises.value = get_exercises.values;
    // console.log("EXERCISES SELECTED  ", exercises.value);
    is_loading.value = false;
  } catch (err) {
    console.log("Error Loading Exercise", err);
  }
};

// HANDLE LOAD SELECTED BODY PART
const loadSelectedBodyPart = async () => {
  const db = getDB();
  try {
    let get_body_part = await db.query("SELECT * FROM body_parts WHERE id=?", [
      body_part_id.value,
    ]);
    body_part.value = get_body_part.values[0];
    // console.log("BODY PART SELECTED  ", body_part.value);
  } catch (err) {
    console.log("Error Loading Selected body Part", err);
  }
};

// Handle selected exercise
const selectedExercises = async () => {
  const db = getDB();
  try {
    let get_selected_exercises = await db.query(
      "SELECT workout_exercises.exercise_id FROM workout_exercises JOIN exercises ON workout_exercises.exercise_id=exercises.id WHERE workout_exercises.workout_id=? AND exercises.body_part_id=?",
      [props.workout_id, body_part_id.value],
    );
    if (get_selected_exercises.values.length > 0) {
      // selected_exercises.value = get_selected_exercises.values;
      for (const exercise of get_selected_exercises.values) {
        selected_exercises.value.push(exercise.exercise_id);
      }
    }
    // console.log("selected_exercises.value", selected_exercises.value);
  } catch (err) {
    console.log("Error Loading Selected Exercises", err);
  }
};

// Handle previous selected exercise
const previousSelectedExercise = async () => {
  const db = getDB();
  try {
    let get_selected_exercises = await db.query(
      `SELECT exercises.id 
       FROM workout_exercises 
       JOIN exercises ON workout_exercises.exercise_id=exercises.id 
       WHERE workout_exercises.workout_id=(SELECT id FROM workouts ORDER BY id DESC LIMIT 1 OFFSET 1)`,
    );
    if (get_selected_exercises.values.length > 0) {
      // previous_selected_exercise.value = get_selected_exercises.values;
      for (const exercise of get_selected_exercises.values) {
        previous_selected_exercise.value.push(exercise.id);
      }
    }
    // console.log("Previous Selected Exercise", previous_selected_exercise.value);
  } catch (err) {
    console.log("Error Loading Selected Exercises", err);
  }
};
const getImageUrl = (name, category) => {
  return new URL(
    `../assets/images/workouts/${category}/${name}.gif`,
    import.meta.url,
  ).href;
};

onBeforeRouteLeave(() => {
  const modal = document.querySelector("#hs-scale-animation-modal");
  window.HSOverlay?.close(modal);
});

onMounted(async () => {
  // window.HSStaticMethods?.autoInit();
  await loadExercises();
  await loadSelectedBodyPart();
  await selectedExercises();
  await previousSelectedExercise();
  // Added this here since the modal no longer works after adding the database
  await nextTick();
  window.HSStaticMethods?.autoInit();
  console.log("Current workout id: ", props.workout_id);
});
</script>
<template>
  <main class="content-container bg-white/60 rounded-md shadow-sm p-4 mb-30">
    <div class="w-full m-4 flex">
      <router-link to="/start" class="p-2 border bg-[#f4f5f6]"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 text-[#959493]"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
      </router-link>
      <h1 class="text-[#353534] ml-4 mt-1 text-xl font-bold">
        Select
        <span class="capitalize text-[#d76821]">{{ body_part?.name }}</span>
        Exercise
      </h1>
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

    <!-- EXERCISES -->
    <div role="tabpanel">
      <div class="grid grid-cols-3 gap-2">
        <WorkoutImage
          v-for="exercise in exercises"
          :key="exercise.title"
          @updateSelectedModalImage="
            updateSelectedModalImage(
              exercise.title,
              body_part.name,
              exercise.id,
            )
          "
          :exerciseExist="`${
            selected_exercises.includes(exercise.id) ? true : false
          }`"
          :previousExerciseExist="`${
            previous_selected_exercise.includes(exercise.id) ? true : false
          }`"
          :title="`${exercise.title}`"
          :category="`${body_part.name}`"
        />
      </div>
    </div>

    <!-- MODAL -->
    <div
      id="hs-scale-animation-modal"
      class="hs-overlay hidden size-full fixed top-0 inset-s-0 z-80 overflow-x-hidden overflow-y-auto pointer-events-none"
      role="dialog"
      tabindex="-1"
      aria-labelledby="hs-scale-animation-modal-label"
    >
      <div
        class="hs-overlay-animation-target hs-overlay-open:scale-100 hs-overlay-open:opacity-100 scale-95 opacity-0 ease-in-out transition-all duration-200 sm:max-w-lg sm:w-full m-3 sm:mx-auto min-h-[calc(100%-56px)] flex items-center"
      >
        <div
          class="w-full flex flex-col bg-overlay border border-overlay-line shadow-2xs rounded-xl pointer-events-auto"
        >
          <div
            class="flex justify-between items-center py-3 px-4 border-b border-overlay-header"
          >
            <h3
              id="hs-scale-animation-modal-label"
              class="font-semibold text-foreground"
            >
              {{ selected_modal_image }}
            </h3>
            <button
              type="button"
              class="size-8 inline-flex justify-center items-center gap-x-2 rounded-full bg-surface border border-surface-line text-surface-foreground hover:bg-surface-hover focus:outline-hidden focus:bg-surface-focus disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Close"
              data-hs-overlay="#hs-scale-animation-modal"
            >
              <span class="sr-only">Close</span>
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
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
          <div class="p-4 overflow-y-auto">
            <img
              class="w-full"
              :src="getImageUrl(selected_modal_image, selected_modal_category)"
              loading="lazy"
              alt=""
            />
            <!-- SETS -->
            <div class="w-full">
              <label
                for="set-input"
                class="block mb-2.5 text-sm font-medium text-heading"
                >Set:</label
              >
              <div class="relative flex items-center shadow-xs rounded-base">
                <button
                  type="button"
                  id="decrement-button"
                  data-input-counter-decrement="set-input"
                  @click.prevent="handleQuantity('set', 'decerement')"
                  :disabled="sets === 1"
                  class="text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded-s-base text-sm px-3 focus:outline-none h-10"
                >
                  <svg
                    class="w-4 h-4 text-heading"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 12h14"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  id="set-input"
                  data-input-counter
                  aria-describedby="helper-text-explanation"
                  class="border-x-0 h-10 placeholder:text-heading text-center w-full bg-neutral-secondary-medium border-default-medium py-2.5 placeholder:text-body"
                  placeholder="1"
                  min="1"
                  required
                  v-model="sets"
                />
                <button
                  type="button"
                  id="increment-button"
                  data-input-counter-increment="set-input"
                  @click.prevent="handleQuantity('set', 'increment')"
                  class="text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded-e-base text-sm px-3 focus:outline-none h-10"
                >
                  <svg
                    class="w-4 h-4 text-heading"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 12h14m-7 7V5"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <!-- REPS -->
            <div class="w-full mt-5">
              <label
                for="rep-input"
                class="block mb-2.5 text-sm font-medium text-heading"
                >Reps:</label
              >
              <div class="relative flex items-center shadow-xs rounded-base">
                <button
                  type="button"
                  id="decrement-button"
                  data-input-counter-decrement="rep-input"
                  @click.prevent="handleQuantity('rep', 'decerement')"
                  :disabled="reps === 1"
                  class="text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded-s-base text-sm px-3 focus:outline-none h-10"
                >
                  <svg
                    class="w-4 h-4 text-heading"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 12h14"
                    />
                  </svg>
                </button>
                <input
                  type="number"
                  id="rep-input"
                  data-input-counter
                  aria-describedby="helper-text-explanation"
                  class="border-x-0 h-10 placeholder:text-heading text-center w-full bg-neutral-secondary-medium border-default-medium py-2.5 placeholder:text-body"
                  placeholder="1"
                  min="1"
                  v-model="reps"
                />
                <button
                  type="button"
                  id="increment-button"
                  data-input-counter-increment="rep-input"
                  @click.prevent="handleQuantity('rep', 'increment')"
                  class="text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded-e-base text-sm px-3 focus:outline-none h-10"
                >
                  <svg
                    class="w-4 h-4 text-heading"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 12h14m-7 7V5"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div class="w-full text-center mt-10">
              <button
                @click.prevent="handleSelectExercise"
                :disabled="isSelectButtonDisabled"
                class="p-2 pl-5 pr-5 w-full text-white font-medium bg-[#d76821] rounded-md"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
