<script setup>
import { ref } from "vue";
import FooterIcons from "./FooterIcons.vue";
const props = defineProps({
  current_page: String,
  workout_status: String,
});
</script>
<template>
  <footer
    class="flex flex-row justify-between fixed bottom-0 left-0 w-full p-5 bg-white shadow-[0_-5px_8px_-1px_rgba(0,0,0,0.1)] rounded-t-xl"
  >
    <!-- HOME -->
    <router-link to="/">
      <FooterIcons title="Home" :current_page="current_page">
        <template v-slot:icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            :fill="`${
              current_page == '/' || current_page == '' ? '#d76821' : '#445664'
            }`"
            class="size-6 mx-auto"
          >
            <path
              d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z"
            />
            <path
              d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z"
            />
          </svg>
        </template>
      </FooterIcons>
    </router-link>

    <!-- Exercises -->
    <router-link to="/exercises">
      <FooterIcons title="Exercises" :current_page="current_page">
        <template v-slot:icon>
          <svg
            :fill="`${current_page == '/exercises' ? '#d76821' : '#445664'}`"
            class="size-6 mx-auto"
            viewBox="0 0 472.615 472.615"
            stroke="rgb(199, 199, 198)"
          >
            <g>
              <path
                d="M454.157,207.697h-20.765v-55.651h-57.312v-50.204h-57.311v105.855H153.846V101.842H96.535v50.204H39.223v55.651H18.457 C8.264,207.697,0,215.96,0,226.154v20.305c0,10.193,8.264,18.457,18.457,18.457h20.766v55.56l57.312,0.065v50.233h57.221V264.916 h165.014v105.858h57.311v-50.207h57.312v-55.651h20.765c10.195,0,18.459-8.264,18.459-18.457v-20.305 C472.615,215.96,464.351,207.697,454.157,207.697z"
              />
            </g>
          </svg>
        </template>
      </FooterIcons>
    </router-link>
    <router-link to="/start">
      <!-- START -->
      <button
        type="button"
        class="text-[#464543] -mt-15 text-sm font-bold p-1"
        style="width: 90px; line-height: 0.9"
      >
        <img
          :src="`/images/${
            workout_status == 'start' ? 'ongoing-workout' : 'fist-dumbbell2'
          }.png`"
          class="start-button mb-2"
          :style="
            workout_status === 'start'
              ? 'animation: breathe 2s ease-in-out infinite;'
              : ''
          "
          alt=""
        />
        {{ workout_status == "start" ? "On-going Workout" : "Workout Now" }}
      </button>
    </router-link>
    <!-- Workout History -->
    <router-link to="/workout-history">
      <FooterIcons title="History" :current_page="current_page">
        <template v-slot:icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            :fill="`${
              current_page == '/workout-history' ? '#d76821' : '#445664'
            }`"
            class="size-6 mx-auto"
          >
            <path
              d="M5.625 3.75a2.625 2.625 0 1 0 0 5.25h12.75a2.625 2.625 0 0 0 0-5.25H5.625ZM3.75 11.25a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75ZM3 15.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75ZM3.75 18.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75Z"
            />
          </svg>
        </template>
      </FooterIcons>
    </router-link>
    <!-- SETTINGS -->
    <router-link to="/settings">
      <FooterIcons title="Settings" :current_page="current_page">
        <template v-slot:icon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            :fill="`${current_page == '/settings' ? '#d76821' : '#445664'}`"
            class="size-6 mx-auto"
          >
            <path
              fill-rule="evenodd"
              d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
              clip-rule="evenodd"
            />
          </svg>
        </template>
      </FooterIcons>
    </router-link>
  </footer>
</template>
