const mongoose = require('mongoose')
const blogSchema = new mongoose.Schema({
  tieude_blog: { type: String, require: true },
  tieude_khongdau: { type: String, require: true },
  img_blog: { type: String },
  noidung: { type: String }
})

const blog = mongoose.model('blog', blogSchema)
module.exports = blog
