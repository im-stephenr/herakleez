<script setup>
import { onMounted } from "vue";
import "@preline/tabs"; // ensures HSTabs is attached to window

// FOR PRELINE TABS
onMounted(() => {
  setTimeout(() => window.HSTabs.autoInit(), 100);
});
</script>
<template>
  <div id="app">
    <router-view />
  </div>
</template>
