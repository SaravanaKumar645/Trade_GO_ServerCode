const express=require('express')
const router=express.Router()
const actions = require('../methods/actions')
const method=actions.functions
const upload=actions.upload
router.get('/',(req,res)=>{
    res.send('Welcome to Trade GO')
}) 
//@desc Adding new user
//@route POST /adduser
router.post('/register', method.addNew)

//@desc Authenticate a user
//@route POST /authenticate
router.post('/login', method.authenticate)

//@desc Get info on a user
//@route GET /getinfo
router.get('/getinfo', method.getinfo)

//@desc Upload Product images and details to the server of a single user with user_id.
//@route POST/upload-products
router.post('/upload-products',upload.array('p_image'),method.uploadImagesofProducts)

//@desc Retrieving user products from the server
//@route GET/get-user-products
router.get('/get-user-products',method.getUserProducts)

//@desc Retrieving all products from the server
//@route GET/get-all-products
router.get('/get-all-products',method.getAllProducts)


module.exports=router