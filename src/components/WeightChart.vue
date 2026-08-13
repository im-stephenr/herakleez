<script setup>
import { onMounted, ref } from "vue";
import { getDB } from "/src/services/database";
import { formatDate, formatMonthDay } from "@/utils/helper";

// let monday_list = ref([]);
// const today = new Date();
const list_weights = ref({});

const getMondaysInMonth = (year, month) => {
  const mondays = [];
  // Start at the 1st day of the target month
  const date = new Date(year, month, 1);

  // Find the very first Monday of the month (1 represents Monday)
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() + 1);
  }

  // Loop and add all subsequent Mondays within the same month
  while (date.getMonth() === month) {
    mondays.push(
      date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      }),
    );
    date.setDate(date.getDate() + 7);
  }

  return mondays;
};
// List of mondays in current month
// const currentMonthMondays = ref(
//   getMondaysInMonth(today.getFullYear(), today.getMonth()),
// );

const chartOptions = ref({
  chart: {
    id: "weight-chart",
    toolbar: false,
  },
  xaxis: {
    categories: [],
  },
  fill: {
    colors: ["#d76821"],
  },
});

const series = ref([
  {
    name: "Weight in KG",
    data: [], // list of weights every monday
  },
]);

// handle load weights
const loadWeights = async () => {
  try {
    const db = getDB();
    const get_weights = await db.query(
      `SELECT *
        FROM (
            SELECT *
            FROM weights
            ORDER BY date DESC
            LIMIT 10
        ) AS latest_weights
        ORDER BY date ASC`,
    );
    if (get_weights.values.length > 0) {
      list_weights.value = get_weights.values;
      series.value = [
        {
          name: "Weight in KG",
          data: list_weights.value.map((item) => item.weight),
        },
      ];

      chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
          categories: list_weights.value.map((item) =>
            formatMonthDay(item.date),
          ),
        },
      };
    }
  } catch (err) {
    console.log("Error loading weights", err);
  }
};

onMounted(async () => {
  await loadWeights();
});
</script>
<template>
  <div>
    <div class="w-full mt-4 -mb-3">
      <p class="text-xs text-[#d76821] italic font-bold">Weight Progress</p>
    </div>
    <!-- CONTAINER -->
    <div class="content-container bg-white/60 mt-4">
      <div
        v-if="list_weights.length > 0"
        class="relative flex flex-col bg-clip-border text-gray-700 pb-4"
      >
        <div class="p-2 bg-[#e2e3e2] flex flex-row">
          <div class="mr-2 -mt-.5">
            <!-- ICON -->
            <svg
              width="20px"
              height="20px"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#959493"
                d="M256 46c-45.074 0-82 36.926-82 82 0 25.812 12.123 48.936 30.938 64H128L32 480h448l-96-288h-76.938C325.877 176.936 338 153.812 338 128c0-45.074-36.926-82-82-82zm0 36c25.618 0 46 20.382 46 46s-20.382 46-46 46-46-20.382-46-46 20.382-46 46-46zm-82.215 202.95h23.5v33.263l33.873-33.264h27.283l-43.883 43.15 48.4 47.974H233.54l-36.255-35.888v35.888h-23.5V284.95zm119.934 21.24c4.76 0 8.952.934 12.573 2.806 3.62 1.872 6.938 4.82 9.95 8.85v-10.13h21.972v61.462c0 10.986-3.48 19.368-10.438 25.146-6.917 5.82-16.968 8.727-30.152 8.727-4.272 0-8.4-.325-12.39-.976-3.986-.65-7.996-1.647-12.024-2.99v-17.03c3.826 2.198 7.57 3.826 11.23 4.884 3.664 1.098 7.347 1.648 11.05 1.648 7.162 0 12.41-1.566 15.746-4.7 3.337-3.132 5.006-8.035 5.006-14.708v-4.7c-3.01 3.986-6.328 6.916-9.95 8.788-3.62 1.87-7.813 2.808-12.573 2.808-8.343 0-15.238-3.275-20.69-9.826-5.453-6.592-8.18-14.974-8.18-25.146 0-10.214 2.727-18.576 8.18-25.086 5.452-6.55 12.347-9.827 20.69-9.827zm8.118 15.746c-4.517 0-8.038 1.67-10.56 5.005-2.523 3.338-3.784 8.058-3.784 14.162 0 6.266 1.22 11.026 3.662 14.28 2.442 3.215 6.003 4.823 10.682 4.823 4.557 0 8.096-1.67 10.62-5.006 2.522-3.337 3.784-8.036 3.784-14.098 0-6.104-1.262-10.824-3.785-14.16-2.523-3.337-6.062-5.006-10.62-5.006z"
              ></path>
            </svg>
          </div>
          <div>
            <h1 class="text-md text-[#464543] w-full font-bold">
              Weight Progress
            </h1>
          </div>
        </div>
        <p class="text-xs ml-2 mt-2">
          Your latest weight progress based on your last 10 entries.
        </p>
        <apexchart
          id="weight-chart"
          class="w-full bg-white/60"
          type="line"
          :options="chartOptions"
          :series="series"
        ></apexchart>
      </div>
      <div v-else>
        <p class="text-md ml-2 -mt-2 pt-10 text-center pb-10">
          You don't have any weight data entered at the moment.
        </p>
      </div>
    </div>
  </div>
</template>
