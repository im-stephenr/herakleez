<script setup>
import { onMounted, ref } from "vue";

const props = defineProps({
  today: Object,
  profile_data: Object,
  loadProfile: Function,
});

const options = {
  weekday: "long", // "Friday"
  month: "long", // "June"
  day: "numeric", // "12"
};

onMounted(async () => {
  await props.loadProfile();
});
</script>
<template>
  <div class="flex flex-row w-full">
    <!-- AVATAR -->

    <div class="p-1 w-full">
      <!-- LEVEL -->
      <div class="flex flex-row w-full">
        <div class="w-full flex gap-1">
          <div class="basis-1/7">
            <small class="text-xs text-[#959493] font-bold">Lv. 100 </small>
          </div>
          <div class="w-full rounded-full mt-1.5">
            <div
              class="bg-[#d76821] text-[10px] font-bold text-black text-center mt-0.5 p-0.5 leading-none rounded-full h-2.5 flex items-center justify-center"
              style="width: 45%"
            >
              <span class="text-white mt-0.5">45% exp.</span>
            </div>
          </div>
        </div>
      </div>
      <!-- GREETINGS -->
      <h1 class="text-[#d76821] -mt-1.5 text-md font-bold -mb-2.5 italic">
        Hello, {{ profile_data?.first_name || "User" }}. 👋
      </h1>
      <!-- CURRENT DATE -->
      <small class="font-medium text-[#959493]">{{
        today.toLocaleDateString("en-US", options)
      }}</small>
    </div>
  </div>
</template>
