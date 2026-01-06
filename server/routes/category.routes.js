const express = require('express');
const router = express.Router();
// Import Controller เพื่อเอามาใช้ในหน้านี้
const categoryController = require('../controllers/category.controller');

// กำหนดเส้นทาง (Routes)
router.get('/categories', categoryController.getCategories);
router.post('/category', categoryController.createCategory);
router.put('/category/:id', categoryController.updateCategory);
router.delete('/category/:id', categoryController.deleteCategory);

// สำคัญมาก! ต้อง Export ออกไปให้ app.js ใช้
module.exports = router;