var User = require('../models/user')
var Product=require('../models/productImage')
var jwt = require('jwt-simple')
var config = require('../config/dbConfig')
const multer =require('multer')
const S3=require('aws-sdk/clients/s3')

//Multer initialize
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'uploads/')
    },
    filename:function(req,file,cb){
        cb(null,new Date().toISOString().replace(/:/g,'-')+file.originalname)
    }
})
const st=multer.memoryStorage({
    destination:function(req,file,cb){
        cb(null,'')
    }
})
const upload=multer({
    storage:st
 
})
const uploadDumm=multer({
    storage:storage
 
})

//AWS credentials initialization
const bucketName = process.env.AWS_BUCKET_NAME
const bucketregion = process.env.AWS_BUCKET_REGION
const bucketaccessKeyId = process.env.AWS_ACCESS_KEY
const bucketsecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

//Functions for operations
var functions = {
    addNew: async (req, res)=> {
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
           await  User.findOne({
               email:req.body.email
            }).countDocuments(function(err,num){
                if(num==0){
                    newUser.save(function (err, newUser) {
                        if (err) {
                            return res.status(408).send({success: false, msg: 'Failed to create User !. Try again'})
                        }
                        else {
                            var uid1=''+newUser._id 
                            return res.status(200).send({success: true, msg: 'Successfully created : ' +newUser.email+'  user',id:uid1})
                          
                        }
                    })
                     
                }else {
                    
                     return res.status(403).send({success: false, msg: 'Sign In failed : User Aleady exists !'})
                }
            })
            
        }
    },

    authenticate: async (req, res)=> {
        console.log('in login')
        
       await User.findOne({
            email: req.body.email
        }, function (err, user) {
            
                if (err){
                   res.status(408)
                   return res.json({success: false, msg:'Authentication Failed. ERROR :'+err})}
                if (!user) {
                    res.status(403)
                    return res.json({success:false,msg:"User does not exist"})
                } else {
                    user.comparePassword(req.body.password, function (err, isMatch) {
                        if (isMatch && !err) {
                            var uid1=''+user._id
                            var token = jwt.encode(user, config.secret)
                            
                            console.log('in login success ! ID: '+uid1)
                             return res.status(200).send({success: true, msg:`Successful Login !  UserId : `+uid1,id:uid1})
                             
                        }
                        else {
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
       
      const newProduct=new Product({
       
        p_name:req.body.p_name,
        p_price:req.body.p_price,
        p_stock:req.body.p_stock,
        p_description:req.body.p_description,
        p_category:req.body.p_category,
      })
      /*if(req.files){
          let path=''
          req.files.forEach(file => {
              path=path+file.path+','
          });
          newProduct.p_image=path.substring(0,path.lastIndexOf(','))
      }*/
      newProduct
      .save()
      .then(response=>{
          
          console.log(res)
          return res.json({success:true,msg:"Product Added Successfully !",pid:res._id})
      })
      .catch(err=>{
        console.log(err)
        return res.json({success:false,msg:"An error occured. Try again !"+err})
      })
    },

    getUserProducts:async(req,res)=>{
       await Product.find({
          user_id:req.body.user_id
       })
        .exec()
        .then(files=>{
            const response={
                count:files.length,
                products:files.map(doc=>{
                    return{
                        name:doc.p_name,
                        desc:doc.p_description,
                        category:doc.p_category,
                        price:doc.p_price,
                        stock:doc.p_stock,
                        p_id:doc._id,
                        user_id:doc.user_id,
                        urls:doc.p_image_urls,
                        
                    }
                })
            }
            res.status(200)
           return res.json({success:false,msg:response.count+" products found .",data:response})
        }).catch(err=>{
            console.log(err)
            res.status(408)
            res.json({success:false,msg:"Error getting products . Close the application and try again !"+err,data:null})
        })
    },

    uploadImagesofProducts:async(req,res)=>{
        var ResponseData=[]
        var paths=""
        var flag=0
        const p_image=req.files
        const s3=new S3({
           accessKeyId:bucketaccessKeyId,
           secretAccessKey:bucketsecretAccessKey,
           bucket:bucketName
        })
       await p_image.map((item)=>{
            var params={
                Bucket:bucketName,
                Key:item.originalname,
                Body:item.buffer
            }
              s3.upload(params,function(err,data){ 
                if(err){
                    res.status(408)
                    res.json({success:"false", msg:"Network Interrupted . Try Again !"+err})
                }
                    flag++
                    console.log(data)
                    ResponseData.push(data)
                    paths+=data.Location+","
                    
                    if(flag==p_image.length){
                        const newProduct=new Product({
                            user_id:req.body.user_id,
                            p_name:req.body.p_name,
                            p_price:req.body.p_price,
                            p_stock:req.body.p_stock,
                            p_description:req.body.p_description,
                            p_category:req.body.p_category,
                            p_image_urls:paths.substring(0,paths.length-1)
                          })
                          newProduct
                          .save()
                          .then(response=>{
                              
                              console.log(res)
                              res.status(200)
                              return res.json({success:true,msg:"Product Added Successfully !",pid:res._id})
                          })
                          .catch(err=>{
                            console.log(err)
                            res.status(408)
                            return res.json({success:false,msg:"An error adding details. Try again !"+err})
                          })
                        //res.json({success:"true", msg:"Files uploaded:",path:""+paths.substring(0,paths.length-1)})
                    }
                
                
               
            })
           
        })
    },

    getAllProducts:async(req,res)=>{
        await Product.find()
         .exec()
         .then(files=>{
             const response={
                 count:files.length,
                 products:files.map(doc=>{
                     return{
                         name:doc.p_name,
                         desc:doc.p_description,
                         category:doc.p_category,
                         price:doc.p_price,
                         stock:doc.p_stock,
                         p_id:doc._id,
                         urls:doc.p_image_urls,
                         user_id:doc.user_id,
                     }
                 })
             }
             res.status(200)
            return res.json({success:false,msg:response.count+"  products found .",data:response})
         }).catch(err=>{
             console.log(err)
             res.status(408)
             res.json({success:false,msg:"Error getting products . Close the application and try again !"+err,data:null})
         })
    },

    updateProduct_Stock:async(req,res,next)=>{
       /* try{
            const id=req.params.id
            const stock='3422'
            const options={new:true}

            const result=await Product.findByIdAndUpdate(id,stock,options)
            res.send(result)
        }catch(error){
            console.log(error.msg)
            res.send(error)
        }*/
        const update=req.body.p_stock
        const id=req.body.p_id
        await Product.findByIdAndUpdate(id,{p_stock: update},{new:true},function(err,file){
            if(err){
                console.log(err)
                res.status(408)
                return res.send({success:false,msg:'Cannot update stock ! ERROR:'+err,currentStock:null})
            }
            if(file==null){
                console.log(file)
                res.status(403)
                res.send({success:false,msg:'No Product Found .',currentStock:null})
            
            }else{
                console.log(file)
                res.status(200)
                const response={p_id:file._id,product:file}
                res.send({success:true,msg:'Product Stock updated .',currentStock:response})
            
            }
    
        })
            
    },

    deleteProduct:async(req,res)=>{
        try{
            await Product.findByIdAndDelete(req.body.p_id,function(err){
                if(err){
                    console.log(err)
                    res.status(408)
                   return res.send({success:false,msg:'Cannot delete product . Try again !'})
                }else{
                    //console.log(res)
                    res.status(200)
                    res.send({success:true,msg:'Product successfully deleted .'})
                } 
            })
        }catch(err){
            res.status(403)
            res.send({success:false,msg:'Unexpected error ! ERROR: '+err})
        }
        
    },

     uploadDummy:function(req,res,err){
         
         if(req.file){
         console.log(req.file)
         console.log(req.body.name)
         console.log(req.body.price)
         
         res.status(200)
         res.send({success:true,msg:"Hi"+req.file.path,pid:"200"})
         }else{
            res.status(403)
            return res.send({success:true,msg:"Hi ! Failed "+err,pid:"400"})
         }
         
    }
}

module.exports ={functions,
upload,uploadDumm}
