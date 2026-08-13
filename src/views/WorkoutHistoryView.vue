<script setup>
import { nextTick, onMounted, ref } from "vue";
import { getDB } from "/src/services/database";
import HSStaticMethods from "preline";
import { formatDate } from "@/utils/helper";
import { onLongPress } from "@vueuse/core";
import { useToast } from "vue-toast-notification";

const workouts = ref([]);
const body_parts = ref([]);
// const filter_category = ref("this_month");
const total_workout = ref(0);
const is_loading = ref(true);
const toast = useToast();
// Handle load workouts
const loadWorkouts = async (category) => {
  let filter_query =
    category === "this_month"
      ? "WHERE strftime('%m', date) = strftime('%m', 'now')"
      : "";
  await nextTick();
  HSStaticMethods.autoInit();
  const db = getDB();
  try {
    // GROUP workout_exercises by using sqlite json_group_array
    let get_exercises = await db.query(
      `SELECT
            w.id,
            w.date,
            w.start_time,
            w.end_time,
            json_group_array(
                json_object(
                    'id', we.id,
                    'exercise_id', we.exercise_id,
                    'title', e.title,
                    'body_part', bp.name,
                    'sets', we.sets,
                    'reps', we.reps,
                    'weight', we.max_weight
                )
            ) AS exercises
        FROM workouts w
        LEFT JOIN workout_exercises we
            ON we.workout_id = w.id
        LEFT JOIN exercises e
            ON e.id = we.exercise_id
        LEFT JOIN body_parts bp
            ON bp.id = e.body_part_id
        ${filter_query}
        GROUP BY w.id
        ORDER BY w.id DESC`,
    );
    if (get_exercises.values.length > 0) {
      total_workout.value = get_exercises.values.length;

      workouts.value = get_exercises.values.map((workout) => ({
        ...workout,
        exercises: JSON.parse(workout.exercises || "[]"), // format the exercises data from sql
      }));
    }
    is_loading.value = false;
  } catch (err) {
    console.log("Error loading loading workouts", err);
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

    console.log("Body parts", body_parts.value);
  } catch (err) {
    console.log("Error loading body parts", err);
  }
};

// Handle Filter
const handleFilter = async (category) => {
  // filter_category.value = category;
  is_loading.value = true;
  await loadWorkouts(category);
};

// Handle Delete
// On long press
const long_pressed_fired = ref(false);
const deleteWorkout = (el, id) => {
  if (!el) return;

  onLongPress(
    el,
    async () => {
      const db = getDB();
      long_pressed_fired.value = true;
      if (!confirm("Do you want to remove this workout?")) return false;
      try {
        const result = await db.query("DELETE FROM workouts WHERE id=?", [id]);
        toast.success("Workout deleted successfully!", {
          position: "bottom",
        });
        await loadWorkouts("this_month");
      } catch (err) {
        console.log("ERROR DELETING WORKOUT", err);
      }
    },
    { duration: 500 },
  );
};

