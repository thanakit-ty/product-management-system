<template>
    <AppLayout>
        <div class="welcome-card">
            <h2>Welcome back 👋</h2>
            <p>
                Manage your products, inventory, and reports here.
            </p>
        </div>
    </AppLayout>
</template>

<script setup>
import AppLayout from "../layouts/AppLayout.vue";
</script>

<style scoped>
.welcome-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
}
</style>
