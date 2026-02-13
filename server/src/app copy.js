const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Controllers (เอา product ไว้เหมือนเดิม ส่วน category ไม่ต้อง import controller ที่นี่แล้ว)
const productController = require('../controllers/product.controller');

// --- 1. Import Route ไฟล์ใหม่ที่แยกไว้ ---
const categoryRoutes = require('./routes/category.routes'); 
// ------------------------------------

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// --- จัดการ Routes ---

// ส่วนของ Product (ถ้ายังไม่ได้แยกไฟล์ ก็เขียนสดไว้ตรงนี้เหมือนเดิม)
const productRouter = express.Router();
productRouter.get('/products', productController.getProducts);
productRouter.post('/product', productController.createProduct);
productRouter.get('/product/:id', productController.getProductById);
productRouter.put('/product/:id', productController.updateProduct);
productRouter.delete('/product/:id', productController.deleteProduct);

// โหลดเข้า path /api
app.use('/api', productRouter);

// --- 2. เรียกใช้ Category Routes ที่ Import มา ---
// มันจะเอา route ในไฟล์นั้นมาต่อท้าย /api ให้อัตโนมัติ
app.use('/api', categoryRoutes);
// ---------------------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));