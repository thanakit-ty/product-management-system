const express = require("express");
const { createProduct, listProducts } = require("../controllers/products.controller");

const router = express.Router();

router.get("/", listProducts);
router.post("/", createProduct);

module.exports = router;
