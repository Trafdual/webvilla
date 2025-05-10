const express = require('express')
const router = express.Router()
const uploads = require('./upload')
const ChiTietSanPham = require('../models/ChiTietSanPhamModel')
const SanPham = require('../models/SanPhamModel')
const DanhGia = require('../models/DanhGiaModel')

const unicode = require('unidecode')
function removeSpecialChars (str) {
  const specialChars = /[:+,!@#$%^&*()\-/?.\s]/g
  return str
    .replace(specialChars, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

router.get('/chitietsanpham/:namekhongdau', async (req, res) => {
  try {
    const namekhongdau = req.params.namekhongdau
    const sanpham = await SanPham.findOne({ namekhongdau })
    if (!sanpham) {
      return res.status(400).json({ message: 'Sản phẩm không tồn tại' })
    }
    const chitietsanpham = await ChiTietSanPham.findById(sanpham.chitiet._id)
    if (!chitietsanpham) {
      return res
        .status(400)
        .json({ message: 'Chi tiết sản phẩm không tồn tại' })
    }

    const danhgiajson = await Promise.all(
      sanpham.danhgia.map(async dg => {
        const danhgia = await DanhGia.findOne({ _id: dg._id, isRead: true })
        if (!danhgia) return null

        return {
          _id: danhgia._id,
          name: danhgia.name,
          rating: danhgia.rating,
          content: danhgia.content,
          date: danhgia.date
        }
      })
    )

    const danhgiaFiltered = danhgiajson.filter(dg => dg !== null)

    const cacphongconlai = await SanPham.find({
      _id: { $ne: sanpham._id }
    }).lean()

    const cacphongconlaijson = cacphongconlai.map(sp => {
      return {
        _id: sp._id,
        namesanpham: sp.namesanpham,
        namekhongdau: sp.namekhongdau,
        img: sp.img_sanpham
      }
    })

    const datajson = {
      sanpham: sanpham.namesanpham,
      chitietsanpham,
      danhgia: danhgiaFiltered,
      remainingroom: cacphongconlaijson
    }
    res.json(datajson)
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log(error)
  }
})

router.post(
  '/postsanpham',
  uploads.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 100 }
  ]),
  async (req, res) => {
    try {
      const { namesanpham, content } = req.body
      const image = req.files['image']?.[0]?.filename || null
      const detailImages =
        req.files['images']?.map(file => `${file.filename}`) || []

      const name = unicode(namesanpham)
      const namekhongdau = removeSpecialChars(name)

      const existed = await SanPham.findOne({ namekhongdau })
      if (existed) {
        return res.status(400).json({ message: 'Sản phẩm đã tồn tại' })
      }

      const sanpham = new SanPham({
        namesanpham,
        namekhongdau,
        img_sanpham: image
      })

      await sanpham.save()

      const chitietsanpham = new ChiTietSanPham({
        content,
        img: detailImages,
        sanpham: sanpham._id
      })

      await chitietsanpham.save()

      sanpham.chitiet = chitietsanpham._id
      await sanpham.save()

      res.json({
        sanpham,
        chitietsanpham
      })
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: error.message })
    }
  }
)

router.post(
  '/updatesanpham/:idsanpham',
  uploads.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 100 }
  ]),
  async (req, res) => {
    try {
      const { idsanpham } = req.params
      const { namesanpham, content } = req.body
      const updatedSanphamFields = {}

      if (namesanpham) {
        const name = unicode(namesanpham)
        const namekhongdau = removeSpecialChars(name)

        const existed = await SanPham.findOne({
          namekhongdau,
          _id: { $ne: idsanpham }
        })
        if (existed) {
          return res.status(400).json({ message: 'Sản phẩm đã tồn tại' })
        }

        updatedSanphamFields.namesanpham = namesanpham
        updatedSanphamFields.namekhongdau = namekhongdau
      }

      const image = req.files['image']?.[0]?.filename
      if (image) {
        updatedSanphamFields.img_sanpham = image
      }

      const updatedSanpham = await SanPham.findByIdAndUpdate(
        idsanpham,
        { $set: updatedSanphamFields },
        { new: true }
      )

      if (!updatedSanpham) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
      }

      // === CẬP NHẬT CHI TIẾT SẢN PHẨM ===
      const chitietsanpham = await ChiTietSanPham.findById(
        updatedSanpham.chitiet._id
      )
      if (!chitietsanpham) {
        return res
          .status(404)
          .json({ message: 'Không tìm thấy chi tiết sản phẩm' })
      }

      const newImages =
        req.files['images']?.map(file => `${file.filename}`) || []
      if (newImages.length > 0) {
        chitietsanpham.img = chitietsanpham.img.concat(newImages)
      }
      if (content) {
        chitietsanpham.content = content
      }
      await chitietsanpham.save()

      res.json(updatedSanpham)
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: error.message })
    }
  }
)

router.get('/getttsanpham/:idsanpham', async (req, res) => {
  try {
    const { idsanpham } = req.params

    const sanpham = await SanPham.findById(idsanpham)
    if (!sanpham) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' })
    }
    const chitietsanpham = await ChiTietSanPham.findById(sanpham.chitiet._id)

    const data = {
      _id: sanpham._id,
      namesanpham: sanpham.namesanpham,
      namekhongdau: sanpham.namekhongdau,
      img_sanpham: sanpham.img_sanpham,
      chitiet: {
        _id: chitietsanpham._id,
        img: chitietsanpham.img,
        content: chitietsanpham.content
      }
    }

    res.json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Lỗi máy chủ' })
  }
})

router.post('/postxoaanh/:idchitiet', async (req, res) => {
  try {
    const idchitiet = req.params.idchitiet
    const { imagesToRemove } = req.body

    const chitietsanpham = await ChiTietSanPham.findById(idchitiet)
    if (!chitietsanpham) {
      return res
        .status(404)
        .json({ message: 'Không tìm thấy chi tiết sản phẩm' })
    }

    if (imagesToRemove) {
      const removeList = Array.isArray(imagesToRemove)
        ? imagesToRemove
        : imagesToRemove.split(',')

      removeList.forEach(imgUrl => {
        const index = chitietsanpham.img.indexOf(imgUrl)
        if (index !== -1) {
          chitietsanpham.img.splice(index, 1)
        }
      })
    }

    await chitietsanpham.save()
    res.json(chitietsanpham)
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log(error)
  }
})

module.exports = router
