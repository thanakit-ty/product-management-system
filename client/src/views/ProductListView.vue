<template>
    <AppLayout>
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Products</h2>
                    <p class="mt-1 text-sm text-slate-600">Manage your product catalog</p>
                </div>

                <div class="flex items-center gap-3">
                    <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
                        @click="goToCreate"
                    >
                        + Add Product
                    </button>
                </div>
            </div>

            <!-- Filter Bar -->
            <div class="rounded-xl border border-slate-200 bg-white p-4">
                <div class="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
                    <div class="md:col-span-5">
                        <label class="block text-xs font-semibold text-slate-700">Search</label>
                        <input
                            v-model.trim="filters.search"
                            type="text"
                            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                            placeholder="Search by name or SKU"
                            autocomplete="off"
                        />
                    </div>

                    <div class="md:col-span-3">
                        <label class="block text-xs font-semibold text-slate-700">Client</label>
                        <select
                            v-model="filters.category"
                            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <option value="">All clients</option>
                            <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
                        </select>
                    </div>

                    <div class="md:col-span-2">
                        <label class="block text-xs font-semibold text-slate-700">Status</label>
                        <select
                            v-model="filters.status"
                            class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                        >
                            <option value="">All</option>
                            <option value="received">Received</option>
                            <option value="in_progress">In progress</option>
                            <option value="problem">Problem</option>
                            <option value="done">Done</option>
                        </select>
                    </div>

                    <div class="md:col-span-2">
                        <div class="flex gap-2 md:justify-end">
                            <button
                                type="button"
                                class="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
                                @click="resetFilters"
                                :disabled="isLoading"
                            >
                                Reset
                            </button>
                            <button
                                type="button"
                                class="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60"
                                @click="applyFilters"
                                :disabled="isLoading"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="loadError" class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {{ loadError }}
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200">
                        <thead class="bg-slate-50">
                            <tr>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    <button type="button" class="inline-flex items-center gap-1 hover:text-slate-900" @click="toggleSort('name')">
                                        Name
                                        <SortIndicator :active="sort.key === 'name'" :dir="sort.dir" />
                                    </button>
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">SKU</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Client</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    <button type="button" class="inline-flex items-center gap-1 hover:text-slate-900" @click="toggleSort('price')">
                                        Price
                                        <SortIndicator :active="sort.key === 'price'" :dir="sort.dir" />
                                    </button>
                                </th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                                    <button type="button" class="inline-flex items-center gap-1 hover:text-slate-900" @click="toggleSort('updatedAt')">
                                        Updated At
                                        <SortIndicator :active="sort.key === 'updatedAt'" :dir="sort.dir" />
                                    </button>
                                </th>
                                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-slate-100">
                            <tr v-if="isLoading">
                                <td class="px-4 py-10" colspan="8">
                                    <div class="flex items-center justify-center gap-3 text-sm text-slate-600">
                                        <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                                        Loading products…
                                    </div>
                                </td>
                            </tr>

                            <tr v-else-if="products.length === 0">
                                <td class="px-4 py-12" colspan="8">
                                    <div class="mx-auto max-w-lg text-center">
                                        <div class="text-sm font-semibold text-slate-900">
                                            {{ emptyTitle }}
                                        </div>
                                        <div class="mt-1 text-sm text-slate-600">
                                            {{ emptyDescription }}
                                        </div>
                                        <div v-if="isEmptyState" class="mt-4">
                                            <button
                                                type="button"
                                                class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                @click="goToCreate"
                                            >
                                                + Add Product
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>

                            <tr v-else v-for="p in products" :key="p._id">
                                <td class="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-900">
                                    {{ p.name }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                                    {{ p.sku }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                                    {{ p.category }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                                    {{ formatCurrency(p.price) }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-sm">
                                    <span
                                        class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold"
                                        :class="statusUi(p.status).class"
                                    >
                                        {{ statusUi(p.status).label }}
                                    </span>
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                                    {{ formatDate(p.updatedAt) }}
                                </td>
                                <td class="whitespace-nowrap px-4 py-3 text-right text-sm">
                                    <div class="inline-flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                            @click="openEditModal(p)"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            class="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100"
                                            @click="openDeleteModal(p)"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="text-sm text-slate-600">
                        <span class="font-semibold text-slate-900">{{ total }}</span>
                        <span> total</span>
                        <span class="mx-2 text-slate-300">|</span>
                        <span>Page</span>
                        <span class="mx-1 font-semibold text-slate-900">{{ pagination.page }}</span>
                        <span>of</span>
                        <span class="mx-1 font-semibold text-slate-900">{{ totalPages }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <button
                            type="button"
                            class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                            @click="goToPage(pagination.page - 1)"
                            :disabled="isLoading || pagination.page <= 1"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                            @click="goToPage(pagination.page + 1)"
                            :disabled="isLoading || pagination.page >= totalPages"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="deleteModal.open" class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeDeleteModal" />

            <div class="absolute inset-0 flex items-center justify-center p-4">
                <div class="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div class="px-6 py-5">
                        <h3 class="text-base font-semibold text-slate-900">Confirm deletion</h3>
                        <p class="mt-1 text-sm text-slate-600">
                            Delete
                            <span class="font-semibold text-slate-900">{{ deleteModal.product?.name }}</span>
                            ? This action cannot be undone.
                        </p>
                    </div>

                    <div v-if="deleteModal.error" class="px-6 pb-4">
                        <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                            {{ deleteModal.error }}
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                            @click="closeDeleteModal"
                            :disabled="deleteModal.isDeleting"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            class="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:opacity-50"
                            @click="confirmDelete"
                            :disabled="deleteModal.isDeleting"
                        >
                            <span v-if="deleteModal.isDeleting" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Product Modal -->
        <div v-if="editModal.open" class="fixed inset-0 z-50">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="closeEditModal" />

            <div class="absolute inset-0 flex items-center justify-center p-4">
                <div class="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div class="flex items-start justify-between gap-4 px-6 py-5">
                        <div>
                            <h3 class="text-base font-semibold text-slate-900">Edit product</h3>
                            <p class="mt-1 text-sm text-slate-600">Update the product details and save your changes.</p>
                        </div>
                        <button
                            type="button"
                            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                            @click="closeEditModal"
                            :disabled="editModal.isSaving"
                            aria-label="Close"
                            title="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                                <path
                                    fill-rule="evenodd"
                                    d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>

                    <div class="max-h-[70vh] overflow-y-auto px-6 pb-6">
                        <div v-if="editModal.isLoading" class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 align-[-2px]" />
                            Loading product…
                        </div>

                        <form class="mt-4 space-y-4" @submit.prevent="confirmEditSave">
                            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label class="block text-xs font-semibold text-slate-700">Name</label>
                                    <input
                                        v-model.trim="editForm.name"
                                        type="text"
                                        class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        placeholder="Product name"
                                        autocomplete="off"
                                        :disabled="editModal.isSaving"
                                    />
                                </div>

                                <div>
                                    <label class="block text-xs font-semibold text-slate-700">SKU</label>
                                    <input
                                        v-model.trim="editForm.sku"
                                        type="text"
                                        class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        placeholder="SKU"
                                        autocomplete="off"
                                        :disabled="editModal.isSaving"
                                    />
                                </div>

                                <div>
                                    <label class="block text-xs font-semibold text-slate-700">Client</label>
                                    <input
                                        v-model.trim="editForm.category"
                                        type="text"
                                        class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        placeholder="Client name"
                                        autocomplete="off"
                                        :disabled="editModal.isSaving"
                                    />
                                </div>

                                <div>
                                    <label class="block text-xs font-semibold text-slate-700">Price (THB)</label>
                                    <input
                                        v-model="editForm.price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        placeholder="0"
                                        :disabled="editModal.isSaving"
                                    />
                                </div>

                                <div>
                                    <label class="block text-xs font-semibold text-slate-700">Status</label>
                                    <select
                                        v-model="editForm.status"
                                        class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        :disabled="editModal.isSaving"
                                    >
                                        <option value="received">Received</option>
                                        <option value="in_progress">In progress</option>
                                        <option value="problem">Problem</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-xs font-semibold text-slate-700">Start date</label>
                                    <input
                                        v-model="editForm.startDate"
                                        type="date"
                                        class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        :disabled="editModal.isSaving"
                                    />
                                </div>

                                <div class="md:col-span-2">
                                    <label class="block text-xs font-semibold text-slate-700">Due date</label>
                                    <input
                                        v-model="editForm.dueDate"
                                        type="date"
                                        class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        :disabled="editModal.isSaving"
                                    />
                                </div>

                                <div class="md:col-span-2">
                                    <label class="block text-xs font-semibold text-slate-700">Description</label>
                                    <textarea
                                        v-model.trim="editForm.description"
                                        rows="4"
                                        class="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                        placeholder="Optional notes"
                                        :disabled="editModal.isSaving"
                                    />
                                </div>
                            </div>

                            <div v-if="editModal.error" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                                {{ editModal.error }}
                            </div>
                        </form>
                    </div>

                    <div class="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                            @click="closeEditModal"
                            :disabled="editModal.isSaving"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            class="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
                            @click="confirmEditSave"
                            :disabled="editModal.isSaving || editModal.isLoading"
                        >
                            <span v-if="editModal.isSaving" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                            Save changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "../layouts/AppLayout.vue";
import { http } from "../api/http";

const SortIndicator = {
    props: {
        active: { type: Boolean, default: false },
        dir: { type: String, default: "asc" },
    },
    template: `
        <span class="inline-flex items-center" aria-hidden="true">
            <svg v-if="active && dir === 'asc'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-slate-700">
                <path fill-rule="evenodd" d="M10 3a1 1 0 01.832.445l4 6A1 1 0 0114 11H6a1 1 0 01-.832-1.555l4-6A1 1 0 0110 3z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="active && dir === 'desc'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-slate-700">
                <path fill-rule="evenodd" d="M10 17a1 1 0 01-.832-.445l-4-6A1 1 0 016 9h8a1 1 0 01.832 1.555l-4 6A1 1 0 0110 17z" clip-rule="evenodd" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4 text-slate-400">
                <path d="M10 3a1 1 0 01.832.445l3 4.5A1 1 0 0113 9H7a1 1 0 01-.832-1.555l3-4.5A1 1 0 0110 3z" />
                <path d="M10 17a1 1 0 01-.832-.445l-3-4.5A1 1 0 017 11h6a1 1 0 01.832 1.555l-3 4.5A1 1 0 0110 17z" />
            </svg>
        </span>
    `,
};

const router = useRouter();

// State
const products = ref([]);
const total = ref(0);
const isLoading = ref(false);
const loadError = ref("");
const categoryOptions = ref([]);

const filters = reactive({
    search: "",
    category: "",
    status: "",
});

const sort = reactive({
    key: "updatedAt",
    dir: "desc",
});

const pagination = reactive({
    page: 1,
    limit: 10,
});

const deleteModal = reactive({
    open: false,
    product: null,
    isDeleting: false,
    error: "",
});

const editModal = reactive({
    open: false,
    productId: "",
    isLoading: false,
    isSaving: false,
    error: "",
});

const editForm = reactive({
    name: "",
    sku: "",
    category: "",
    price: "",
    status: "received",
    startDate: "",
    dueDate: "",
    description: "",
});

const searchDebounceMs = 500;
const searchTimer = ref(null);

// Computed
const sortParam = computed(() => {
    const key = sort.key;
    if (!key) return "";
    return sort.dir === "desc" ? `-${key}` : key;
});

const totalPages = computed(() => {
    const pages = Math.ceil((Number(total.value) || 0) / pagination.limit);
    return Math.max(1, pages || 1);
});

const hasAnyFilters = computed(() => {
    return Boolean(filters.search || filters.category || filters.status);
});

const isEmptyState = computed(() => {
    return !hasAnyFilters.value && total.value === 0;
});

const emptyTitle = computed(() => {
    return isEmptyState.value ? "No products yet" : "No results found";
});

const emptyDescription = computed(() => {
    return isEmptyState.value
        ? "Create your first product to start building your catalog."
        : "Try adjusting your filters or search terms.";
});

// Methods
function formatCurrency(value) {
    const safe = Number.isFinite(Number(value)) ? Number(value) : 0;
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "THB",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(safe);
}

function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    return `${dd}/${mm}/${yyyy}`;
}

function toInputDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = String(d.getFullYear());
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function statusUi(status) {
    const normalized = status === "active" ? "in_progress" : status === "inactive" ? "done" : status;

    switch (normalized) {
        case "received":
            return {
                label: "Received",
                class: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
            };
        case "in_progress":
            return {
                label: "In progress",
                class: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
            };
        case "problem":
            return {
                label: "Problem",
                class: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
            };
        case "done":
            return {
                label: "Done",
                class: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
            };
        default:
            return {
                label: "Received",
                class: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
            };
    }
}

function normalizeProductsResponse(data) {
    const items =
        Array.isArray(data)
            ? data
            : Array.isArray(data?.items)
                ? data.items
                : Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data?.products)
                        ? data.products
                        : [];

    const totalCount =
        typeof data?.total === "number"
            ? data.total
            : typeof data?.count === "number"
                ? data.count
                : typeof data?.meta?.total === "number"
                    ? data.meta.total
                    : Array.isArray(items)
                        ? items.length
                        : 0;

    const categories = Array.isArray(data?.categories)
        ? data.categories
        : Array.isArray(data?.meta?.categories)
            ? data.meta.categories
            : null;

    return { items, totalCount, categories };
}

async function fetchProducts() {
    isLoading.value = true;
    loadError.value = "";

    try {
        const res = await http.get("/products", {
            params: {
                search: filters.search || "",
                category: filters.category || "",
                status: filters.status || "",
                sort: sortParam.value || "",
                page: pagination.page,
                limit: pagination.limit,
            },
        });

        const { items, totalCount, categories } = normalizeProductsResponse(res.data);

        products.value = Array.isArray(items) ? items : [];
        total.value = Number.isFinite(Number(totalCount)) ? Number(totalCount) : 0;

        if (Array.isArray(categories)) {
            categoryOptions.value = categories.filter((c) => typeof c === "string" && c.trim() !== "");
        } else {
            const set = new Set(
                products.value
                    .map((p) => p?.category)
                    .filter((c) => typeof c === "string" && c.trim() !== "")
            );
            if (filters.category) set.add(filters.category);
            categoryOptions.value = Array.from(set).sort((a, b) => a.localeCompare(b));
        }

        if (pagination.page > totalPages.value) {
            pagination.page = totalPages.value;
        }
    } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Failed to load products";
        loadError.value = message;
        products.value = [];
        total.value = 0;
    } finally {
        isLoading.value = false;
    }
}

function toggleSort(key) {
    const sortableKeys = new Set(["name", "price", "stock", "updatedAt"]);
    if (!sortableKeys.has(key)) return;

    if (sort.key === key) {
        sort.dir = sort.dir === "asc" ? "desc" : "asc";
    } else {
        sort.key = key;
        sort.dir = "asc";
    }

    pagination.page = 1;
    fetchProducts();
}

function goToPage(page) {
    const next = Math.min(Math.max(1, page), totalPages.value);
    if (next === pagination.page) return;
    pagination.page = next;
    fetchProducts();
}

function applyFilters() {
    pagination.page = 1;
    fetchProducts();
}

function resetFilters() {
    filters.search = "";
    filters.category = "";
    filters.status = "";
    sort.key = "updatedAt";
    sort.dir = "desc";
    pagination.page = 1;
    fetchProducts();
}

function goToCreate() {
    router.push("/products/new");
}

function goToEdit(id) {
    router.push(`/products/${id}`);
}

function fillEditForm(product) {
    editForm.name = typeof product?.name === "string" ? product.name : "";
    editForm.sku = typeof product?.sku === "string" ? product.sku : "";
    editForm.category = typeof product?.category === "string" ? product.category : "";
    editForm.price = product?.price ?? "";
    editForm.status =
        product?.status === "received" ||
        product?.status === "in_progress" ||
        product?.status === "problem" ||
        product?.status === "done"
            ? product.status
            : "received";
    editForm.startDate = toInputDate(product?.startDate);
    editForm.dueDate = toInputDate(product?.dueDate);
    editForm.description = typeof product?.description === "string" ? product.description : "";
}

async function openEditModal(product) {
    if (!product?._id) return;

    editModal.open = true;
    editModal.productId = product._id;
    editModal.isLoading = true;
    editModal.isSaving = false;
    editModal.error = "";

    fillEditForm(product);

    try {
        const res = await http.get(`/products/${product._id}`);
        fillEditForm(res.data);
    } catch (err) {
        editModal.error = err?.response?.data?.message || err?.message || "Failed to load product";
    } finally {
        editModal.isLoading = false;
    }
}

function closeEditModal() {
    if (editModal.isSaving) return;
    editModal.open = false;
    editModal.productId = "";
    editModal.isLoading = false;
    editModal.error = "";
}

function validateEditForm() {
    const name = typeof editForm.name === "string" ? editForm.name.trim() : "";
    const sku = typeof editForm.sku === "string" ? editForm.sku.trim() : "";
    const category = typeof editForm.category === "string" ? editForm.category.trim() : "";
    const priceNum = Number(editForm.price);

    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (!sku) return "SKU is required";
    if (sku.length < 3) return "SKU must be at least 3 characters";
    if (!category) return "Client is required";
    if (!Number.isFinite(priceNum)) return "Price is required";
    if (priceNum < 0) return "Price must be 0 or greater";
    return "";
}

async function confirmEditSave() {
    if (!editModal.productId) return;
    const validationError = validateEditForm();
    if (validationError) {
        editModal.error = validationError;
        return;
    }

    editModal.isSaving = true;
    editModal.error = "";

    try {
        await http.put(`/products/${editModal.productId}`, {
            name: editForm.name,
            sku: editForm.sku,
            category: editForm.category,
            price: editForm.price,
            status: editForm.status,
            startDate: editForm.startDate || null,
            dueDate: editForm.dueDate || null,
            description: editForm.description,
        });

        editModal.open = false;
        editModal.productId = "";

        await fetchProducts();
    } catch (err) {
        const message = err?.response?.data?.message || err?.message || "Failed to update product";
        editModal.error = message;
    } finally {
        editModal.isSaving = false;
    }
}

function openDeleteModal(product) {
    deleteModal.open = true;
    deleteModal.product = product;
    deleteModal.isDeleting = false;
    deleteModal.error = "";
}

function closeDeleteModal() {
    if (deleteModal.isDeleting) return;
    deleteModal.open = false;
    deleteModal.product = null;
    deleteModal.error = "";
}

async function confirmDelete() {
    const product = deleteModal.product;
    if (!product?._id) return;

    deleteModal.isDeleting = true;
    deleteModal.error = "";

    try {
        await http.delete(`/products/${product._id}`);

        const wouldEmptyPage = products.value.length === 1 && pagination.page > 1;
        if (wouldEmptyPage) pagination.page -= 1;

        // Close modal immediately after a successful delete.
        deleteModal.open = false;
        deleteModal.product = null;
        deleteModal.error = "";

        await fetchProducts();
    } catch (err) {
        deleteModal.error = err?.response?.data?.message || err?.message || "Failed to delete product";
    } finally {
        deleteModal.isDeleting = false;
    }
}

// Lifecycle
onMounted(() => {
    fetchProducts();
});

watch(
    () => filters.search,
    () => {
        if (searchTimer.value) clearTimeout(searchTimer.value);
        searchTimer.value = setTimeout(() => {
            pagination.page = 1;
            fetchProducts();
        }, searchDebounceMs);
    }
);
</script>
