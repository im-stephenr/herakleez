<script setup>
import { onMounted, ref } from "vue";

const quotes = ref([
  "You don’t find willpower; you create it.",
  "The harder the battle, the sweeter the victory.",
  "Obstacles are opportunities in disguise. Embrace the challenge.",
  "Every accomplishment starts with the decision to try.",
  "Every obstacle is an opportunity to prove your strength.",
  "A Viking does not fear the storm; he becomes it.",
  "In the heat of battle, you find your true self.",
  "The path to glory is paved with courage and sacrifice.",
]);

const random_quote = ref("");

function changeQuote() {
  random_quote.value =
    quotes.value[Math.floor(Math.random() * quotes.value.length)];
}

onMounted(() => {
  changeQuote();
});
</script>
<template>
  <div
    class="content-container-banner bg-white/60 rounded-md flex flex-row mt-5"
  >
    <div
      class="p-2 text-center text-[#464543] mt-1 italic font-bold leading-4 pl-5"
    >
      “ {{ random_quote }} ”
    </div>
    <div class="pr-6">
      <img
        src="/src/assets/images/hercules.png"
        class="-mt-10"
        width="120"
        alt=""
      />
    </div>
  </div>
</template>