onMounted(async () => {
  await loadBodyParts();
  await loadWorkouts("this_month");
  await nextTick();
  HSStaticMethods?.autoInit();
});
</script>
<template>
  <main class="content-container bg-white/60 shadow-sm p-2 h-full mb-40 m-2">
    <!-- HEADER TITLE -->
    <h1 class="text-[#464543] text-lg text-center font-bold">
      WORKOUT HISTORY
    </h1>
    <p class="text-center text-xs text-[#959493] mb-5">
      Total of <b>{{ total_workout }}</b> workouts
    </p>

    <!-- FILTER BUTTON -->
    <div class="flex flex-row gap-2">
      <div
        class="w-full flex items-center ps-4 border border-default bg-[#e2e3e2] rounded-md"
      >
        <input
          checked
          id="bordered-radio-1"
          type="radio"
          value=""
          name="bordered-radio"
          @change="handleFilter('this_month')"
          class="w-4 h-4 text-neutral-primary bg-[#959493] border-default-medium rounded-full checked:bg-[#d76821] focus:outline-none border border-default appearance-none"
        />
        <label
          for="bordered-radio-1"
          class="w-full py-2 select-none ms-2 text-sm font-medium text-heading"
          >Current Month</label
        >
      </div>
      <div
        class="w-full flex items-center ps-4 border border-default bg-[#e2e3e2] rounded-md"
      >
        <input
          id="bordered-radio-2"
          type="radio"
          value=""
          name="bordered-radio"
          @change="handleFilter('all')"
          class="w-4 h-4 text-neutral-primary bg-[#959493] border-default-medium rounded-full checked:bg-[#d76821] focus:outline-none border border-default appearance-none"
        />
        <label
          for="bordered-radio-2"
          class="w-full py-2 select-none ms-2 text-sm font-medium text-heading"
          >All</label
        >
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
      Fetching your workouts...
    </div>
    <!-- TAB CONTAINER -->
    <!-- IF NO WORKOUTS FOUND SHOW THIS MESSAGE -->
    <div
      v-if="workouts.length === 0 && is_loading === false"
      class="mt-20 mb-20 text-center"
    >
      You don't have any workouts yet. <br />
      <b> Start working out now! </b>
    </div>
    <!-- LIST OF WORKOUTS -->
    <div
      class="mb-5 shadow-md"
      v-for="(workout, index) in workouts"
      :key="index"
      :ref="(el) => deleteWorkout(el, workout.id)"
    >
      <!-- CONTAINER -->
      <div class="content-container bg-white rounded-md shadow-sm mt-4">
        <div class="p-2 bg-[#464543] rounded-t-md flex flex-row">
          <div class="mr-2 mt-1">
            <!-- ICON -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#959493"
              class="size-6"
            >
              <path
                d="M12 11.993a.75.75 0 0 0-.75.75v.006c0 .414.336.75.75.75h.006a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75H12ZM12 16.494a.75.75 0 0 0-.75.75v.005c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H12ZM8.999 17.244a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.006ZM7.499 16.494a.75.75 0 0 0-.75.75v.005c0 .414.336.75.75.75h.005a.75.75 0 0 0 .75-.75v-.005a.75.75 0 0 0-.75-.75H7.5ZM13.499 14.997a.75.75 0 0 1 .75-.75h.006a.75.75 0 0 1 .75.75v.005a.75.75 0 0 1-.75.75h-.006a.75.75 0 0 1-.75-.75v-.005ZM14.25 16.494a.75.75 0 0 0-.75.75v.006c0 .414.335.75.75.75h.005a.75.75 0 0 0 .75-.75v-.006a.75.75 0 0 0-.75-.75h-.005ZM15.75 14.995a.75.75 0 0 1 .75-.75h.005a.75.75 0 0 1 .75.75v.006a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1-.75-.75v-.006ZM13.498 12.743a.75.75 0 0 1 .75-.75h2.25a.75.75 0 1 1 0 1.5h-2.25a.75.75 0 0 1-.75-.75ZM6.748 14.993a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z"
              />
              <path
                fill-rule="evenodd"
                d="M18 2.993a.75.75 0 0 0-1.5 0v1.5h-9V2.994a.75.75 0 1 0-1.5 0v1.497h-.752a3 3 0 0 0-3 3v11.252a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3V7.492a3 3 0 0 0-3-3H18V2.993ZM3.748 18.743v-7.5a1.5 1.5 0 0 1 1.5-1.5h13.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5h-13.5a1.5 1.5 0 0 1-1.5-1.5Z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h1 class="text-md text-white mt-1 w-full font-bold">
              {{ formatDate(workout.date) }}
            </h1>
          </div>
        </div>
        <div class="w-full p-2 bg-[#959493] text-white">
          <!-- WORKOUTS -->
          <!-- Tab Nav -->
          <div class="border-b border-line-2">
            <nav
              :id="`hs-tabs_${workout.id}`"
              class="flex gap-x-1"
              aria-label="Tabs"
              role="tablist"
              aria-orientation="horizontal"
            >
              <template v-for="(body_part, index) in body_parts" :key="index">
                <button
                  type="button"
                  :class="`${
                    body_part.name === 'chest' ? 'active' : ''
                  } text-white capitalize hs-tab-active:font-semibold hs-tab-active:text-primary-active hs-tab-active:after:bg-primary-active relative py-4 px-1 inline-flex items-center gap-x-2 text-sm whitespace-nowrap after:absolute after:-bottom-px after:inset-x-0 after:w-full after:h-0.5 after:bg-transparent hover:text-primary-hover focus:outline-hidden focus:text-primary-focus disabled:opacity-50 disabled:pointer-events-none`"
                  aria-selected="true"
                  :data-hs-tab="`#${body_part.name}_tab_${workout.id}`"
                  :aria-controls="`${body_part.name}_tab_${workout.id}`"
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
            <!-- BODY PARTS TAB -->
            <div
              v-for="(body_part, index) in body_parts"
              :key="index"
              :id="`${body_part.name}_tab_${workout.id}`"
              :class="`${body_part.name == 'chest' ? '' : 'hidden'}`"
              role="tabpanel"
            >
              <ul class="text-xs list-decimal ml-5 font-medium">
                <template v-for="(exercise, i) in workout.exercises" :key="i">
                  <li class="mb-2" v-if="exercise.body_part === body_part.name">
                    <!-- TITLE -->
                    {{ exercise.title }}
                    <!-- SETS -->
                    <span class="p-0.5 m-0.5 bg-red-500 rounded-sm text-[10px]"
                      >{{ exercise.sets }} Set{{
                        exercise.sets > 1 ? "s" : ""
                      }}</span
                    >
                    <!-- REPS -->
                    <span class="p-0.5 m-0.5 bg-blue-500 rounded-sm text-[10px]"
                      >{{ exercise.reps }} Rep{{
                        exercise.sets > 1 ? "s" : ""
                      }}</span
                    >
                    <!-- WEIGHT -->
                    <span
                      v-if="exercise.max_weight !== null"
                      class="p-0.5 m-0.5 bg-blue-500 rounded-sm text-[10px]"
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
  </main>
</template>
