const service = require('../services/product.service');

exports.getProducts = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await service.getAll(Number(page), Number(limit), search);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProduct = async (req, res) => {
  try {
    const result = await service.create(req.body);
    res.status(201).json(result);
  } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.getProductById = async (req, res) => {
    const result = await service.getById(req.params.id);
    res.json(result);
};

exports.updateProduct = async (req, res) => {
    const result = await service.update(req.params.id, req.body);
    res.json(result);
};

exports.deleteProduct = async (req, res) => {
    await service.delete(req.params.id);
    res.json({ message: 'Deleted' });
};