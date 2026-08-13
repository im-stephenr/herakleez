<script setup>
import { computed, onMounted } from "vue";

const props = defineProps({
  title: String,
  current_page: String,
});

// Replacing the current pages to match the title
const currentPage = computed(() => {
  const pages = {
    "/": "Home",
    "": "Home",
    "/settings": "Settings",
    "/exercises": "Exercises",
    "/workout-history": "History",
  };

  return pages[props.current_page] ?? props.current_page;
});
onMounted(() => {
  console.log("title", props.title);
  console.log("current_page", props.current_page);
});
</script>
<template>
  <div class="p-2 flex-col">
    <slot name="icon"></slot>
    <span
      :class="[
        'text-xs',
        'font-medium',
        currentPage.toLowerCase() === title.toLowerCase()
          ? 'text-[#d76821]'
          : 'text-[#445664]',
      ]"
    >
      {{ title }}
    </span>
  </div>
</template>
