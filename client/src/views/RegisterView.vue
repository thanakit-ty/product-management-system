<template>
    <div class="page">
        <div class="bg-orb orb-1" />
        <div class="bg-orb orb-2" />

        <main class="card" aria-label="Register form">
            <header class="header">
                <div class="logo" aria-hidden="true">PM</div>
                <div>
                    <h1 class="title">Create account</h1>
                    <p class="subtitle">Join Product Management System</p>
                </div>
            </header>

            <form class="form" @submit.prevent="onSubmit">
                <div class="field">
                    <label class="label" for="name">Name</label>
                    <div class="inputWrap">
                        <span class="icon" aria-hidden="true">👤</span>
                        <input id="name" v-model.trim="name" class="input" type="text" autocomplete="name"
                            placeholder="Your name" :disabled="auth.loading" />
                    </div>
                </div>

                <div class="field">
                    <label class="label" for="email">Email</label>
                    <div class="inputWrap">
                        <span class="icon" aria-hidden="true">✉️</span>
                        <input id="email" v-model.trim="email" class="input" type="email" inputmode="email"
                            autocomplete="email" placeholder="you@company.com" required :disabled="auth.loading" />
                    </div>
                </div>

                <div class="field">
                    <label class="label" for="password">Password</label>
                    <div class="inputWrap">
                        <span class="icon" aria-hidden="true">🔒</span>
                        <input id="password" v-model="password" class="input" :type="showPassword ? 'text' : 'password'"
                            autocomplete="new-password" placeholder="At least 6 characters" required minlength="6"
                            :disabled="auth.loading" />
                        <button type="button" class="ghostBtn" @click="showPassword = !showPassword"
                            :disabled="auth.loading" :aria-label="showPassword ? 'Hide password' : 'Show password'"
                            :title="showPassword ? 'Hide password' : 'Show password'">
                            {{ showPassword ? "Hide" : "Show" }}
                        </button>
                    </div>
                </div>

                <div class="field">
                    <label class="label" for="confirm">Confirm password</label>
                    <div class="inputWrap">
                        <span class="icon" aria-hidden="true">🔁</span>
                        <input id="confirm" v-model="confirm" class="input" :type="showConfirm ? 'text' : 'password'"
                            autocomplete="new-password" placeholder="Re-enter your password" required minlength="6"
                            :disabled="auth.loading" />
                        <button type="button" class="ghostBtn" @click="showConfirm = !showConfirm"
                            :disabled="auth.loading"
                            :aria-label="showConfirm ? 'Hide confirm password' : 'Show confirm password'"
                            :title="showConfirm ? 'Hide confirm password' : 'Show confirm password'">
                            {{ showConfirm ? "Hide" : "Show" }}
                        </button>
                    </div>
                </div>

                <div v-if="localError" class="alert" role="alert">
                    <span class="alertDot" aria-hidden="true" />
                    <span>{{ localError }}</span>
                </div>

                <div v-else-if="auth.error" class="alert" role="alert">
                    <span class="alertDot" aria-hidden="true" />
                    <span>{{ auth.error }}</span>
                </div>

                <button class="primaryBtn" type="submit" :disabled="auth.loading || !canSubmit">
                    <span v-if="!auth.loading">Create account</span>
                    <span v-else class="spinnerWrap">
                        <span class="spinner" aria-hidden="true" />
                        Creating...
                    </span>
                </button>

                <div class="footerRow">
                    <a class="link" href="" @click.prevent="goLogin">Already have an account? Login</a>
                    <a class="link muted" href="" @click.prevent="viewTerms">Terms</a>
                </div>
            </form>

            <footer class="fineprint">
                © {{ new Date().getFullYear() }} PMS • By creating an account, you agree to the Terms
            </footer>
        </main>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const name = ref("");
const email = ref("");
const password = ref("");
const confirm = ref("");

const showPassword = ref(false);
const showConfirm = ref(false);

const localError = ref("");

const canSubmit = computed(() => {
    const okEmail = email.value.length > 3;
    const okPass = password.value.length >= 6;
    const okConfirm = confirm.value.length >= 6;
    return okEmail && okPass && okConfirm && password.value === confirm.value;
});

async function onSubmit() {
    localError.value = "";

    if (password.value !== confirm.value) {
        localError.value = "Password and Confirm Password do not match";
        return;
    }

    await auth.register({
        name: name.value,
        email: email.value,
        password: password.value,
    });

    // ✅ ถ้า server auto-login (ส่ง token กลับมา) จะไป dashboard
    if (auth.isAuthed) {
        const redirect = route.query.redirect || "/";
        router.replace(String(redirect));
        return;
    }

    // ✅ ถ้าไม่ได้ auto-login => ไปหน้า login พร้อมเติม email ให้
    router.replace({ name: "login", query: { email: email.value, redirect: route.query.redirect || "/" } });
}

