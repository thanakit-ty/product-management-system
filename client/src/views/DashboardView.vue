<template>
  <AppLayout>
    <div class="min-h-full bg-slate-50">
      <div class="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 class="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h2>
            <p class="mt-1 text-sm text-slate-600">Overview of your catalog</p>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button type="button"
              class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              @click="goToAdd" aria-label="Add Product">
              Add Product
            </button>
            <button type="button"
              class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
              @click="goToProducts" aria-label="View Products">
              View Products
            </button>
          </div>
        </div>

        <!-- Error banner -->
        <div v-if="errorMessage" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3" role="alert"
          aria-live="polite">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-sm font-semibold text-red-800">{{ errorMessage }}</div>
            <button type="button"
              class="inline-flex items-center justify-center rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"
              @click="fetchSummary">
              Retry
            </button>
          </div>
        </div>

        <!-- KPI Cards -->
        <section aria-label="Key performance indicators">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <template v-if="isLoading">
              <div v-for="i in 4" :key="i" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div class="animate-pulse space-y-3">
                  <div class="flex items-center justify-between">
                    <div class="h-4 w-24 rounded bg-slate-200" />
                    <div class="h-8 w-8 rounded-lg bg-slate-200" />
                  </div>
                  <div class="h-8 w-20 rounded bg-slate-200" />
                  <div class="h-3 w-36 rounded bg-slate-200" />
                </div>
              </div>
            </template>

            <template v-else>
              <KpiCard label="Total Products" :value="totals.products" :subtext="fetchTimeText" icon="box" />
              <KpiCard label="Categories" :value="totals.categories" :subtext="fetchTimeText" icon="tag" />
              <KpiCard label="Active Products" :value="totals.activeProducts" :subtext="fetchTimeText" icon="check" />
              <KpiCard label="Low Stock" :value="totals.lowStock" :subtext="fetchTimeText" icon="alert"
                :tone="totals.lowStock > 0 ? 'warning' : 'neutral'" />
            </template>
          </div>
        </section>

        <!-- Main Content Grid -->
        <section aria-label="Dashboard content">
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <!-- Left column -->
            <div class="space-y-6 lg:col-span-8">
              <!-- Monthly Added -->
              <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="text-sm font-semibold text-slate-900">Monthly Added</h3>
                    <p class="mt-1 text-xs text-slate-600">Last 6 months</p>
                  </div>
                </div>

                <div v-if="isLoading" class="mt-4 animate-pulse">
                  <div class="h-48 rounded-lg bg-slate-100" />
                </div>

                <div v-else class="mt-4">
                  <div v-if="monthlyBars.length === 0"
                    class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <div class="text-sm font-semibold text-slate-900">No data yet</div>
                    <div class="mt-1 text-sm text-slate-600">Monthly added products will appear here once available.
                    </div>
                  </div>

                  <div v-else class="rounded-lg border border-slate-200 bg-white p-4">
                    <div class="flex h-48 items-end gap-3" aria-label="Monthly added bar chart">
                      <div v-for="b in monthlyBars" :key="b.month"
                        class="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <div class="w-full rounded-md bg-slate-100" :title="`${b.label}: ${b.count}`"
                          aria-hidden="true">
                          <div class="w-full rounded-md bg-indigo-600"
                            :style="{ height: b.height + '%', minHeight: '6px' }" />
                        </div>
                        <div class="w-full truncate text-center text-xs font-semibold text-slate-700" :title="b.label">
                          {{ b.shortLabel }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Products -->
              <div class="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h3 class="text-sm font-semibold text-slate-900">Recent Products</h3>
                    <p class="mt-1 text-xs text-slate-600">Latest updates</p>
                  </div>
                  <button type="button"
                    class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    @click="goToProducts">
                    View all
                  </button>
                </div>

                <div v-if="isLoading" class="p-5">
                  <div class="animate-pulse space-y-3">
                    <div class="h-10 rounded bg-slate-100" />
                    <div class="h-10 rounded bg-slate-100" />
                    <div class="h-10 rounded bg-slate-100" />
                    <div class="h-10 rounded bg-slate-100" />
                  </div>
                </div>

                <div v-else>
                  <div v-if="recentRows.length === 0" class="p-5">
                    <div class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                      <div class="text-sm font-semibold text-slate-900">No recent products</div>
                      <div class="mt-1 text-sm text-slate-600">New or updated products will show up here.</div>
                    </div>
                  </div>

                  <div v-else class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-slate-200" aria-label="Recent products">
                      <thead class="bg-slate-50">
                        <tr>
                          <th scope="col"
                            class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Name
                          </th>
                          <th scope="col"
                            class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            SKU
                          </th>
                          <th scope="col"
                            class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Stock
                          </th>
                          <th scope="col"
                            class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Status
                          </th>
                          <th scope="col"
                            class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Updated
                          </th>
                          <th scope="col"
                            class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100 bg-white">
                        <tr v-for="p in recentRows" :key="p._id" class="hover:bg-slate-50">
                          <td class="whitespace-nowrap px-5 py-3 text-sm font-semibold text-slate-900">
                            {{ p.name }}
                          </td>
                          <td class="whitespace-nowrap px-5 py-3 text-sm text-slate-700">
                            {{ p.sku }}
                          </td>
                          <td class="whitespace-nowrap px-5 py-3 text-sm"
                            :class="p.stock < 5 ? 'text-red-600 font-semibold' : 'text-slate-700'">
                            {{ p.stock }}
                          </td>
                          <td class="whitespace-nowrap px-5 py-3 text-sm">
                            <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold" :class="p.status === 'active'
                              ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200'
                              : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200'">
                              {{ p.status === 'active' ? 'Active' : 'Inactive' }}
                            </span>
                          </td>
                          <td class="whitespace-nowrap px-5 py-3 text-sm text-slate-700">
                            {{ formatDateTime(p.updatedAt) }}
                          </td>
                          <td class="whitespace-nowrap px-5 py-3 text-right text-sm">
                            <div class="inline-flex items-center justify-end gap-2">
                              <button type="button"
                                class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                @click="goToEdit(p._id)" :aria-label="`Edit ${p.name}`">
                                Edit
                              </button>
                              <button type="button"
                                class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                                @click="goToProducts" :aria-label="`Open products`">
                                Open
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right column -->
            <div class="space-y-6 lg:col-span-4">
              <!-- Stock by Category -->
              <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">Stock by Category</h3>
                  <p class="mt-1 text-xs text-slate-600">Top categories by stock</p>
                </div>

                <div v-if="isLoading" class="mt-4 animate-pulse space-y-3">
                  <div class="h-12 rounded bg-slate-100" />
                  <div class="h-12 rounded bg-slate-100" />
                  <div class="h-12 rounded bg-slate-100" />
                </div>

                <div v-else class="mt-4">
                  <div v-if="stockRows.length === 0"
                    class="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center">
                    <div class="text-sm font-semibold text-slate-900">No category stock data</div>
                    <div class="mt-1 text-sm text-slate-600">Category stock totals will appear here once available.
                    </div>
                  </div>

                  <div v-else class="space-y-3">
                    <div v-for="row in stockRows" :key="row.category" class="space-y-2">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 truncate text-sm font-semibold text-slate-900" :title="row.category">{{
                          row.category
                        }}</div>
                        <div class="shrink-0 text-sm font-semibold text-slate-700">{{ formatNumber(row.totalStock) }}
                        </div>
                      </div>
                      <div class="h-2 w-full rounded-full bg-slate-200" aria-hidden="true">
                        <div class="h-2 rounded-full bg-indigo-600" :style="{ width: row.percent + '%' }" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <h3 class="text-sm font-semibold text-slate-900">Quick Actions</h3>
                  <p class="mt-1 text-xs text-slate-600">Common tasks</p>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-2">
                  <button type="button"
                    class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    @click="goToAdd">
                    Add Product
                  </button>

                  <button type="button"
                    class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                    disabled title="Coming soon">
                    Import CSV
                  </button>

                  <button type="button"
                    class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
                    disabled title="Coming soon">
                    Export CSV
                  </button>

                  <button type="button"
                    class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    @click="goToReports">
                    Reports
                  </button>

                  <button type="button"
                    class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    @click="goToSettings">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import AppLayout from "../layouts/AppLayout.vue";
