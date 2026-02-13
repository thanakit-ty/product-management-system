<template>
    <div style="max-width: 360px; margin: 60px auto; font-family: system-ui;">
        <h2>Register</h2>

        <form @submit.prevent="onSubmit" style="display:flex; flex-direction:column; gap:10px;">
            <label>
                Name
                <input v-model.trim="name" type="text" autocomplete="name" style="width:100%; padding:8px;" />
            </label>

            <label>
                Email
                <input v-model.trim="email" type="email" autocomplete="email" required
                    style="width:100%; padding:8px;" />
            </label>

            <label>
                Password
                <input v-model="password" type="password" autocomplete="new-password" required minlength="6"
                    style="width:100%; padding:8px;" />
            </label>

            <label>
                Confirm Password
                <input v-model="confirm" type="password" autocomplete="new-password" required minlength="6"
                    style="width:100%; padding:8px;" />
            </label>

            <button :disabled="auth.loading" type="submit" style="padding:10px;">
                {{ auth.loading ? "Creating..." : "Create account" }}
            </button>

            <p v-if="localError" style="color:#c00; margin:0;">{{ localError }}</p>
            <p v-else-if="auth.error" style="color:#c00; margin:0;">{{ auth.error }}</p>

            <p style="margin: 6px 0 0;">
                Already have an account?
                <a href="" @click.prevent="goLogin">Login</a>
            </p>
        </form>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");
const localError = ref("");

async function onSubmit() {
    localError.value = "";
    if (password.value !== confirm.value) {
        localError.value = "Password and Confirm Password do not match";
        return;
    }

    const data = await auth.register({
        name: name.value,
        email: email.value,
        password: password.value,
    });

    // ✅ ถ้า auto-login สำเร็จ => ไป dashboard
    if (auth.isAuthed) {
        const redirect = route.query.redirect || "/";
        router.replace(String(redirect));
        return;
    }

    // ✅ ถ้าไม่ได้ auto-login => ส่งไปหน้า login พร้อมเติม email
    router.replace({ name: "login", query: { email: email.value } });
}

function goLogin() {
    router.push({ name: "login" });
}
</script>
