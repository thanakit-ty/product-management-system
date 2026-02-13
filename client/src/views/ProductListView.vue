<template>
    <AppLayout>
        <div class="card">
            <h2>Product List</h2>

            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in products" :key="p.id">
                        <td>{{ p.name }}</td>
                        <td>{{ p.price }}</td>
                        <td>{{ p.stock }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </AppLayout>
</template>

<script setup>
import { ref } from "vue";
import AppLayout from "../layouts/AppLayout.vue";

const products = ref([
    { id: 1, name: "Laptop", price: 35000, stock: 10 },
    { id: 2, name: "Mouse", price: 500, stock: 50 },
]);
</script>

<style scoped>
.card {
    background: white;
    padding: 20px;
    border-radius: 12px;
}

.table {
    width: 100%;
    margin-top: 15px;
    border-collapse: collapse;
}

.table th,
.table td {
    border-bottom: 1px solid #e5e7eb;
    padding: 10px;
    text-align: left;
}
</style>