function goLogin() {
    router.push({ name: "login" });
}

function viewTerms() {
    alert("Terms page is not implemented yet.");
}
</script>

<style scoped>
/* Page background */
.page {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: radial-gradient(1200px 600px at 20% 20%, #1a2a6c22, transparent 60%),
        radial-gradient(1000px 500px at 80% 10%, #b21f1f22, transparent 60%),
        radial-gradient(900px 500px at 70% 80%, #fdbb2d22, transparent 60%),
        linear-gradient(135deg, #0f172a 0%, #111827 50%, #0b1220 100%);
    overflow: hidden;
    position: relative;
}

/* Floating orbs */
.bg-orb {
    position: absolute;
    border-radius: 999px;
    filter: blur(30px);
    opacity: 0.55;
    transform: translateZ(0);
}

.orb-1 {
    width: 340px;
    height: 340px;
    left: -80px;
    top: 120px;
    background: radial-gradient(circle at 30% 30%, #60a5fa, #2563eb);
}

.orb-2 {
    width: 420px;
    height: 420px;
    right: -140px;
    top: -120px;
    background: radial-gradient(circle at 30% 30%, #fb7185, #db2777);
}

/* Card */
.card {
    width: 100%;
    max-width: 440px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
    border-radius: 18px;
    padding: 22px;
    backdrop-filter: blur(12px);
}

.header {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 14px;
}

.logo {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    font-weight: 800;
    letter-spacing: 0.5px;
    color: #0b1220;
    background: linear-gradient(135deg, #93c5fd, #fda4af);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
}

.title {
    margin: 0;
    color: #f8fafc;
    font-size: 20px;
    line-height: 1.1;
}

.subtitle {
    margin: 4px 0 0;
    color: rgba(248, 250, 252, 0.72);
    font-size: 13px;
}

.form {
    display: grid;
    gap: 12px;
    margin-top: 14px;
}

.field {
    display: grid;
    gap: 6px;
}

.label {
    color: rgba(248, 250, 252, 0.8);
    font-size: 12px;
}

.inputWrap {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    background: rgba(15, 23, 42, 0.55);
    border: 1px solid rgba(148, 163, 184, 0.18);
    transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
}

.inputWrap:focus-within {
    border-color: rgba(96, 165, 250, 0.65);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
}

.icon {
    width: 18px;
    opacity: 0.9;
    filter: saturate(0.9);
}

.input {
    flex: 1;
    outline: none;
    border: none;
    background: transparent;
    color: #f8fafc;
    font-size: 14px;
}

.input::placeholder {
    color: rgba(248, 250, 252, 0.35);
}

.ghostBtn {
    border: none;
    background: transparent;
    color: rgba(248, 250, 252, 0.78);
    font-size: 12px;
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 10px;
    transition: background 120ms ease, color 120ms ease;
}

.ghostBtn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(248, 250, 252, 0.92);
}

.ghostBtn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(248, 113, 113, 0.35);
    background: rgba(248, 113, 113, 0.12);
    color: rgba(254, 226, 226, 0.95);
    font-size: 13px;
}

.alertDot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #fb7185;
    box-shadow: 0 0 0 3px rgba(251, 113, 133, 0.18);
}

.primaryBtn {
    margin-top: 2px;
    border: none;
    cursor: pointer;
    border-radius: 12px;
    padding: 11px 12px;
    font-weight: 700;
    color: #0b1220;
    background: linear-gradient(135deg, #93c5fd, #fda4af);
    box-shadow: 0 14px 35px rgba(0, 0, 0, 0.25);
    transition: transform 120ms ease, filter 120ms ease;
}

.primaryBtn:hover {
    transform: translateY(-1px);
    filter: brightness(1.03);
}

.primaryBtn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
}

.spinnerWrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.spinner {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid rgba(11, 18, 32, 0.35);
    border-top-color: rgba(11, 18, 32, 0.95);
    animation: spin 0.8s linear infinite;
}

.footerRow {
    display: flex;
    justify-content: space-between;
    margin-top: 4px;
}

.link {
    color: rgba(147, 197, 253, 0.95);
    text-decoration: none;
    font-size: 13px;
}

.link:hover {
    text-decoration: underline;
}

.muted {
    color: rgba(248, 250, 252, 0.55);
}

.fineprint {
    margin-top: 16px;
    color: rgba(248, 250, 252, 0.45);
    font-size: 12px;
    text-align: center;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
