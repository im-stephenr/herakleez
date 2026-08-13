<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { getDB } from "/src/services/database";
import { formatDate } from "@/utils/helper";
// import HSStaticMethods from "preline";

const previous_workout_date = ref("");
const previous_workout_exercises = ref({});
const body_parts = ref([]);

const loadPreviousWorkout = async () => {
  // await nextTick();
  // HSStaticMethods?.autoInit();
  try {
    const db = getDB();
    const get_previous_workout = await db.query(
      `SELECT * FROM workouts 
       ORDER BY id DESC LIMIT 1`,
    );
    if (get_previous_workout.values.length > 0) {
      let result = get_previous_workout.values[0];
      previous_workout_date.value = formatDate(result.date);
      console.log("PREVIOUS WORKOUT", result);

      // Load previous workout exercises
      const get_previous_workout_exercises = await db.query(
        `SELECT workout_exercises.*, body_parts.name, exercises.title FROM workout_exercises 
         JOIN exercises ON workout_exercises.exercise_id=exercises.id 
         JOIN body_parts ON exercises.body_part_id=body_parts.id
         WHERE workout_exercises.workout_id=?`,
        [result.id],
      );
      if (get_previous_workout_exercises.values.length > 0) {
        previous_workout_exercises.value =
          get_previous_workout_exercises.values;
      }
    }
  } catch (err) {
    console.log("Error loading previous workout", err);
  }
};

// Handle load body parts
const loadBodyParts = async () => {
  try {
    const db = getDB();
    let get_body_parts = await db.query("SELECT name FROM body_parts");
    if (get_body_parts.values.length > 0) {
      body_parts.value = get_body_parts.values;
    }
  } catch (err) {
    console.log("Error loading body parts", err);
  }
};

const activeTab = ref("chest");
// Handle Switching tab
const handleSwitchTab = (category) => {
  activeTab.value = category;
  console.log("CATEGORY", activeTab.value);
};
onMounted(async () => {
  await loadPreviousWorkout();
  await loadBodyParts();
});
</script>
<template>
  <div v-if="previous_workout_exercises.length > 0">
    <div class="w-full mt-4 -mb-3">
      <p class="text-xs text-[#d76821] italic font-bold">
        Previous Workout
        <small class="font-medium text-[#959493]"
          >({{ previous_workout_date }})</small
        >
      </p>
    </div>
    <!-- CONTAINER -->
    <div class="content-container bg-white/60 rounded-md mt-4">
      <div class="p-2 bg-[#e2e3e2] flex flex-row">
        <div class="mr-2 mt-1">
          <!-- ICON -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="#959493"
            class="bi bi-person-arms-up"
            viewBox="0 0 16 16"
          >
            <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" />
            <path
              d="m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.5 1.5 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.7.7 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.7.7 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z"
            />
          </svg>
        </div>
        <div>
          <h1 class="text-md text-[#464543] w-full font-bold">
            Full Body Split
          </h1>
        </div>
      </div>
      <div class="w-full p-2">
        <!-- WORKOUTS -->
        <!-- Tab Nav -->
        <div class="border-b border-line-2">
          <nav
            class="flex gap-x-1"
            aria-label="Tabs"
            role="tablist"
            aria-orientation="horizontal"
          >
            <template v-for="(body_part, index) in body_parts" :key="index">
              <button
                type="button"
                :class="`${
                  body_part.name === activeTab
                    ? 'focus:text-[#d76821] text-[#d76821] border-b-2 border-b-[#d76821]'
                    : 'text-muted-foreground-1'
                } transition ease-in-out capitalize relative py-4 px-1 inline-flex items-center gap-x-2 text-sm whitespace-nowrap  after:absolute after:-bottom-px after:inset-x-0 after:w-full after:h-0.5 after:bg-transparent hover:text-primary-hover focus:outline-hidden `"
                aria-selected="true"
                @click.prevent="handleSwitchTab(body_part.name)"
                role="tab"
              >
                {{ body_part.name }}
              </button>
            </template>
          </nav>
        </div>
        <!-- End Tab Nav -->

        <!-- Tab Content -->
        <div class="mt-3">
          <!-- BODY PARTS CONTAINER -->
          <div
            v-for="(body_part, index) in body_parts"
            :key="index"
            :class="`${
              body_part.name === activeTab ? '' : 'hidden'
            } transition ease-in-out`"
            role="tabpanel"
          >
            <ul class="text-xs list-decimal ml-5 font-medium text-[#959493]">
              <template
                v-for="(exercise, index) in previous_workout_exercises"
                :key="index"
              >
                <li class="mb-1" v-if="exercise.name === body_part.name">
                  {{ exercise.title }}
                  <!-- SETS -->
                  <span
                    class="p-0.5 m-0.5 bg-red-500 rounded-sm text-white text-[10px]"
                    >{{ exercise.sets }} Set{{
                      exercise.sets > 1 ? "s" : ""
                    }}</span
                  >
                  <!-- REPS -->
                  <span
                    class="p-0.5 m-0.5 bg-blue-500 rounded-sm text-white text-[10px]"
                    >{{ exercise.reps }} Rep{{
                      exercise.sets > 1 ? "s" : ""
                    }}</span
                  >
                  <!-- WEIGHT -->
                  <span
                    v-if="exercise.max_weight !== null"
                    class="p-0.5 m-0.5 bg-blue-500 rounded-sm text-white text-[10px]"
                    >{{ exercise.max_weight }} lbs</span
                  >
                </li>
              </template>
            </ul>
          </div>
        </div>
        <!-- End Tab Content -->
      </div>
    </div>
  </div>
</template>
