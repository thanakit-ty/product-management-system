<template>
    <AppLayout>
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Logistics Dashboard</h2>
                    <p class="mt-1 text-sm text-slate-600">Status overview and all jobs in the system</p>
                </div>

                <div class="flex items-center gap-2">
                    <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
                        @click="fetchAll"
                        :disabled="isLoading"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <!-- Error banner -->
            <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert" aria-live="polite">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div class="text-sm font-semibold text-red-800">{{ errorMessage }}</div>
                    <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
                        @click="fetchAll"
                    >
                        Retry
                    </button>
                </div>
            </div>

            <!-- KPI cards -->
            <section aria-label="Status summary">
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-xs font-semibold uppercase tracking-wide text-slate-600">Total Products</div>
                        <div class="mt-2 text-3xl font-semibold text-slate-900">{{ totals.total }}</div>
                        <div class="mt-1 text-xs text-slate-500">{{ fetchTimeText }}</div>
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-xs font-semibold uppercase tracking-wide text-slate-600">Received (รับแล้ว)</div>
                        <div class="mt-2 text-3xl font-semibold text-slate-900">{{ totals.received }}</div>
                        <div class="mt-1 text-xs text-slate-500">{{ fetchTimeText }}</div>
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-xs font-semibold uppercase tracking-wide text-slate-600">In progress (กำลังทำ)</div>
                        <div class="mt-2 text-3xl font-semibold text-slate-900">{{ totals.inProgress }}</div>
                        <div class="mt-1 text-xs text-slate-500">{{ fetchTimeText }}</div>
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-xs font-semibold uppercase tracking-wide text-slate-600">Problem (มีปัญหา)</div>
                        <div class="mt-2 text-3xl font-semibold text-slate-900">{{ totals.problem }}</div>
                        <div class="mt-1 text-xs text-slate-500">{{ fetchTimeText }}</div>
                    </div>

                    <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div class="text-xs font-semibold uppercase tracking-wide text-slate-600">Done (เสร็จ)</div>
                        <div class="mt-2 text-3xl font-semibold text-slate-900">{{ totals.done }}</div>
                        <div class="mt-1 text-xs text-slate-500">{{ fetchTimeText }}</div>
                    </div>
                </div>
            </section>

            <!-- Table -->
            <section aria-label="All logistics jobs">
                <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                        <div>
                            <h3 class="text-sm font-semibold text-slate-900">All Jobs</h3>
                            <p class="mt-1 text-xs text-slate-600">All products with status and timestamps</p>
                        </div>
                        <div class="text-xs text-slate-500">{{ products.length }} rows</div>
                    </div>

                    <div v-if="isLoading" class="p-5">
                        <div class="animate-pulse space-y-3">
                            <div class="h-10 rounded bg-slate-100" />
                            <div class="h-10 rounded bg-slate-100" />
                            <div class="h-10 rounded bg-slate-100" />
                            <div class="h-10 rounded bg-slate-100" />
                        </div>
                    </div>

                    <div v-else-if="products.length === 0" class="p-5">
                        <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                            <div class="text-sm font-semibold text-slate-900">No jobs yet</div>
                            <div class="mt-1 text-sm text-slate-600">Create products to see logistics jobs here.</div>
                        </div>
                    </div>

                    <div v-else class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-slate-200" aria-label="All jobs table">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Name</th>
                                    <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">SKU</th>
                                    <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Category</th>
                                    <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
                                    <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Created</th>
                                    <th scope="col" class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Updated</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 bg-white">
                                <tr v-for="p in products" :key="p._id" class="hover:bg-slate-50">
                                    <td class="whitespace-nowrap px-5 py-3 text-sm font-semibold text-slate-900">{{ p.name }}</td>
                                    <td class="whitespace-nowrap px-5 py-3 text-sm text-slate-700">{{ p.sku }}</td>
                                    <td class="whitespace-nowrap px-5 py-3 text-sm text-slate-700">{{ p.category }}</td>
                                    <td class="whitespace-nowrap px-5 py-3 text-sm">
                                        <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold" :class="statusUi(p.status).class">
                                            {{ statusUi(p.status).label }}
                                        </span>
                                    </td>
                                    <td class="whitespace-nowrap px-5 py-3 text-sm text-slate-700">{{ formatDateTime(p.createdAt) }}</td>
                                    <td class="whitespace-nowrap px-5 py-3 text-sm text-slate-700">{{ formatDateTime(p.updatedAt) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import AppLayout from "../layouts/AppLayout.vue";
import { http } from "../api/http";

const products = ref([]);
const isLoading = ref(false);
const errorMessage = ref("");
const fetchedAt = ref(null);

const totals = computed(() => {
    const acc = {
        total: products.value.length,
        received: 0,
        inProgress: 0,
        problem: 0,
        done: 0,
    };

    for (const p of products.value) {
        const s = normalizeStatus(p?.status);
        if (s === "received") acc.received += 1;
        else if (s === "in_progress") acc.inProgress += 1;
        else if (s === "problem") acc.problem += 1;
        else if (s === "done") acc.done += 1;
    }

    return acc;
});

const fetchTimeText = computed(() => {
    if (!fetchedAt.value) return "Not fetched yet";
    return `Updated ${formatDateTime(fetchedAt.value)}`;
});

function normalizeStatus(status) {
    if (status === "active") return "in_progress";
    if (status === "inactive") return "done";
    if (status === "received" || status === "in_progress" || status === "problem" || status === "done") return status;
    return "received";
}

function statusUi(status) {
    const normalized = normalizeStatus(status);

    switch (normalized) {
        case "received":
            return {
                label: "Received (รับแล้ว)",
                class: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
            };
        case "in_progress":
            return {
                label: "In progress (กำลังทำ)",
                class: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
            };
        case "problem":
            return {
                label: "Problem (มีปัญหา)",
                class: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
            };
        case "done":
            return {
                label: "Done (เสร็จ)",
                class: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
            };
        default:
            return {
                label: "Received (รับแล้ว)",
                class: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
            };
    }
}

function formatDateTime(value) {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = String(d.getFullYear());
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

async function fetchAll() {
    isLoading.value = true;
    errorMessage.value = "";

    try {
        const limit = 100;
        const maxPages = 100;

        const all = [];
        let page = 1;
        let total = Infinity;

        while (page <= maxPages && all.length < total) {
            const { data } = await http.get("/products", {
                params: {
                    page,
                    limit,
                    sort: "-updatedAt",
                },
            });

            const items = Array.isArray(data?.items) ? data.items : [];
            const t = typeof data?.total === "number" ? data.total : items.length;
            total = Number.isFinite(t) ? t : items.length;

            all.push(...items);

            if (items.length < limit) break;
            page += 1;
        }

        products.value = all;
        fetchedAt.value = new Date();
    } catch (err) {
        errorMessage.value = err?.response?.data?.message || err?.message || "Failed to load jobs";
    } finally {
        isLoading.value = false;
    }
}

onMounted(fetchAll);
</script>
