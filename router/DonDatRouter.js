const express = require('express')
const router = express.Router()
const DonDat = require('../models/DonDatModel')

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

router.get('/getdatphong',async(req,res)=>{
    try {
        
    } catch (error) {
        
    }
})

module.exports = router
