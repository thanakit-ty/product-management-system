const Category = require('../models/Category');

exports.getAll = async () => {
    return await Category.find().sort({ createdAt: -1 });
};

exports.create = async (data) => {
    return await Category.create(data);
};

// --- ต้องเพิ่ม 2 อันนี้ ไม่งั้น Controller จะ Error ว่า service.update is not a function ---

exports.update = async (id, data) => {
    return await Category.findByIdAndUpdate(id, data, { new: true });
};

exports.delete = async (id) => {
    return await Category.findByIdAndDelete(id);
};