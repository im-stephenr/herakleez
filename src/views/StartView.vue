<script setup>
import {
  onMounted,
  ref,
  shallowRef,
  useTemplateRef,
  nextTick,
  watch,
} from "vue";
import { onLongPress } from "@vueuse/core";
import { getDB } from "/src/services/database";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import Stopwatch from "@/components/Stopwatch.vue";
import { useToast } from "vue-toast-notification";

const props = defineProps({
  stopTraining: Function,
  startTraining: Function,
  workout_status: String,
  workout_id: Number,
});
const toast = useToast();
const body_parts = ref([]);
const workout_data = ref([]);
const workout_exercises_data = ref([]);
const router = useRouter();

// Body Part Images
const images = {
  "chest.jpg": new URL(
    "@/assets/images/muscle-parts/chest.jpg",
    import.meta.url,
  ).href,
  "triceps.jpg": new URL(
    "@/assets/images/muscle-parts/triceps.jpg",
    import.meta.url,
  ).href,
  "back.jpg": new URL("@/assets/images/muscle-parts/back.jpg", import.meta.url)
    .href,
  "biceps.jpg": new URL(
    "@/assets/images/muscle-parts/biceps.jpg",
    import.meta.url,
  ).href,
  "shoulders.jpg": new URL(
    "@/assets/images/muscle-parts/shoulders.jpg",
    import.meta.url,
  ).href,
  "legs.jpg": new URL("@/assets/images/muscle-parts/legs.jpg", import.meta.url)
    .href,
  "core.jpg": new URL("@/assets/images/muscle-parts/core.jpg", import.meta.url)
    .href,
};

const testDb = async () => {
  const db = getDB();
  try {
    // let test = await db.query("PRAGMA table_info(workout_exercises)");
    // await db.query("DELETE FROM  workout_exercises");

    let test = await db.query(`SELECT * FROM body_parts`);
    console.log("TEST DB ", test);
  } catch (err) {
    console.log("Error DB", err);
  }
};

// HANDLE LOAD BODY PARTS
const loadBodyParts = async () => {
  const db = getDB();
  try {
    let get_body_parts = await db.query("SELECT * FROM body_parts");
    body_parts.value = get_body_parts.values;
    console.log("Body Parts: ", body_parts.value);
  } catch (err) {
    console.log("Error DB", err);
  }
};

// HANDLE LOAD WORKOUT
const loadWorkout = async () => {
  const db = getDB();
  try {
    let get_workout_data = await db.query("SELECT * FROM workouts WHERE id=?", [
      props.workout_id,
    ]);
    workout_data.value = get_workout_data.values;
    console.log("CURRENT WORKOUT: ", workout_data.value);
  } catch (err) {
    console.log("Error DB", err);
  }
};

// Handle Load Workout Exercises
const loadWorkoutExercises = async () => {
  const db = getDB();
  try {
    let get_workout_exercises = await db.query(
      `SELECT workout_exercises.*,
              exercises.image_path,
              exercises.body_part_id,
              exercises.title
       FROM workout_exercises
       JOIN exercises
       ON workout_exercises.exercise_id=exercises.id
       WHERE workout_id=?`,
      [props.workout_id],
    );
    workout_exercises_data.value = get_workout_exercises.values;
    console.log("Workout exercises: ", workout_exercises_data.value);
  } catch (err) {
    console.log("ERROR LOADING WORKOUT EXERCISES", err);
  }
};

// HANDLE LONG PRESS
const body_parts_ref = {};
const long_pressed_fired = ref(false);
const hiddenModalTrigger = useTemplateRef("hiddenModalTrigger");
const closeModalTrigger = useTemplateRef("closeModalTrigger");
const selected_body_part = ref("");
const selected_body_part_exercises = ref({});

const setBodyPartRef = (el, body_part_id) => {
  if (!el || body_parts_ref[body_part_id]) return;
  body_parts_ref[body_part_id] = el;

  onLongPress(
    el,
    async () => {
      long_pressed_fired.value = true;
      console.log("Long Pressed Show Modal: ", body_part_id);
      await nextTick();
      hiddenModalTrigger.value?.click();
      // Load Selected Body Part Exercises and display to modal
      loadSelectedBodyPartExercises(body_part_id);
    },
    { duration: 500 },
  );
};

// Load Selected Body Part Exercises
const loadSelectedBodyPartExercises = async (body_part_id) => {
  selected_body_part_exercises.value = workout_exercises_data.value.filter(
    (item) => item.body_part_id === body_part_id,
  );
  // Get Selected Body Part Name
  selected_body_part.value = body_parts.value.find(
    (item) => item.id === body_part_id,
  )?.name;
  console.log("SELECTED BODY PART: ", selected_body_part_exercises.value);
};

// handle redirect to selected body part
const handleRedirectOnTap = (bodyPartId) => {
  if (long_pressed_fired.value) {
    long_pressed_fired.value = false; // reset, swallow this click
    return;
  }
  router.push({
    name: "start-selected-body-part",
    params: { body_part: bodyPartId },
  });
};

