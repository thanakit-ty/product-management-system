<template>
  <div class="bg-white p-6 rounded shadow">
    <div class="flex justify-between mb-4">
      <h2 class="text-2xl font-bold">Products</h2>
      <router-link to="/product/add" class="bg-indigo-600 text-white px-4 py-2 rounded">
        + Add Product
      </router-link>
    </div>
    
    <input v-model="search" @input="fetchData" placeholder="Search..." class="border p-2 w-full mb-4 rounded" />

    <table class="w-full text-left border-collapse">
      <thead>
        <tr class="border-b bg-gray-100">
          <th class="p-3">Name</th>
          <th class="p-3">Price</th>
          <th class="p-3">Category</th>
          <th class="p-3 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p._id" class="border-b hover:bg-gray-50">
          <td class="p-3">{{ p.name }}</td>
          <td class="p-3">{{ p.price }}</td>
          <td class="p-3">{{ p.categoryId?.name || '-' }}</td>
          <td class="p-3 text-center space-x-2">
            <router-link :to="`/product/edit/${p._id}`" class="text-yellow-600">Edit</router-link>
            <button @click="deleteProduct(p._id)" class="text-red-600">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="mt-4 flex gap-2 justify-center">
        <button @click="page--; fetchData()" :disabled="page <= 1" class="px-3 py-1 bg-gray-200 rounded">Prev</button>
        <span>Page {{ page }}</span>
        <button @click="page++; fetchData()" :disabled="page >= totalPages" class="px-3 py-1 bg-gray-200 rounded">Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const products = ref([]);
const search = ref('');
const page = ref(1);
const totalPages = ref(1);

const fetchData = async () => {
  const res = await axios.get(`http://localhost:3000/api/products?page=${page.value}&search=${search.value}`);
  products.value = res.data.products;
  totalPages.value = res.data.totalPages;
};

const deleteProduct = async (id) => {
  if(confirm('Delete this product?')) {
    await axios.delete(`http://localhost:3000/api/product/${id}`);
    fetchData();
  }
};

onMounted(fetchData);
</script>