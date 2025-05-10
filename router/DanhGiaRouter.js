const express = require('express')
const router = express.Router()
const DanhGia = require('../models/DanhGiaModel')
const SanPham = require('../models/SanPhamModel')
const momenttimezone = require('moment-timezone')
const moment = require('moment')

router.get('/getdanhgiaadmin', async (req, res) => {
  try {
    const danhgia = await DanhGia.find().lean()
    const danhgiajson = danhgia.map(dg => {
      return {
        _id: dg._id,
        name: dg.name,
        email: dg.email,
        rating: dg.rating,
        content: dg.content,
        date: moment(dg.date).format('HH:mm:ss DD/MM/YYYY'),
        trangthai: dg.isRead
      }
    })

    res.json(danhgiajson)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getdanhgia/:idsanpham', async (req, res) => {
  try {
    const idsanpham = req.params.idsanpham
    const sanpham = await SanPham.findById(idsanpham)
    if (!sanpham) {
      return res.json({ error: 'Sản phẩm không tồn tại' })
    }
    const danhgiajson = await Promise.all(
      sanpham.danhgia.map(async dg => {
        const danhgia = await DanhGia.findById(dg._id)
        if (!danhgia) return null
        return {
          _id: danhgia._id,
          name: danhgia.name,
          rating: danhgia.rating,
          content: danhgia.content,
          date: moment(danhgia.date).format('DD/MM/YYYY'),
          trangthai: danhgia.isRead
        }
      })
    )
    const danhgiaFiltered = danhgiajson.filter(dg => dg !== null)
    res.json(danhgiaFiltered)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getdgfall', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [danhgia, total] = await Promise.all([
      DanhGia.find({ isRead: false }).skip(skip).limit(limit).lean(),
      DanhGia.countDocuments({ isRead: false })
    ])

    res.json({
      data: danhgia,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/postdanhgia/:namekhongdau', async (req, res) => {
  try {
    const namekhongdau = req.params.namekhongdau
    const sanpham = await SanPham.findOne({ namekhongdau })
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

router.post('/postdanhgiaadmin', async (req, res) => {
  try {
    const { name, email, content, rating, namesanpham } = req.body
    const sanpham = await SanPham.findOne({ namesanpham })
    if (!sanpham) {
      return res.status(400).json({ message: 'Sản phẩm không tồn tại' })
    }

    const vietnamTime = momenttimezone().toDate()
    const danhgia = new DanhGia({
      name,
      email,
      content,
      rating,
      date: vietnamTime,
      sanpham: sanpham._id,
      isRead: true
    })
    await danhgia.save()
    sanpham.danhgia.push(danhgia._id)
    await sanpham.save()
    res.json(danhgia)
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
