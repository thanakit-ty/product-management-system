<template>
    <div class="layout">
        <!-- Sidebar -->
        <aside class="sidebar" :class="{ collapsed: isCollapsed }">
            <!-- Top: Brand + Toggle -->
            <div class="sideTop" :class="{ collapsedTop: isCollapsed }">
                <div class="brand">
                    <div class="logo">PM</div>
                    <span v-if="!isCollapsed" class="brandText">ProductMS</span>
                </div>

                <button class="collapseBtn" :class="{ collapsedBtn: isCollapsed }" type="button" @click="toggleSidebar"
                    :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
                    <PanelLeftOpen v-if="isCollapsed" :size="20" />
                    <PanelLeftClose v-else :size="20" />
                </button>
            </div>

            <!-- Menu (stick to top) -->
            <nav class="nav" aria-label="Main navigation">
                <RouterLink to="/" class="nav-item" active-class="active">
                    <LayoutDashboard :size="20" class="navIcon" aria-hidden="true" />
                    <span v-if="!isCollapsed" class="navText">Dashboard</span>
                </RouterLink>

                <RouterLink to="/products" class="nav-item" active-class="active">
                    <Package :size="20" class="navIcon" aria-hidden="true" />
                    <span v-if="!isCollapsed" class="navText">Products</span>
                </RouterLink>

                <RouterLink to="/reports" class="nav-item" active-class="active">
                    <FileText :size="20" class="navIcon" aria-hidden="true" />
                    <span v-if="!isCollapsed" class="navText">Reports</span>
                </RouterLink>

                <RouterLink to="/settings" class="nav-item" active-class="active">
                    <Settings :size="20" class="navIcon" aria-hidden="true" />
                    <span v-if="!isCollapsed" class="navText">Settings</span>
                </RouterLink>
            </nav>

            <!-- Bottom: user + logout -->
            <div class="user-section">
                <div class="user-info">
                    <div class="avatar">{{ initials }}</div>

                    <div v-if="!isCollapsed" class="userMeta">
                        <div class="user-name">{{ auth.user?.name || auth.user?.email }}</div>
                        <div class="user-role">{{ auth.user?.role }}</div>
                    </div>
                </div>

                <button class="logout-btn" type="button" @click="logout">
                    <span aria-hidden="true">🚪</span>
                    <span v-if="!isCollapsed" class="logoutText">Logout</span>
                </button>
            </div>
        </aside>

        <!-- Main -->
        <div class="main">
            <header class="topbar">
                <h1 class="pageTitle">{{ pageTitle }}</h1>
            </header>

            <section class="content">
                <slot />
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter, useRoute } from "vue-router";
import {
    LayoutDashboard,
    Package,
    PanelLeftOpen,
    PanelLeftClose,
    FileText,
    Settings,
    LogOut
} from "lucide-vue-next";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const STORAGE_KEY = "pms.sidebar.collapsed";
const isCollapsed = ref(localStorage.getItem(STORAGE_KEY) === "1");

watch(isCollapsed, (v) => {
    localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
});

const initials = computed(() => {
    const name = auth.user?.name || auth.user?.email || "";
    return name.substring(0, 2).toUpperCase();
});

const pageTitle = computed(() => route.meta.title || "Product Management System");

function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value;
}

function logout() {
    auth.logout();
    router.replace("/login");
}
</script>

<style scoped>
.layout {
    display: flex;
    min-height: 100vh;
    background: #f4f6f9;
    font-family: system-ui, sans-serif;
}

/* Sidebar base */
.sidebar {
    width: 260px;
    background: #111827;
    color: white;
    display: flex;
    flex-direction: column;
    padding: 14px;
    gap: 10px;
    transition: width 180ms ease;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar.collapsed {
    width: 84px;
}

/* ป้องกันส่วนบนหด/ทับส่วนล่าง */
.sideTop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 6px 6px 12px;
    flex: 0 0 auto;
    /* ✅ สำคัญ: ไม่ให้ยุบจนทับส่วนอื่น */
}

/* ✅ ตอน collapsed ให้ sideTop เรียงแนวตั้ง */
.sideTop.collapsedTop {
    flex-direction: column;
    align-items: center;
}

.collapseBtn {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.06);
    cursor: pointer;
    transition:
        background 0.35s ease,
        transform 0.35s ease,
        border-color 0.35s ease,
        box-shadow 0.35s ease;
}

.collapseBtn:hover {
    background: rgba(255, 255, 255, 0.16);
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.logo {
    background: linear-gradient(135deg, #60a5fa, #f472b6);
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    font-weight: 800;
    color: #111827;
    flex: 0 0 auto;
}

.brandText {
    font-weight: 800;
    font-size: 16px;
    letter-spacing: 0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.collapseBtn {
    border: none;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    padding: 8px 10px;
    border-radius: 10px;
    transition: background 120ms ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex: 0 0 auto;
}

.collapseBtn:hover {
    background: rgba(255, 255, 255, 0.14);
}

.collapseBtn.collapsedBtn {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    justify-content: center;
    padding: 0;
}

/* .collapseText {
    font-size: 12px;
    font-weight: 700;
    opacity: 0.9;
} */

/* Nav: stick to top */
.nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 2px;
    padding: 0 6px;
    flex: 1 1 auto;
    /* ✅ สำคัญ */
    min-height: 0;
    /* ✅ กัน overflow แปลกๆ */
    overflow: auto;
    /* ✅ ถ้าเมนูยาว ให้ scroll แทนการทับ profile */
}

/* Menu item */
.nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 12px;
    text-decoration: none;
    color: rgba(209, 213, 219, 0.95);
    transition:
        background 0.25s ease,
        color 0.25s ease,
        transform 0.25s ease;
}

.nav-item:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateX(4px);
}

.nav-item.active {
    background: #1f2937;
    color: white;
}

.navIcon {
    width: 22px;
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
}

.navText {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Bottom user section pinned */
.user-section {
    margin-top: auto;
    /* สำคัญ: ดันลงล่างสุด */
    padding: 12px 6px 6px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: grid;
    gap: 10px;
}

.user-info {
    display: flex;
    gap: 10px;
    align-items: center;
}

.avatar {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    background: #374151;
    display: grid;
    place-items: center;
    font-weight: 800;
    flex: 0 0 auto;
}

.userMeta {
    min-width: 0;
}

.user-name {
    font-size: 13px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-role {
    font-size: 12px;
    color: rgba(156, 163, 175, 0.95);
}

.logout-btn {
    width: 100%;
    padding: 10px 12px;
    border-radius: 12px;
    border: none;
    background: rgba(239, 68, 68, 0.95);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    transition: filter 120ms ease;
}

.sidebar:not(.collapsed) .logout-btn {
    justify-content: flex-start;
}

.logout-btn:hover {
    filter: brightness(0.95);
}

.logoutText {
    font-weight: 700;
}

/* Main */
.main {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.topbar {
    background: white;
    padding: 18px 22px;
    border-bottom: 1px solid #e5e7eb;
}

.pageTitle {
    margin: 0;
    font-size: 18px;
}

.content {
    padding: 22px;
}
</style>
