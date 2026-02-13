const Product = require('../src/models/Product');

exports.getAll = async (page = 1, limit = 10, search = '') => {
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  const products = await Product.find(query)
    .populate('categoryId', 'name')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
  const total = await Product.countDocuments(query);
  return { products, total, totalPages: Math.ceil(total / limit) };
};

exports.create = async (data) => Product.create(data);
exports.getById = async (id) => Product.findById(id);
exports.update = async (id, data) => Product.findByIdAndUpdate(id, data, { new: true });
exports.delete = async (id) => Product.findByIdAndDelete(id);