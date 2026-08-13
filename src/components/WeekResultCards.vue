<script setup>
import { onMounted, ref } from "vue";
import { getDB } from "/src/services/database";

const workout_this_week = ref(0);
const workout_sets_this_week = ref(0);
const workout_duration_this_week = ref(0);

// HANDLE TOTAL WORKOUT THIS WEEK
const loadWorkoutThisWeek = async () => {
  try {
    const db = getDB();

    let get_workout_this_week = await db.query(
      "SELECT COUNT(*) as total FROM workouts WHERE date BETWEEN date('now', 'weekday 0', '-6 days') AND date('now', 'weekday 0')",
    );
    workout_this_week.value = get_workout_this_week.values[0].total;
    console.log("Workouts", workout_this_week.value);
  } catch (err) {
    console.log("Error Loading Workout this week", err);
  }
};

// HANDLE TOTAL SETS THIS WEEK
const loadWorkoutSetsThisWeek = async () => {
  try {
    const db = getDB();

    let get_workout_sets_this_week = await db.query(
      "SELECT SUM(workout_exercises.sets) as total FROM workouts JOIN workout_exercises ON workouts.id=workout_exercises.workout_id WHERE workouts.date BETWEEN date('now', 'weekday 0', '-6 days') AND date('now', 'weekday 0')",
    );
    workout_sets_this_week.value = get_workout_sets_this_week.values[0].total;
  } catch (err) {
    console.log("Error Loading Workout Sets this week", err);
  }
};

// HANDLE TOTAL HOURS THIS WEEK
const loadWorkoutDurationThisWeek = async () => {
  try {
    const db = getDB();

    let get_workout_duration_this_week = await db.query(
      `SELECT time(
                SUM(
                          strftime('%s', end_time) -
                          strftime('%s', start_time)
                      ),
                      'unixepoch'
                  ) AS total_duration
          FROM workouts 
      WHERE end_time!='' AND date BETWEEN date('now', 'weekday 0', '-6 days') AND date('now', 'weekday 0')`,
    );
    if (get_workout_duration_this_week.values.length > 0) {
      workout_duration_this_week.value =
        get_workout_duration_this_week.values[0].total_duration;
    }
  } catch (err) {
    console.log("Error Loading Workout Sets this week", err);
  }
};

onMounted(async () => {
  await loadWorkoutThisWeek();
  await loadWorkoutSetsThisWeek();
  await loadWorkoutDurationThisWeek();
});
</script>
<template>
  <div>
    <div class="w-full mt-4 -mb-3">
      <p class="text-xs text-[#d76821] italic font-bold">This week</p>
    </div>
    <div class="flex flex-row gap-2 justify-center-safe w-full mt-4">
      <!-- WORKOUT -->
      <div class="rounded-lg p-2 bg-white/60 text-center w-full">
        <svg
          fill="#d76821"
          class="size-8 mx-auto"
          viewBox="0 0 472.615 472.615"
          stroke="rgb(199, 199, 198)"
        >
          <g>
            <path
              d="M454.157,207.697h-20.765v-55.651h-57.312v-50.204h-57.311v105.855H153.846V101.842H96.535v50.204H39.223v55.651H18.457 C8.264,207.697,0,215.96,0,226.154v20.305c0,10.193,8.264,18.457,18.457,18.457h20.766v55.56l57.312,0.065v50.233h57.221V264.916 h165.014v105.858h57.311v-50.207h57.312v-55.651h20.765c10.195,0,18.459-8.264,18.459-18.457v-20.305 C472.615,215.96,464.351,207.697,454.157,207.697z"
            />
          </g>
        </svg>
        <p class="font-bold text-[#959493] text-lg">{{ workout_this_week }}</p>
        <small class="font-bold text-[#d76821]">Workout</small>
      </div>
      <!-- CALORIES -->
      <div class="rounded-lg p-2 bg-white/60 text-center w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#d76821"
          class="size-8 mx-auto"
        >
          <path
            fill-rule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
            clip-rule="evenodd"
          />
        </svg>

        <p class="font-bold text-[#959493] text-lg">
          {{ workout_duration_this_week || "0:00:00" }}
        </p>
        <small class="font-bold text-[#d76821]">Duration</small>
      </div>
      <!-- SETS -->
      <div class="rounded-lg p-2 bg-white/60 text-center w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="#d76821"
          class="size-8 mx-auto"
        >
          <path
            fill-rule="evenodd"
            d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z"
            clip-rule="evenodd"
          />
          <path
            fill-rule="evenodd"
            d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Zm9.586 4.594a.75.75 0 0 0-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.116-.062l3-3.75Z"
            clip-rule="evenodd"
          />
        </svg>

        <p class="font-bold text-[#959493] text-lg">
          {{ workout_sets_this_week || 0 }}
        </p>
        <small class="font-bold text-[#d76821]">Sets</small>
      </div>
    </div>
  </div>
</template>
