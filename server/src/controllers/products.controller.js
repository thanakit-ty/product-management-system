const Product = require("../models/Product");

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

function toDateOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? NaN : d;
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

  const startDate = toDateOrNull(body?.startDate);
  if (Number.isNaN(startDate)) details.startDate = "Start date is invalid";

  const dueDate = toDateOrNull(body?.dueDate);
  if (Number.isNaN(dueDate)) details.dueDate = "Due date is invalid";

  const status = body?.status;
  if (
    status !== undefined &&
    status !== "received" &&
    status !== "in_progress" &&
    status !== "problem" &&
    status !== "done"
  ) {
    details.status = "Status must be received, in_progress, problem, or done";
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
      startDate: startDate === null ? null : startDate,
      dueDate: dueDate === null ? null : dueDate,
      status:
        status === "received" || status === "in_progress" || status === "problem" || status === "done"
          ? status
          : "received",
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
    if (status === "received" || status === "in_progress" || status === "problem" || status === "done") {
      filter.status = status;
    }

    const allowedSort = new Set(["name", "price", "startDate", "dueDate", "updatedAt"]);
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

async function getProduct(req, res, next) {
  try {
    const { id } = req.params;
    const found = await Product.findById(id).lean();
    if (!found) return res.status(404).json({ message: "Not found" });
    return res.json(found);
  } catch (err) {
    return next(err);
  }
}

function validateUpdateProduct(body) {
  const details = {};

  const value = {};

  if (body?.name !== undefined) {
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    if (!name) details.name = "Name is required";
    else if (name.length < 2) details.name = "Name must be at least 2 characters";
    else value.name = name;
  }

  if (body?.sku !== undefined) {
    const rawSku = typeof body?.sku === "string" ? body.sku.trim() : "";
    if (!rawSku) details.sku = "SKU is required";
    else if (rawSku.length < 3) details.sku = "SKU must be at least 3 characters";
    else value.sku = rawSku.toUpperCase();
  }

  if (body?.category !== undefined) {
    const category = typeof body?.category === "string" ? body.category.trim() : "";
    if (!category) details.category = "Category is required";
    else value.category = category;
  }

  if (body?.price !== undefined) {
    const priceNum = toNumber(body?.price);
    if (!Number.isFinite(priceNum)) details.price = "Price is required";
    else if (priceNum < 0) details.price = "Price must be 0 or greater";
    else value.price = priceNum;
  }

  if (body?.startDate !== undefined) {
    const startDate = toDateOrNull(body?.startDate);
    if (Number.isNaN(startDate)) details.startDate = "Start date is invalid";
    else value.startDate = startDate === null ? null : startDate;
  }

  if (body?.dueDate !== undefined) {
    const dueDate = toDateOrNull(body?.dueDate);
    if (Number.isNaN(dueDate)) details.dueDate = "Due date is invalid";
    else value.dueDate = dueDate === null ? null : dueDate;
  }

  const status = body?.status;
  if (status !== undefined) {
    if (status !== "received" && status !== "in_progress" && status !== "problem" && status !== "done") {
      details.status = "Status must be received, in_progress, problem, or done";
    } else {
      value.status = status;
    }
  }

  const description = body?.description;
  if (description !== undefined && description !== null) {
    if (typeof description !== "string") details.description = "Description must be a string";
    else if (description.length > 500) details.description = "Description must be 500 characters or less";
    else value.description = description.trim();
  }

  const ok = Object.keys(details).length === 0;
  return { ok, details, value };
}

async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const { ok, details, value } = validateUpdateProduct(req.body);
    if (!ok) return res.status(400).json({ message: "Validation failed", details });

    const updated = await Product.findByIdAndUpdate(id, value, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: "SKU already exists" });
    }
    return next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
};
