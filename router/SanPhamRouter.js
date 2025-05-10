const express = require('express')
const router = express.Router()
const SanPham = require('../models/SanPhamModel')
const chietietsp = require('../models/ChiTietSanPhamModel')

router.get('/sanpham', async (req, res) => {
  try {
    const sanpham = await SanPham.find().lean()
    const sanphamjson = sanpham.map(sp => {
      return {
        _id: sp._id,
        name: sp.namesanpham,
        namekhongdau: sp.namekhongdau,
        img: sp.img_sanpham
      }
    })
    res.json(sanphamjson)
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log(error)
  }
})

router.get('/sanphamadmin', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      SanPham.find().skip(skip).limit(limit).lean(),
      SanPham.countDocuments()
    ])

    res.json({
      data,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log(error)
  }
})

router.post('/deletesanpham/:id', async (req, res) => {
  try {
    const id = req.params.id
    const sanpham = await SanPham.findById(id)
    await chietietsp.findByIdAndDelete(sanpham.chitiet._id)
    await SanPham.findByIdAndDelete(id)

    res.json({ message: 'Xóa thành công' })
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log(error)
  }
})

module.exports = router
