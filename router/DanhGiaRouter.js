const express = require('express')
const router = express.Router()
const DanhGia = require('../models/DanhGiaModel')
const SanPham = require('../models/SanPhamModel')
const momenttimezone = require('moment-timezone')

router.post('/postdanhgia/:idsanpham', async (req, res) => {
  try {
    const idsanpham = req.params.idsanpham
    const sanpham = await SanPham.findById(idsanpham)
    if (!sanpham) {
      return res.status(400).json({ message: 'Sản phẩm không tồn tại' })
    }
    const { name, email, content, rating } = req.body
    const vietnamTime = momenttimezone().toDate()
    const danhgia = new DanhGia({
      name,
      email,
      content,
      rating,
      date: vietnamTime,
      sanpham: sanpham._id
    })
    await danhgia.save()
    sanpham.danhgia.push(danhgia._id)
    await sanpham.save()

    const danhgiajson = {
      _id: danhgia._id,
      name: 'Nhận xét của bạn đang chờ được kiểm duyệt',
      rating: danhgia.rating,
      content: danhgia.content,
      date: danhgia.date
    }
    res.json(danhgiajson)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/duyetdanhgia/:iddanhgia', async (req, res) => {
  try {
    const iddanhgia = req.params.iddanhgia
    const danhgia = await DanhGia.findById(iddanhgia)
    if (!danhgia) {
      return res.status(400).json({ message: 'Danh gia khong ton tai' })
    }
    danhgia.isRead = true
    await danhgia.save()
    res.json(danhgia)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/xoadanhgia/:iddanhgia', async (req, res) => {
  try {
    const iddanhgia = req.params.iddanhgia
    const danhgia = await DanhGia.findById(iddanhgia)
    if (!danhgia) {
      return res.status(400).json({ message: 'Danh gia khong ton tai' })
    }
    await DanhGia.findByIdAndDelete(iddanhgia)
    res.json(danhgia)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

module.exports = router
