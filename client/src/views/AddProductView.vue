<template>
  <AppLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Add Product</h2>
          <p class="mt-1 text-sm text-slate-600">Create a new product in your catalog</p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            @click="goBack"
            :disabled="isSubmitting"
          >
            Back
          </button>
        </div>
      </div>

      <!-- Success banner -->
      <div
        v-if="successMessage"
        class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        role="status"
      >
        {{ successMessage }}
      </div>

      <!-- Form card -->
      <div class="rounded-xl border border-slate-200 bg-white">
        <form class="p-5" @submit.prevent="onSubmit">
          <div v-if="apiError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {{ apiError }}
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div class="md:col-span-6">
              <label class="block text-xs font-semibold text-slate-700">Name <span class="text-red-600">*</span></label>
              <input
                v-model.trim="form.name"
                type="text"
                class="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
                :class="inputClass(errors.name)"
                placeholder="e.g. Wireless Mouse"
                :disabled="isSubmitting"
                autocomplete="off"
              />
              <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
            </div>

            <div class="md:col-span-6">
              <label class="block text-xs font-semibold text-slate-700">SKU <span class="text-red-600">*</span></label>
              <input
                v-model.trim="form.sku"
                type="text"
                class="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
                :class="inputClass(errors.sku)"
                placeholder="e.g. WM-100"
                :disabled="isSubmitting"
                autocomplete="off"
              />
              <p v-if="errors.sku" class="mt-1 text-xs text-red-600">{{ errors.sku }}</p>
            </div>

            <div class="md:col-span-6">
              <label class="block text-xs font-semibold text-slate-700">Category <span class="text-red-600">*</span></label>
              <input
                v-model.trim="form.category"
                type="text"
                class="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
                :class="inputClass(errors.category)"
                placeholder="e.g. Accessories"
                :disabled="isSubmitting"
                autocomplete="off"
              />
              <p v-if="errors.category" class="mt-1 text-xs text-red-600">{{ errors.category }}</p>
            </div>

            <div class="md:col-span-6">
              <label class="block text-xs font-semibold text-slate-700">Status</label>
              <select
                v-model="form.status"
                class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                :disabled="isSubmitting"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <p v-if="errors.status" class="mt-1 text-xs text-red-600">{{ errors.status }}</p>
            </div>

            <div class="md:col-span-6">
              <label class="block text-xs font-semibold text-slate-700">Price <span class="text-red-600">*</span></label>
              <input
                v-model="form.price"
                type="number"
                min="0"
                step="0.01"
                class="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
                :class="inputClass(errors.price)"
                placeholder="0.00"
                :disabled="isSubmitting"
              />
              <p v-if="errors.price" class="mt-1 text-xs text-red-600">{{ errors.price }}</p>
              <p class="mt-1 text-xs text-slate-600">Preview: <span class="font-semibold text-slate-900">{{ pricePreview }}</span></p>
            </div>

            <div class="md:col-span-6">
              <label class="block text-xs font-semibold text-slate-700">Stock <span class="text-red-600">*</span></label>
              <input
                v-model="form.stock"
                type="number"
                min="0"
                step="1"
                class="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
                :class="inputClass(errors.stock)"
                placeholder="0"
                :disabled="isSubmitting"
              />
              <p v-if="errors.stock" class="mt-1 text-xs text-red-600">{{ errors.stock }}</p>
            </div>

            <div class="md:col-span-12">
              <label class="block text-xs font-semibold text-slate-700">Description</label>
              <textarea
                v-model="form.description"
                rows="4"
                class="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2"
                :class="inputClass(errors.description)"
                placeholder="Optional product description (max 500 characters)"
                :disabled="isSubmitting"
              />
              <p v-if="errors.description" class="mt-1 text-xs text-red-600">{{ errors.description }}</p>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
              @click="goBack"
              :disabled="isSubmitting"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "../layouts/AppLayout.vue";
import api from "../services/api";

const router = useRouter();

// State
const isSubmitting = ref(false);
const apiError = ref("");
const successMessage = ref("");

const form = reactive({
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "0",
  stock: "0",
  status: "active",
});

const errors = reactive({
  name: "",
  sku: "",
  category: "",
  description: "",
  price: "",
  stock: "",
  status: "",
});

// Computed
const pricePreview = computed(() => {
  const n = Number(form.price);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(safe);
});

// Methods
function inputClass(hasError) {
  return hasError
    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
    : "border-slate-300 focus:border-slate-400 focus:ring-slate-200";
}

function clearErrors() {
  for (const k of Object.keys(errors)) errors[k] = "";
}

function validate() {
  clearErrors();

  if (!form.name || form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";

  if (!form.sku || form.sku.trim().length < 3) errors.sku = "SKU must be at least 3 characters";

  if (!form.category || form.category.trim().length === 0) errors.category = "Category is required";

  const priceNum = Number(form.price);
  if (!Number.isFinite(priceNum)) errors.price = "Price is required";
  else if (priceNum < 0) errors.price = "Price must be 0 or greater";

  const stockNum = Number(form.stock);
  if (!Number.isFinite(stockNum)) errors.stock = "Stock is required";
  else if (!Number.isInteger(stockNum)) errors.stock = "Stock must be an integer";
  else if (stockNum < 0) errors.stock = "Stock must be 0 or greater";

  if (form.status !== "active" && form.status !== "inactive") errors.status = "Status must be active or inactive";

  if (form.description && form.description.length > 500) errors.description = "Description must be 500 characters or less";

  return Object.values(errors).every((v) => !v);
}

function goBack() {
  router.push("/products");
}

async function onSubmit() {
  apiError.value = "";
  successMessage.value = "";

  if (!validate()) return;

  isSubmitting.value = true;

  try {
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim(),
      description: form.description ? form.description.trim() : "",
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
    };

    await api.post("/api/products", payload);

    successMessage.value = "Product created successfully.";

    setTimeout(() => {
      router.replace("/products");
    }, 500);
  } catch (err) {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || err?.message || "Failed to create product";

    if (status === 409) {
      errors.sku = "SKU already exists";
      apiError.value = message;
    } else if (status === 400 && err?.response?.data?.details) {
      const details = err.response.data.details;
      for (const [k, v] of Object.entries(details)) {
        if (k in errors) errors[k] = String(v);
      }
      apiError.value = message;
    } else {
      apiError.value = message;
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>
