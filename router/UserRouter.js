const express = require('express')
const router = express.Router()
const User = require('../models/UserModel')
const bcrypt = require('bcryptjs')

router.post('/register', async (req, res) => {
  try {
    const { username, password , phone} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      username,
      password: hashedPassword,
      phone
    })

    await user.save()

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: `Đã xảy ra lỗi: ${error}` })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.json({ error: 'Tài khoản không tồn tại' })
    }
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.json({ error: 'Sai mật khẩu vui lòng thử lại' })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: `Đã xảy ra lỗi: ${error}` })
  }
})

module.exports = router
