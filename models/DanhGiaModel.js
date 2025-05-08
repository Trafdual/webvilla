const mongoose = require('mongoose')
const danhgiaSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  sanpham: { type: mongoose.Schema.Types.ObjectId, ref: 'sanpham' },
  content: { type: String },
  isRead: { type: Boolean, default: false },
  date: { type: Date },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  }
})

const danhgia = mongoose.model('danhgia', danhgiaSchema)
module.exports = danhgia
