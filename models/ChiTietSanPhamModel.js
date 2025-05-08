const mongoose = require('mongoose')
const chietietspSchema = new mongoose.Schema({
  content: { type: String },
  img: [{ type: String }],
  sanpham: { type: mongoose.Schema.Types.ObjectId, ref: 'sanpham' }
})

const chietietsp = mongoose.model('chietietsp', chietietspSchema)
module.exports = chietietsp
