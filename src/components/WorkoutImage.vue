<script setup>
const props = defineProps({
  title: String,
  category: String,
  exerciseExist: String,
  previousExerciseExist: String,
});
const getImageUrl = (name, category) => {
  return new URL(
    `../assets/images/workouts/${category}/${name}.gif`,
    import.meta.url,
  ).href;
};

const emit = defineEmits(["updateSelectedModalImage"]);

const handleUpdateInfo = () => {
  emit("updateSelectedModalImage", props.title);
};
</script>
<template>
  <div
    :class="`border border-1-[#c7c7c6] p-1 rounded-md shadow-sm text-center relative ${
      exerciseExist === 'true'
        ? 'bg-[#d76821] opacity-50 pointer-events-none'
        : 'bg-white'
    } `"
    aria-haspopup="dialog"
    aria-expanded="false"
    aria-controls="hs-scale-animation-modal"
    data-hs-overlay="#hs-scale-animation-modal"
    @click="handleUpdateInfo"
  >
    <img :src="getImageUrl(title, category)" alt="" />
    <p class="text-xs text-[#464543] leading-none font-medium mt-1">
      {{ title }}
    </p>
    <small
      class="text-[10px] text-white p-1 rounded-md italic bg-red-700 absolute top-0 leading-none shadow-md"
      v-if="previousExerciseExist === 'true'"
      >Previous Workout</small
    >
  </div>
</template>
