<template>
  <div class="max-w-md mx-auto bg-white p-6 rounded shadow">
    <h2 class="text-xl font-bold mb-4">{{ route.params.id ? 'Edit' : 'Add' }} Product</h2>
    <form @submit.prevent="submit">
      <div class="mb-4">
        <label class="block mb-1">Name</label>
        <input v-model="form.name" type="text" class="w-full border p-2 rounded" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Price</label>
        <input v-model="form.price" type="number" class="w-full border p-2 rounded" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Category</label>
        <select v-model="form.categoryId" class="w-full border p-2 rounded" required>
          <option v-for="cat in categories" :key="cat._id" :value="cat._id">{{ cat.name }}</option>
        </select>
      </div>
      <button class="bg-green-600 text-white w-full py-2 rounded">Save</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const form = ref({ name: '', price: '', categoryId: '' });
const categories = ref([]);

onMounted(async () => {
  // ดึงหมวดหมู่มาใส่ Dropdown
  const catRes = await axios.get('http://localhost:3000/api/categories');
  categories.value = catRes.data.categories;

  // ถ้าเป็นการ Edit ให้ดึงข้อมูลเก่ามาใส่
  if (route.params.id) {
    const res = await axios.get(`http://localhost:3000/api/product/${route.params.id}`);
    form.value = { ...res.data, categoryId: res.data.categoryId._id || res.data.categoryId };
  }
});

const submit = async () => {
  const url = route.params.id 
    ? `http://localhost:3000/api/product/${route.params.id}` 
    : `http://localhost:3000/api/product`;
  const method = route.params.id ? 'put' : 'post';
  
  await axios[method](url, form.value);
  router.push('/products');
};
</script>