<template>
    <div style="max-width: 360px; margin: 60px auto; font-family: system-ui;">
        <h2>Login</h2>

        <form @submit.prevent="onSubmit" style="display:flex; flex-direction:column; gap:10px;">
            <label>
                Email
                <input v-model.trim="email" type="email" autocomplete="email" required
                    style="width:100%; padding:8px;" />
            </label>

            <label>
                Password
                <input v-model="password" type="password" autocomplete="current-password" required
                    style="width:100%; padding:8px;" />
            </label>

            <button :disabled="auth.loading" type="submit" style="padding:10px;">
                {{ auth.loading ? "Signing in..." : "Sign in" }}
            </button>

            <p v-if="auth.error" style="color:#c00; margin:0;">{{ auth.error }}</p>
        </form>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref("");
const password = ref("");
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

async function onSubmit() {
    await auth.login(email.value, password.value);
    const redirect = route.query.redirect || "/";
    router.replace(String(redirect));
}
</script>