// MODAL FUNCTION CLOSE
const closeModal = async () => {
  await nextTick();
  closeModalTrigger.value?.click();
};

// HANDLE UPDATE SELECTED BODY PART EXERCISES
const handleUpdateSelectedBodyPartExercise = async () => {
  console.log("UPDATED", selected_body_part_exercises.value);
  const db = getDB();

  for (const exercise of selected_body_part_exercises.value) {
    try {
      const result = await db.query(
        `UPDATE workout_exercises SET sets=?, reps=?, max_weight=? WHERE id=?`,
        [exercise.sets, exercise.reps, exercise.max_weight, exercise.id],
      );
      console.log("UPDATED SUCCESSFULLY", exercise.exercise_id, result);
    } catch (err) {
      console.log("ERROR LOADING WORKOUT EXERCISES", err);
    }
  }
  // Close modal
  closeModal();
  // Show toast notif
  toast.success("Updated Successfully!", {
    position: "bottom",
  });
};

// Handle Increment/Decrement
const handleQuantity = (id, column, category) => {
  let selected_exercise = workout_exercises_data.value.filter(
    (item) => item.id === id,
  );
  if (category === "decrement") {
    if (selected_exercise[0][column] != 1) selected_exercise[0][column]--;
  } else {
    selected_exercise[0][column]++;
  }
};

// Handle remove exercise
const handleRemoveExercise = async (exercise_id, body_part_id) => {
  if (!confirm("Are you sure you want to remove this Exercise?")) return false;

  const db = getDB();
  try {
    await db.query("DELETE FROM workout_exercises WHERE id=?", [exercise_id]);
    // Reload Selected Bodypart Exercises
    selected_body_part_exercises.value = workout_exercises_data.value.filter(
      (item) => item.id !== exercise_id && item.body_part_id === body_part_id,
    );
    // Reload Workout Exercises
    loadWorkoutExercises();
    // Show toast notif
    toast.success("Exercise Removed Successfully!", {
      position: "bottom",
    });
  } catch (err) {
    console.log("ERROR REMOVING EXERCISE", err);
  }
};

