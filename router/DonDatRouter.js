const express = require('express')
const router = express.Router()
const DonDat = require('../models/DonDatModel')
const moment = require('moment')

router.post('/postdatphong', async (req, res) => {
  try {
    const { ngaynhanphong, ngaytraphong, thucdon, phone } = req.body
    const dondat = new DonDat({
      ngaynhanphong,
      ngaytraphong,
      thucdon,
      phone
    })
    await dondat.save()
    res.json(dondat)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.get('/getdatphong', async (req, res) => {
  try {
    const dondat = await DonDat.find().lean()
    const dondatjson = dondat.map(dd => {
      return {
        _id: dd._id,
        ngaynhanphong: moment(dd.ngaynhanphong).format('DD/MM/YYYY'),
        ngaytraphong: moment(dd.ngaytraphong).format('DD/MM/YYYY'),
        thucdon: dd.thucdon,
        phone: dd.phone
      }
    })
    res.json(dondatjson)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})


module.exports = router
