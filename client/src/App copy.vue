<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-indigo-600 text-white p-4">
      <div class="container mx-auto flex gap-4">
        <h1 class="font-bold text-xl">MyStore</h1>
        <RouterLink to="/products" class="hover:underline">Products</RouterLink>
        <RouterLink to="/categories" class="hover:underline">Categories</RouterLink>
      </div>
    </nav>
    <div class="container mx-auto p-4">
      <RouterView />
    </div>
  </div>
</template>