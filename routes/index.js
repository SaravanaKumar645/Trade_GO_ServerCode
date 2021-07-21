const express=require('express')
const router=express.Router()
const actions = require('../methods/actions')
const method=actions.functions
const upload=actions.upload
const up=actions.uploadDumm
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

//@desc Upload Product images and details to the server of a single user with user_id.
//@route POST/upload-products
//  !!!!!for demo purpose . Not used in Final deploy!!!!!
router.post('/upload',up.single('hi'),method.uploadDummy)

//@desc Find a product by its id and update its stock count
//@route PATCH/update-product-stock
router.patch('/update-product-stock',method.updateProduct_Stock)

//@desc Find a product by its id and delete it permanently
//@route DELETE/delete-product
router.delete('/delete-product',method.deleteProduct)

module.exports=router