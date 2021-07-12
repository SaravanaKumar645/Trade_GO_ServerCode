const express=require('express')
const router=express.Router()
const actions = require('../methods/actions')

router.get('/',(req,res)=>{
    res.send('Welcome to Trade GO')
}) 
//@desc Adding new user
//@route POST /adduser
router.post('/register', actions.addNew)

//@desc Authenticate a user
//@route POST /authenticate
router.post('/login', actions.authenticate)

//@desc Get info on a user
//@route GET /getinfo
router.get('/getinfo', actions.getinfo)

//@desc Upload Product images to the server
//@route POST/upload-products
router.post('/upload-products',(req,res)=>{
    res.send('hi')
})

//@desc Retrieving user products from the server
//@route GET/get-products
router.get('/get-products',actions.getUserProducts)

module.exports=router