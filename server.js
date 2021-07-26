const express=require('express')
const morgan=require('morgan')
const cors=require('cors')
const db=require('./config/db')
const passport=require('passport')
const route=require('./routes/index')
const connectDB=db.connectDB


console.log('hello')

connectDB();

const app=express()
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}

app.use(cors())
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(route) 
app.use('/uploads',express.static('./uploads'))
app.use(passport.initialize())
require('./config/passport')(passport)

const PORT=process.env.PORT||3123
app.listen(PORT,console.log(`Server running in ${process.env.NODE_ENV} mode on port : ${PORT}`))

