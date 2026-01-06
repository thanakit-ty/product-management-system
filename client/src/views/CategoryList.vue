<template>
  <div class="bg-white p-6 rounded shadow">
    <h2 class="text-2xl font-bold mb-4">Categories</h2>
    
    <div class="flex gap-2 mb-6">
        <input 
          v-model="newCatName" 
          @keyup.enter="addCategory"
          placeholder="New Category Name" 
          class="border p-2 rounded w-1/3" 
        />
        <button @click="addCategory" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add
        </button>
    </div>

    <table class="w-full text-left border-collapse border border-gray-200">
      <thead class="bg-gray-100">
        <tr>
            <th class="border p-3">Name</th>
            <th class="border p-3 text-center w-40">Action</th> </tr>
      </thead>
      <tbody>
        <tr v-for="c in categories" :key="c._id" class="border-b hover:bg-gray-50">
            <td class="p-3">{{ c.name }}</td>
            <td class="p-3 text-center space-x-2">
                <button 
                  @click="editCategory(c)" 
                  class="text-yellow-600 hover:text-yellow-800 font-medium"
                >
                  Edit
                </button>
                
                <button 
                  @click="deleteCategory(c._id)" 
                  class="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
            </td>
        </tr>
        <tr v-if="categories.length === 0">
            <td colspan="2" class="p-4 text-center text-gray-500">No categories found.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const categories = ref([]);
const newCatName = ref('');
const API_URL = 'http://localhost:3000/api'; // ปรับตาม Port ของคุณ

// 1. ดึงข้อมูล
const fetchCats = async () => {
    try {
        const res = await axios.get(`${API_URL}/categories`);
        categories.value = res.data.categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

// 2. เพิ่มข้อมูล
const addCategory = async () => {
    if(!newCatName.value.trim()) return alert("Please enter name");
    try {
        await axios.post(`${API_URL}/category`, { name: newCatName.value });
        newCatName.value = '';
        fetchCats(); // โหลดข้อมูลใหม่
    } catch (error) {
        alert("Error adding category");
    }
}

// 3. แก้ไขข้อมูล (ใช้ Prompt เด้งขึ้นมาถาม)
const editCategory = async (category) => {
    const newName = prompt("Enter new category name:", category.name);
    
    // ถ้ากด OK และชื่อไม่ว่างเปล่า และชื่อเปลี่ยนไปจากเดิม
    if (newName && newName.trim() !== "" && newName !== category.name) {
        try {
            await axios.put(`${API_URL}/category/${category._id}`, { 
                name: newName 
            });
            fetchCats(); // โหลดข้อมูลใหม่
        } catch (error) {
            alert("Error updating category");
            console.error(error);
        }
    }
}

// 4. ลบข้อมูล
const deleteCategory = async (id) => {
    if(confirm("Are you sure you want to delete this category?")) {
        try {
            await axios.delete(`${API_URL}/category/${id}`);
            fetchCats(); // โหลดข้อมูลใหม่
        } catch (error) {
            alert("Error deleting category");
            console.error(error);
        }
    }
}

onMounted(fetchCats);
</script>