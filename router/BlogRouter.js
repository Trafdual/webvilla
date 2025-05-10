const express = require('express')
const router = express.Router()
const uploads = require('./upload')
const Blog = require('../models/BlogModel')
const momenttimezone = require('moment-timezone')
const moment = require('moment')
const unicode = require('unidecode')
function removeSpecialChars (str) {
  const specialChars = /[:+,!@#$%^&*()\-/?.\s]/g
  return str
    .replace(specialChars, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

router.post(
  '/postblog',
  uploads.fields([{ name: 'image', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { tieude_blog, noidung } = req.body

      const image = req.files['image']
        ? `${req.files['image'][0].filename}`
        : null
      const vietnamTime = momenttimezone().toDate()
      const tieude_khongdau1 = unicode(tieude_blog)
      const tieude_khongdau = removeSpecialChars(tieude_khongdau1)
      const blog = new Blog({
        tieude_blog,
        tieude_khongdau,
        img_blog: image,
        ngaydang: vietnamTime,
        noidung
      })
      await blog.save()
      res.json(blog)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
    }
  }
)

router.post(
  '/updateblog/:id',
  uploads.fields([{ name: 'image', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { tieude_blog, noidung } = req.body
      const id = req.params.id

      const blog = await Blog.findById(id)
      if (!blog) {
        return res.status(404).json({ message: 'Không tìm thấy bài viết' })
      }

      const image = req.files['image']
        ? `${req.files['image'][0].filename}`
        : null

      if (tieude_blog) {
        const tieude_khongdau1 = unicode(tieude_blog)
        const tieude_khongdau = removeSpecialChars(tieude_khongdau1)
        blog.tieude_blog = tieude_blog
        blog.tieude_khongdau = tieude_khongdau
      }

      if (image) {
        blog.img_blog = image
      }

      if (noidung) {
        blog.noidung = noidung
      }

      await blog.save()
      res.json(blog)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
    }
  }
)

router.post('/deleteblog', async (req, res) => {
  try {
    const { ids } = req.body
    await Blog.deleteMany({ _id: { $in: ids } })
    res.json({ message: 'Xóa thành công' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getblog', async (req, res) => {
  try {
    const blog = await Blog.find().lean()
    const blogjson = blog.map(bl => {
      return {
        _id: bl._id,
        tieude_blog: bl.tieude_blog,
        tieude_khongdau: bl.tieude_khongdau,
        img_blog: bl.img_blog,
        ngaydang: moment(bl.ngaydang).format('DD/MM/YYYY'),
      }
    })
    res.json(blogjson)
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log(error)
  }
})




router.get('/getchitietblog/:tieude_khongdau', async (req, res) => {
  try {
    const tieude_khongdau = req.params.tieude_khongdau
    const blog = await Blog.findOne({ tieude_khongdau })
    const prev = await Blog.findOne({
      _id: { $lt: blog._id }
    }).sort({ _id: -1 })

    const next = await Blog.findOne({
      _id: { $gt: blog._id }
    }).sort({ _id: 1 })

    const blogjson = {
      _id: blog._id,
      tieude_blog: blog.tieude_blog,
      tieude_khongdau: blog.tieude_khongdau,
      img_blog: blog.img_blog,
      ngaydang: blog.ngaydang,
      noidung: blog.noidung,
      prev: prev
        ? {
            _id: prev._id,
            tieude_blog: prev.tieude_blog,
            tieude_khongdau: prev.tieude_khongdau
          }
        : {},
      next: next
        ? {
            _id: next._id,
            tieude_blog: next.tieude_blog,
            tieude_khongdau: next.tieude_khongdau
          }
        : {}
    }
    res.json(blogjson)
  } catch (error) {
    res.status(500).json({ message: error.message })
    console.log(error)
  }
})

module.exports = router
