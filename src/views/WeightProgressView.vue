<script setup>
import { onMounted, ref } from "vue";
import { getDB } from "/src/services/database";
import { useToast } from "vue-toast-notification";
import { formatDate } from "@/utils/helper";

const form_data = ref({
  id: "",
  weight: "",
  date: "",
});

const list_weights = ref({});

const toast = useToast();

// Handle Update Weight
const handleWeightUpdate = async () => {
  console.log("FORM DATA", form_data.value);
  try {
    const db = getDB();
    if (form_data.value.id === "") {
      await db.query("INSERT INTO weights(weight,date) VALUES(?,?)", [
        form_data.value.weight,
        form_data.value.date,
      ]);
      //   Also update profile weight
      await db.query("UPDATE profile SET weight=?", [form_data.value.weight]);
    } else {
      await db.query("UPDATE weights SET weight=?, date=? WHERE id=?", [
        form_data.value.weight,
        form_data.value.date,
        form_data.value.id,
      ]);
    }
    form_data.value.weight = "";
    form_data.value.date = "";
    form_data.value.id = "";
    loadWeights();
    // Show toast notif
    toast.success("Weight Updated Successfully!", {
      position: "bottom",
    });
  } catch (err) {
    console.log("Error save weight");
  }
};

// Handle Update
const handleUpdate = async (id) => {
  try {
    const db = getDB();
    const result = await db.query("SELECT * FROM weights WHERE id=?", [id]);

    if (result.values.length > 0) {
      const weight_data = result.values[0];
      form_data.value.id = weight_data.id;
      form_data.value.weight = weight_data.weight;
      form_data.value.date = weight_data.date;
    }
  } catch (err) {
    console.log("Error updating weight", err);
  }
};

// handle delete
const handleDelete = async (id) => {
  try {
    if (!confirm("Are you sure you want to delete this weight?")) return false;
    const db = getDB();
    await db.query("DELETE FROM weights WHERE id=?", [id]);
    loadWeights();
    // Show toast notif
    toast.success("Weight Deleted Successfully!", {
      position: "bottom",
    });
  } catch (err) {
    console.log("Error deleting data", err);
  }
};

// Fetch weights
const loadWeights = async () => {
  try {
    const db = getDB();
    const get_weights = await db.query(
      "SELECT * FROM weights ORDER BY date DESC",
    );
    if (get_weights.values.length > 0) {
      list_weights.value = get_weights.values;
    }
  } catch (err) {
    console.log("Error loading weights", err);
  }
};

// handle clear form
const handleClearForm = () => {
  form_data.value.id = "";
  form_data.value.weight = "";
  form_data.value.date = "";
};

onMounted(async () => {
  await loadWeights();
});
</script>
<template>
  <main class="content-container bg-white/60 shadow-sm p-2 h-screen mb-40 m-2">
    <!-- HEADER TITLE -->
    <h1 class="text-[#464543] text-lg text-center font-bold">
      WEIGHT PROGRESS
    </h1>
    <form @submit.prevent="handleWeightUpdate" class="p-2">
      <input type="hidden" v-model="form_data.id" />
      <div class="flex flex-col">
        <div class="relative">
          <input
            type="number"
            step=".01"
            v-model="form_data.weight"
            class="block rounded-t-base px-2.5 pb-2.5 pt-5 w-full text-sm text-heading bg-neutral-secondary-medium border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            placeholder=" "
            required
          />
          <label
            for="floating_filled"
            class="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-left inset-s-2.5 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >Enter Weight (kg)</label
          >
        </div>
        <div class="relative">
          <input
            type="date"
            v-model="form_data.date"
            class="block rounded-t-base px-2.5 pb-2.5 pt-5 w-full text-sm text-heading bg-neutral-secondary-medium border-0 border-b-2 border-default-medium appearance-none focus:outline-none focus:ring-0 focus:border-brand peer"
            placeholder=" "
            required
          />
          <label
            for="floating_filled"
            class="absolute text-sm text-body duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-left inset-s-2.5 peer-focus:text-fg-brand peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
            >Date</label
          >
        </div>
        <div class="flex flex-row gap-4">
          <div class="basis-1/2">
            <button
              type="submit"
              class="p-2 bg-[#d76821] text-white w-full mt-3 rounded-sm"
            >
              Save
            </button>
          </div>
          <div class="basis-1/2">
            <button
              @click.prevent="handleClearForm"
              type="button"
              class="p-2 bg-[#e2e3e2] text-white w-full mt-3 rounded-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </form>
    <div
      class="relative overflow-x-auto bg-neutral-primary shadow-xs rounded-base border border-default"
    >
      <table class="w-full text-sm text-left rtl:text-right text-body">
        <thead class="text-sm text-body border-b border-default bg-[#c7c7c6]">
          <tr>
            <th scope="col" class="px-6 py-3 font-medium">Weight (kg)</th>
            <th scope="col" class="px-6 py-3 font-medium">Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr
            class="border-b border-default"
            v-for="(data, index) in list_weights"
            :key="index"
          >
            <th
              scope="row"
              class="px-6 py-4 font-medium text-heading whitespace-nowrap bg-neutral-secondary-soft"
            >
              {{ data.weight }}
            </th>
            <td class="px-6 py-4">{{ formatDate(data.date) }}</td>
            <td>
              <!-- Edit -->
              <button
                type="button"
                class="p-1 bg-green-700 rounded-md mr-2"
                @click.prevent="handleUpdate(data.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  class="size-4"
                >
                  <path
                    d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"
                  />
                  <path
                    d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z"
                  />
                </svg>
              </button>
              <!-- Delete -->
              <button
                type="button"
                class="p-1 bg-red-700 rounded-md"
                @click.prevent="handleDelete(data.id)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  class="size-4"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
