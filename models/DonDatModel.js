const mongoose = require('mongoose')
const dondatSchema = new mongoose.Schema({
  ngaynhanphong: { type: Date },
  ngaytraphong: { type: Date },
  thucdon: { type: String },
  phone: { type: String },
  trangthai: { type: Number, default: 0 }
})

const dondat = mongoose.model('dondat', dondatSchema)
module.exports = dondat
