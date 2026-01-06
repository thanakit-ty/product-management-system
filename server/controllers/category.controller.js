const service = require('../services/category.service');

exports.getCategories = async (req, res) => {
    try {
        const result = await service.getAll();
        res.json({ categories: result });
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createCategory = async (req, res) => {
    try {
        const result = await service.create(req.body);
        res.status(201).json(result);
    } catch (err) { res.status(400).json({ error: err.message }); }
};

exports.updateCategory = async (req, res) => {
    try {
        // ไม่ต้อง require ใหม่ ใช้ตัวแปร service ด้านบนได้เลย
        const result = await service.update(req.params.id, req.body);
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteCategory = async (req, res) => {
    try {
        // ไม่ต้อง require ใหม่ ใช้ตัวแปร service ด้านบนได้เลย
        await service.delete(req.params.id);
        res.json({ message: 'Deleted successfully' });
    } catch (err) { res.status(500).json({ error: err.message }); }
};