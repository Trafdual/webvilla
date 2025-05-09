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

router.post('/deletesanpham', async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Danh sách ID không hợp lệ' })
    }

    for (const id of ids) {
      const sanpham = await SanPham.findById(id)
      if (sanpham.chitiet) {
        await chietietsp.deleteOne({ _id: sanpham.chitiet._id })
      }
    }
    await SanPham.deleteMany({ _id: { $in: ids } })

    res.json({ message: 'Xóa thành công' })
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log(error)
  }
})

module.exports = router
