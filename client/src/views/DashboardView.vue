<template>
    <div style="padding: 24px; font-family: system-ui;">
        <h1>Dashboard</h1>
        <p v-if="auth.user">Hi, {{ auth.user.name || auth.user.email }} ({{ auth.user.role }})</p>

        <button @click="onLogout">Logout</button>
    </div>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

function onLogout() {
    auth.logout();
    router.replace("/login");
}
</script>
