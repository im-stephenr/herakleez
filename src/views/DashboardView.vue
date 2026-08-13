<script setup>
import BannerQuote from "@/components/BannerQuote.vue";
import BMI from "@/components/BMI.vue";
import DashoardUserInfo from "@/components/DashoardUserInfo.vue";
import PreviousWorkout from "@/components/PreviousWorkout.vue";
import WeekResultCards from "@/components/WeekResultCards.vue";
import WeightChart from "@/components/WeightChart.vue";
import HSStaticMethods from "preline";
import { nextTick, onMounted, onUnmounted, ref } from "vue";

const today = ref(new Date());
// From DefaultLayout.vue
const props = defineProps({
  profile_data: Object,
  loadProfile: Function,
});

onMounted(async () => {
  await nextTick();
  HSStaticMethods?.autoInit();
});
</script>
<template>
  <div class="h-full mb-35 p-2">
    <!-- User Info -->
    <DashoardUserInfo
      :loadProfile="loadProfile"
      :profile_data="profile_data"
      :today="today"
    />
    <!-- Banner -->
    <BannerQuote />
    <!-- BMI -->
    <BMI :loadProfile="loadProfile" :profile_data="profile_data" />
    <!-- THIS WEEK RESULTS -->
    <WeekResultCards />
    <!-- WEIGHT PROGRESS -->
    <WeightChart />
    <!-- PREVIOUS WORKOUT -->
    <PreviousWorkout />
  </div>
</template>