onMounted(async () => {
  // await testDb();
  await loadBodyParts();
  await loadWorkout();
  await loadWorkoutExercises();
  await nextTick();
  window.HSStaticMethods?.autoInit();
});
</script>
<template>
  <main class="p-2 h-full mb-30 m-2">
    <!-- Adding this hidden button so the modal works -->
    <button
      ref="hiddenModalTrigger"
      data-hs-overlay="#hs-scale-animation-modal"
      class="hidden"
      aria-hidden="true"
    ></button>
    <!-- Start button -->
    <div
      class="p-2 w-full rounded-md h-[calc(100vh-200px)] flex flex-row items-center"
      v-if="workout_status == 'stop'"
    >
      <div class="relative group mx-auto">
        <!-- Outer Glow and Pulse Layer -->
        <div
          class="absolute z-1 -inset-1 bg-linear-to-r from-cyan-400 to-purple-500 rounded-full blur-md opacity-70 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse"
        ></div>
        <button
          type="button"
          @click="startTraining"
          class="p-2 pl-4 pr-4 mx-auto relative text-xl bg-[#d76821] rounded-full h-50 w-50 text-white flex justify-center items-center m-2 active:bg-[#a54b14] z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="size-6"
          >
            <path
              fill-rule="evenodd"
              d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
              clip-rule="evenodd"
            />
          </svg>
          Start Workout
        </button>
      </div>
    </div>
    <div
      :class="`flex flex-col gap-4 mt-2  ${
        workout_status == 'stop' ? 'hidden' : ''
      }`"
    >
      <!-- STOP WATCH -->
      <div class="text-center" v-if="workout_status == 'start'">
        <Stopwatch />
      </div>
      <!-- STOP WORKOUT BUTTON -->
      <button
        v-if="workout_status == 'start'"
        type="button"
        @click="stopTraining"
        class="pt-1 pb-1 w-[50%] mx-auto text-lg bg-red-900 text-white rounded-full flex justify-center m-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="size-6 mr-1"
        >
          <path
            fill-rule="evenodd"
            d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm6-2.438c0-.724.588-1.312 1.313-1.312h4.874c.725 0 1.313.588 1.313 1.313v4.874c0 .725-.588 1.313-1.313 1.313H9.564a1.312 1.312 0 0 1-1.313-1.313V9.564Z"
            clip-rule="evenodd"
          />
        </svg>

        Finish Workout
      </button>
      <div
        class="w-full rounded-sm shadow-sm h-fit flex flex-row border bg-[#f2f2f2]"
        v-for="(body_part, i) in body_parts"
        :ref="(el) => setBodyPartRef(el, body_part.id)"
        :key="body_part.id"
        @click="handleRedirectOnTap(body_part.id)"
      >
        <div class="basis-1/3">
          <!-- Title -->
          <h1 class="text-lg font-bold text-[#464543] uppercase text-center">
            {{ body_part.name }}
          </h1>
          <!-- Image -->
          <img
            class="h-30 mx-auto w-full p-1 border"
            :src="images[body_part.image_path]"
            alt=""
          />
        </div>
        <!-- List of exercises made -->
        <div class="w-full basis-2/3 pt-1 pl-5 border-l">
          <ol class="list-decimal">
            <template
              v-for="(workout_exercise, index) in workout_exercises_data"
            >
              <li
                v-if="body_part.id === workout_exercise.body_part_id"
                :key="index"
                class="text-sm font-bold mb-1"
              >
                {{ workout_exercise.title }}
                <br />
                <small
                  class="font-bold bg-red-500 p-0.5 rounded-sm text-white mr-1"
                  >Set: {{ workout_exercise.sets }}</small
                >
                <small
                  class="font-bold bg-green-500 p-0.5 rounded-sm text-white mr-1"
                  >Reps: {{ workout_exercise.reps }}</small
                >
                <small class="font-bold bg-blue-500 p-0.5 rounded-sm text-white"
                  >Max: {{ workout_exercise?.max_weight || 0 }} lbs</small
                >
              </li>
            </template>
          </ol>
        </div>
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
              class="font-semibold text-foreground uppercase"
            >
              {{ selected_body_part }}
            </h3>
            <button
              ref="closeModalTrigger"
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
          <div class="p-2 overflow-y-auto">
            <form @submit.prevent="handleUpdateSelectedBodyPartExercise">
              <div
                class="mb-2 p-2"
                v-for="(exercise, i) in selected_body_part_exercises"
              >
                <!-- Exercise -->
                <div class="w-full flex relative border p-2 mb-2 bg-gray-200">
                  <h1 class="text-md font-bold text-left">
                    {{ exercise.title }}
                  </h1>
                  <!-- REMOVE EXERCISE -->
                  <button
                    type="button"
                    class="p-1 bg-red-700 absolute -right-3 -top-3 rounded-full"
                    @click.prevent="
                      handleRemoveExercise(exercise.id, exercise.body_part_id)
                    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-4 text-white"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div class="flex gap-2">
                  <!-- SETS -->
                  <div class="">
                    <label
                      for="set-input"
                      class="block mb-2.5 text-sm font-medium text-heading"
                      >Set:</label
                    >
                    <div
                      class="relative flex items-center shadow-xs rounded-base"
                    >
                      <button
                        @click.prevent="
                          handleQuantity(exercise.id, 'sets', 'decrement')
                        "
                        type="button"
                        id="decrement-button"
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
                        type="text"
                        id="set-input"
                        data-input-counter
                        aria-describedby="helper-text-explanation"
                        class="border-x-0 h-10 placeholder:text-heading text-center w-full bg-neutral-secondary-medium border-default-medium py-2.5 placeholder:text-body"
                        placeholder="1"
                        min="1"
                        required
                        v-model="exercise.sets"
                      />
                      <button
                        type="button"
                        id="increment-button"
                        @click.prevent="
                          handleQuantity(exercise.id, 'sets', 'increment')
                        "
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
                  <div class="">
                    <label
                      for="rep-input"
                      class="block mb-2.5 text-sm font-medium text-heading"
                      >Reps:</label
                    >
                    <div
                      class="relative flex items-center shadow-xs rounded-base"
                    >
                      <button
                        type="button"
                        id="decrement-button"
                        @click.prevent="
                          handleQuantity(exercise.id, 'reps', 'decrement')
                        "
                        data-input-counter-decrement="rep-input"
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
                        type="text"
                        id="rep-input"
                        data-input-counter
                        aria-describedby="helper-text-explanation"
                        class="border-x-0 h-10 placeholder:text-heading text-center w-full bg-neutral-secondary-medium border-default-medium py-2.5 placeholder:text-body"
                        placeholder="1"
                        min="1"
                        v-model="exercise.reps"
                      />
                      <button
                        type="button"
                        id="increment-button"
                        @click.prevent="
                          handleQuantity(exercise.id, 'reps', 'increment')
                        "
                        data-input-counter-increment="rep-input"
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
                  <!-- MAX WEIGHT -->
                  <div class="">
                    <label
                      for="rep-input"
                      class="block mb-2.5 text-sm font-medium text-heading"
                      >Max:</label
                    >
                    <div
                      class="relative flex items-center shadow-xs rounded-base"
                    >
                      <input
                        type="number"
                        v-model="exercise.max_weight"
                        class="text-body w-full bg-neutral-secondary-medium box-border border border-default-medium focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded-s-base text-sm h-10"
                      />
                      <div
                        class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        lbs
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="text-center w-full relative p-2">
                <button
                  type="submit"
                  class="p-2 text-white w-[80%] bg-[#d76821] m-2 rounded-md"
                >
                  UPDATE
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
