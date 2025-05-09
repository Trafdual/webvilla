const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const methodOverride = require('method-override')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const sanphamrouter = require('./router/SanPhamRouter')
const chitietsanphamrouter = require('./router/ChiTietSanPhamRouter')
const danhgiarouter = require('./router/DanhGiaRouter')
const blogrouter = require('./router/BlogRouter')
const userrouter = require('./router/UserRouter')
const passport = require('passport')
var path = require('path')

const port = process.env.PORT || 8080

var app = express()
app.use(methodOverride('_method'))

const uri =
  'mongodb+srv://webnhansu123:webnhansu123@cluster0.rxpru.mongodb.net/webvilla?retryWrites=true&w=majority'

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(console.log('kết nối thành công'))

const mongoStoreOptions = {
  mongooseConnection: mongoose.connection,
  mongoUrl: uri,
  collection: 'sessions'
}

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '/public')))
app.use(express.static(path.join(__dirname, '/uploads')))
app.use(express.static(path.join(__dirname, '/images')))

app.use(
  session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create(mongoStoreOptions),
    cookie: {
      secure: false
    }
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(cors())

app.use('/', blogrouter)
app.use('/', userrouter)
app.use('/', sanphamrouter)
app.use('/', chitietsanphamrouter)
app.use('/', danhgiarouter)

app.listen(port, () => {
  try {
    console.log('kết nối thành công 8080')
  } catch (error) {
    console.log('kết nối thất bại 8080', error)
  }
})
