const mongoose = require('mongoose')
const sanphamSchema = new mongoose.Schema({
  namesanpham: { type: String, require: true },
  namekhongdau: { type: String, require: true },
  img_sanpham: { type: String },
  chitiet: { type: mongoose.Schema.Types.ObjectId, ref: 'chitietsp' },
  danhgia: [{ type: mongoose.Schema.Types.ObjectId, ref: 'danhgia' }],
})

const sanpham = mongoose.model('sanpham', sanphamSchema)
module.exports = sanpham
