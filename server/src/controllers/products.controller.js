const Product = require("../models/Product");

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

function validateCreateProduct(body) {
  const details = {};

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) details.name = "Name is required";
  else if (name.length < 2) details.name = "Name must be at least 2 characters";

  const rawSku = typeof body?.sku === "string" ? body.sku.trim() : "";
  if (!rawSku) details.sku = "SKU is required";
  else if (rawSku.length < 3) details.sku = "SKU must be at least 3 characters";

  const category = typeof body?.category === "string" ? body.category.trim() : "";
  if (!category) details.category = "Category is required";

  const priceNum = toNumber(body?.price);
  if (!Number.isFinite(priceNum)) details.price = "Price is required";
  else if (priceNum < 0) details.price = "Price must be 0 or greater";

  const stockNum = toNumber(body?.stock);
  if (!Number.isFinite(stockNum)) details.stock = "Stock is required";
  else if (!Number.isInteger(stockNum)) details.stock = "Stock must be an integer";
  else if (stockNum < 0) details.stock = "Stock must be 0 or greater";

  const status = body?.status;
  if (status !== undefined && status !== "active" && status !== "inactive") {
    details.status = "Status must be active or inactive";
  }

  const description = body?.description;
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") details.description = "Description must be a string";
    else if (description.length > 500) details.description = "Description must be 500 characters or less";
  }

  const ok = Object.keys(details).length === 0;

  return {
    ok,
    details,
    value: {
      name,
      sku: rawSku.toUpperCase(),
      category,
      description: typeof description === "string" ? description.trim() : "",
      price: priceNum,
      stock: stockNum,
      status: status === "inactive" ? "inactive" : "active",
    },
  };
}

async function createProduct(req, res, next) {
  try {
    const { ok, details, value } = validateCreateProduct(req.body);
    if (!ok) {
      return res.status(400).json({ message: "Validation failed", details });
    }

    const created = await Product.create(value);
    return res.status(201).json(created);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "SKU already exists" });
    }

    if (err?.name === "ValidationError") {
      const details = {};
      for (const [k, v] of Object.entries(err.errors || {})) {
        details[k] = v?.message || "Invalid value";
      }
      return res.status(400).json({ message: "Validation failed", details });
    }

    return next(err);
  }
}

async function listProducts(req, res, next) {
  try {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status.trim() : "";

    const sortRaw = typeof req.query.sort === "string" ? req.query.sort.trim() : "";
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;
    if (status === "active" || status === "inactive") filter.status = status;

    const allowedSort = new Set(["name", "price", "stock", "updatedAt"]);
    let sort = { updatedAt: -1 };
    if (sortRaw) {
      const dir = sortRaw.startsWith("-") ? -1 : 1;
      const key = sortRaw.replace(/^[-+]/, "");
      if (allowedSort.has(key)) sort = { [key]: dir };
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const categories = await Product.distinct("category");

    return res.json({ items, total, categories });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createProduct,
  listProducts,
};
