var User = require('../models/user')
var Product=require('../models/productImage')
var jwt = require('jwt-simple')
var config = require('../config/dbConfig')
const multer =require('multer')

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads')
    },
    filename:function(req,file,cb){
        cb(null,new Date().toISOString().replace(/:/g,'-')+file.originalname)
    }
})

var functions = {
    addNew: function (req, res) {
        if ((!req.body.email) || (!req.body.password)||(!req.body.phone)||(!req.body.name)) {
             res.json({success: false, msg: 'Enter all fields'})
            //process.exit(1)
            
        }
        else {
            var newUser = User({
                name: req.body.name,
                email:req.body.email,
                password: req.body.password,
                phone:req.body.phone
            });
            User.findOne({
               email:req.body.email
            }).countDocuments(function(err,num){
                if(num==0){
                    newUser.save(function (err, newUser) {
                        if (err) {
                            return res.status(408).send({success: false, msg: 'Failed to create User !. Try again'})
                            
                            //res.json({success:false,msg:'Failed to save. Try Again !'})
                        }
                        else {
                            var uid1=''+newUser._id 
                            return res.status(200).send({success: true, msg: 'Successfully created : ' +newUser.email+'  user',id:uid1})
                           // res.json({success:true,msg:'Success ! Created : '+newUser.email+'  user'})
                        }
                    })
                     
                }else {
                    
                     return res.status(403).send({success: false, msg: 'Sign In failed : User Aleady exists !'})
                }
            })
            
        }
    },
    authenticate: function (req, res) {
        console.log('in login')
        
        User.findOne({
            email: req.body.email
        }, function (err, user) {
            
                if (err){
                   // res.json({success: false, msg: 'Authentication Failed. ERROR :'+err})
                   res.status(408)
                   return res.json({success: false, msg:'Authentication Failed. ERROR :'+err})}
                if (!user) {
                    // res.json({success: false, msg: 'Authentication Failed, User not found'})
                    // res.status(403).send({success: false, msg:'Authentication Failed, User not found'})
                    res.status(403)
                    return res.json({success:false,msg:"Checking text"})
                } else {
                    user.comparePassword(req.body.password, function (err, isMatch) {
                        if (isMatch && !err) {
                            var uid1=''+user._id
                            var token = jwt.encode(user, config.secret)
                             //res.json({success: true, msg: 'TOKEN : '+token})
                            console.log('in login success ! ID: '+uid1)
                             return res.status(200).send({success: true, msg:`Successful Login !  UserId : `+uid1,id:uid1})
                             
                        }
                        else {
                           // return res.status(403).send({success: false, msg: 'Authentication failed, wrong password'})

                            res.status(403)
                            return res.json({success: false, msg: 'Authentication failed, wrong password'})
                        }
                    })
                }
        }
        )
    },
    getinfo: function (req, res) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            var token = req.headers.authorization.split(' ')[1]
            var decodedtoken = jwt.decode(token, config.secret)
            return res.json({success: true, msg: 'Hello ' + decodedtoken.name})
        }
        else {
            return res.json({success: false, msg: 'No Headers'})
        }
    },

    uploadProducts:function(req,res){
       multer({
           storage:storage,
           limits:{fileSize:1024*1024*5}

      }).single('p_image')
      const newProduct=new Product({
        p_image:req.file.path,
        p_name:req.body.p_name,
        p_price:req.body.p_price,
        p_stock:req.body.p_stock,
        p_description:req.body.p_description,
        p_category:req.body.p_category,
      })
      newProduct
      .save()
      .then(res=>{
          console.log(res)
          res.status(201).json({success:true,msg:"Product Added Successfully !",pid:res._id})
      })
      .catch(err=>{
          console.log(err)
          res.status(500).json({success:false,msg:"An error occured. Try again !"+err})
      })
    },
    
    getUserProducts:function(req,res){
        Product.find({
            uid:req.body.uid
        })
        .exec()
        .then(files=>{
            const response={
                count:files.length,
                products:docs.map(doc=>{
                    return{
                        name:doc.p_name,
                        desc:doc.p_description,
                        category:doc.p_category,
                        price:doc.p_price,
                        stock:doc.p_stock,
                        p_id:doc._id,
                        image:doc.p_image,
                        request:{
                            type:"GET",url:""
                        }
                    }
                })
            }
            res.status(200).json(response)
        }).catch(err=>{
            console.log(err)
            res.status(500).json({success:false,msg:"Error :"+err})
        })
    }
}

module.exports = functions