import api from "../services/api";

const KpiCard = {
  props: {
    label: { type: String, required: true },
    value: { type: Number, required: true },
    subtext: { type: String, default: "" },
    icon: { type: String, default: "box" },
    tone: { type: String, default: "neutral" },
  },
  computed: {
    iconMarkup() {
      if (this.icon === "tag") {
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
            <path d="M20.59 13.41 12 22l-8.59-8.59A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.41.59l7.18 7.18a2 2 0 0 1 0 2.82Z"/>
            <circle cx="7.5" cy="7.5" r="1.5"/>
          </svg>`;
      }
      if (this.icon === "check") {
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
            <path d="M20 6 9 17l-5-5"/>
          </svg>`;
      }
      if (this.icon === "alert") {
        return `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>`;
      }

      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
          <path d="M21 8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/>
          <path d="M7 6V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2"/>
          <path d="M3 10h18"/>
        </svg>`;
    },
    toneClasses() {
      if (this.tone === "warning") {
        return {
          border: "border-amber-200",
          badge: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
          iconWrap: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
        };
      }
      return {
        border: "border-slate-200",
        badge: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
        iconWrap: "bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200",
      };
    },
  },
  template: `
    <div class="rounded-xl border bg-white p-4 shadow-sm" :class="toneClasses.border">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-xs font-semibold uppercase tracking-wide text-slate-600">{{ label }}</div>
          <div class="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{{ value.toLocaleString() }}</div>
          <div class="mt-2">
            <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold" :class="toneClasses.badge">
              {{ subtext }}
            </span>
          </div>
        </div>
        <div class="grid h-10 w-10 place-items-center rounded-lg" :class="toneClasses.iconWrap" v-html="iconMarkup" />
      </div>
    </div>
  `,
};

const router = useRouter();

// State
const isLoading = ref(false);
const errorMessage = ref("");
const fetchedAt = ref(null);

const summary = ref({
  totals: {
    products: 0,
    categories: 0,
    activeProducts: 0,
    lowStock: 0,
  },
  recentProducts: [],
  stockByCategory: [],
  monthlyAdded: [],
});

// Computed
const totals = computed(() => summary.value?.totals || { products: 0, categories: 0, activeProducts: 0, lowStock: 0 });

const fetchTimeText = computed(() => {
  return fetchedAt.value ? "Updated just now" : "Not updated";
});

const recentRows = computed(() => {
  const list = Array.isArray(summary.value?.recentProducts) ? summary.value.recentProducts : [];
  return list.slice(0, 6);
});

const stockRows = computed(() => {
  const list = Array.isArray(summary.value?.stockByCategory) ? summary.value.stockByCategory : [];
  const sorted = [...list]
    .filter((x) => x && typeof x.category === "string")
    .sort((a, b) => (Number(b.totalStock) || 0) - (Number(a.totalStock) || 0))
    .slice(0, 6);

  const maxStock = Math.max(0, ...sorted.map((x) => Number(x.totalStock) || 0));
  return sorted.map((x) => {
    const totalStock = Number(x.totalStock) || 0;
    const percent = maxStock > 0 ? Math.round((totalStock / maxStock) * 100) : 0;
    return { category: x.category, totalStock, percent };
  });
});

const monthlyBars = computed(() => {
  const list = Array.isArray(summary.value?.monthlyAdded) ? summary.value.monthlyAdded : [];
  const normalized = list
    .filter((x) => x && typeof x.month === "string")
    .map((x) => ({ month: x.month, count: Number(x.count) || 0 }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const last = normalized.slice(-6);
  const maxCount = Math.max(0, ...last.map((x) => x.count));

  return last.map((x) => {
    const label = formatMonthLabel(x.month);
    const shortLabel = formatMonthShortLabel(x.month);
    const height = maxCount > 0 ? Math.round((x.count / maxCount) * 100) : 0;
    return { ...x, label, shortLabel, height: Math.max(4, height) };
  });
});

// Methods
function formatNumber(n) {
  return new Intl.NumberFormat().format(Number(n) || 0);
}

function formatCurrency(n) {
  const safe = Number.isFinite(Number(n)) ? Number(n) : 0;
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(safe);
}

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

function formatMonthLabel(month) {
  const d = new Date(`${month}-01T00:00:00`);
  if (Number.isNaN(d.getTime())) return month;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long" });
}

function formatMonthShortLabel(month) {
  const d = new Date(`${month}-01T00:00:00`);
  if (Number.isNaN(d.getTime())) return month;
  return d.toLocaleDateString(undefined, { month: "short" });
}

function goToAdd() {
  router.push("/products/new");
}

function goToProducts() {
  router.push("/products");
}

function goToEdit(id) {
  router.push(`/products/${id}`);
}

function goToReports() {
  router.push("/reports");
}

function goToSettings() {
  router.push("/settings");
}

async function fetchSummary() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const res = await api.get("/api/dashboard/summary");
    const data = res?.data || {};

    summary.value = {
      totals: {
        products: Number(data?.totals?.products) || 0,
        categories: Number(data?.totals?.categories) || 0,
        activeProducts: Number(data?.totals?.activeProducts) || 0,
        lowStock: Number(data?.totals?.lowStock) || 0,
      },
      recentProducts: Array.isArray(data?.recentProducts) ? data.recentProducts : [],
      stockByCategory: Array.isArray(data?.stockByCategory) ? data.stockByCategory : [],
      monthlyAdded: Array.isArray(data?.monthlyAdded) ? data.monthlyAdded : [],
    };

    fetchedAt.value = new Date();
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || "Failed to load dashboard summary";
    errorMessage.value = message;
  } finally {
    isLoading.value = false;
  }
}

// Lifecycle
onMounted(() => {
  fetchSummary();
});
</script>
