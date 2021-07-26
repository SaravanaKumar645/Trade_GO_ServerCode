var User = require('../models/user')
var bcrypt=require('bcrypt')
var Product=require('../models/productImage')
var Cart=require('../models/userCart')
var jwt = require('jwt-simple')
var config = require('../config/dbConfig')
const multer =require('multer')
const S3=require('aws-sdk/clients/s3')
const nodeMailer=require('nodemailer')
const crypto = require('crypto')
//nodemailer config 
const transporter=nodeMailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.MAIL_ID,
        pass:process.env.MAIL_PASS
    }
})
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

//AWS S3 
// Credentials initialization ---S3
const bucketName = process.env.AWS_BUCKET_NAME
const bucketregion = process.env.AWS_BUCKET_REGION
const bucketaccessKeyId = process.env.AWS_ACCESS_KEY
const bucketsecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
// object initialization ---S3
const s3Object=new S3({
    accessKeyId:bucketaccessKeyId,
    secretAccessKey:bucketsecretAccessKey,
    bucket:bucketName,
    region:bucketregion
 })

 //delete objects function ---S3
 function delete_S3_Objects(key1,key2,key3){
        var func_response
        var params={
            Bucket:bucketName,
            Delete:{
                Objects:[
                    {
                        Key:key1
                    },
                    {
                        Key:key2
                    },
                    {
                        Key:key3
                    }
                ]
            }
         }
         s3Object.deleteObjects(params,function(err,data){
            if(err){
                func_response=false
            }else{
                console.log(data)
                func_response=true
            }
         })
      return func_response
     
 }
 

//Functions for operations
var functions = {
    SignUp: async (req, res)=> {
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
                    newUser.save(async function (err, newUser) {
                        if (err) {
                            return res.status(408).send({success: false, msg: 'Failed to create User !. Try again'})
                        }
                        else {
                            var mailOpt={
                                from:'admin@tradego.com',
                                to:newUser.email,
                                subject:'Your Sign up was successful',
                                html:`<center>
                                <div class="emailbox" style="width: auto; padding: 40px; height: auto; border-radius: 10px; border: 3px outset rgb(36, 105, 253); display: list-item;">
                                <center>
                                <font face="Arial" color="#0099ff"><h1>TRADE GO</h1></font>
                                <font face="Comic sans MS"><p>Thanks for sign up !</p></font>
                                <i class="fa fa-thumbs-o-up" style="font-size:48px;color:#0099ff"></i>
                                </center>
                                <h3><left>Welcome <font color="#0099ff">${newUser.name}</font> ,</left></h3>
                                <p><center><h4>We are in a great pleasure of welcoming you on board !</h4></center></p>
                                <p class="content" style="font-weight: normal;"><b><font size="4px" color="#4964FB">       Trade GO</font></b>     gives users the opportunity to sell and buy products online.
                                    We are all about to making it easy for you to trade online. You can now interact with the users and trade goods all over the world. </p>
                                <center>
                                <div class="endgreet" style="width: auto; height: auto; margin-top: 45px; margin-bottom: 45px; letter-spacing: 1.5px; border-radius: 15px; border: 3px outset #0099ff; background-color: #0099ff; text-align: center; box-shadow: 5px 5px 10px 2px rgba(156, 154, 154, 0.932);">
                                    <p><b><font face="Arial" color="white">! HAPPY TRADING !</font></b></p>
                                </div>
                                <img src="https://trade-go.s3.ap-south-1.amazonaws.com/Adobe_Post_20210726_1855140.9031505963136341+(2).png" style="object-fit:contain;
                                            width:100px;
                                            height:100px;
                                            border: solid 1px #CCC">
                                </center>
                                </div>
                                </center> `  
                            }
                             transporter.sendMail(mailOpt,function(error,info){
                                if(err){
                                    console.log(error)
                                }else{
                                    console.log('sent :'+info)
                                }
                            })
                            var uid1=''+newUser._id 
                            var mail=''+newUser.email
                            var name=''+newUser.name
                            return res.status(200).send({success: true, msg: 'Successfully created user : '+mail,id:uid1,email:mail,name:name})
                          
                        }
                    })
                     
                }else {
                    
                     return res.status(405).send({success: false, msg: 'Sign In failed : User Aleady exists !'})
                }
            })
            
        }
    },

    SignIn: async (req, res)=> {
        console.log('in login')
        
       await User.findOne({
            email: req.body.email
        }, function (err, user) {
            
                if (err){
                   res.status(408)
                   return res.json({success: false, msg:'Authentication Failed. ERROR :'+err})}
                if (!user) {
                    res.status(405)
                    return res.json({success:false,msg:"User does not exist"})
                } else {
                    console.log(user)
                    user.comparePassword(req.body.password, function (err, isMatch) {
                        if (isMatch && !err) {
                            var uid1=''+user._id
                            var mail=''+user.email
                            var name=''+user.name
                            var token = jwt.encode(user, config.secret)
                            
                            console.log('in login success ! ID: '+uid1)
                            return res.status(200).send({success: true, msg:`Successful Login !  UserId : `+uid1,id:uid1,email:mail,name:name})
                             
                        }
                        else {
                            res.status(405)
                            return res.json({success: false, msg: 'Authentication failed, wrong password'})
                        }
                    })
                }
        }
        )
    },

    resetPassword:async function(req,res){
        var user_id=req.body.user_id
        var email=req.body.email
        var token=req.body.token_id
        try{
            const pass=req.body.n_password
          await User.findOne({resetToken:token,email:email,expireToken:{$gte:Date.now()}},async(err,user)=>{
              if(err){
                console.log(err)
                res.status(405)
                return res.send({success:false,msg:'Try again . Token Session Expired ! ERROR: '+err})
              }
             if(user==null){
                console.log(user)
                res.status(408)
                return res.send({success:false,msg:'Try again . Token Session Expired !'+user})
              }else{
                  var salt = await bcrypt.genSalt(10)
                  var hashedPassword= await bcrypt.hash(pass,salt)
                  console.log('Hashed Password:  '+hashedPassword)
                  await User.findOneAndUpdate({resetToken:token,email:email},{password:hashedPassword,expireToken:undefined,resetToken:undefined},{new:true},function(err,user){
                  if(err){
                    res.status(405)
                    return res.send({success:false,msg:'An error occurred .Try Again !. ERROR: '+err})
                  }
                  if(user==null){
                    console.log(user)
                    res.status(408)
                    return res.send({success:false,msg:'Try again . Token Session Expired !'+user})
                  }else{
                    console.log(user)
                    res.status(200)
                    return res.send({success:true,msg:'Password updated successfully .'})
                  }
                  
                  })
               } 
           })
        
        }catch(err){
            console.log(err)
            res.status(405)
            return res.send({success:false,msg:'Cannot Reset Password . ERROR: '+err})
        }
       
    },

    requestPasswordMail:async function(req,res){
        crypto.randomBytes(32,async (err,buffer)=>{
          if(err){
              console.log('Inside crypto block :'+err)
              res.status(405)
             return res.send({success:false,msg:'An error occured !. Try again ',token_id:"nil"})
          }else{
          const token = buffer.toString("hex")
          await User.findOne({email:req.body.email},function(err,user){
              if(err){
                console.log('Inside outer block :'+err)
                res.status(405)
                return res.send({success:false,msg:'Unexpected error . Try again !',token_id:"nil"})
              }
          
              if(user==null){
                  return res.status(408).send({success:false,msg:'User not exists !. Check the email and try again',token_id:"nil"})
              }else{
              user.resetToken = token
              user.expireToken = Date.now() + 1800000
              user.save(function(err,user){
                  if(err){
                    console.log('Inside catch nested block :'+err)
                    res.status(405)
                    return res.send({success:false,msg:'Unexpected error . Try again !',token_id:"nil"})
                  }else{
                  var resetLinkMail={
                      to:user.email,
                      from:"no-reply@tradego.com",
                      subject:"Password reset link -reg",
                      html:`
                                <center>
                                <div class="emailbox" style="width: auto; padding: 40px; height: auto; border-radius: 10px; border: 3px outset rgb(36, 105, 253); display: list-item;">
                                <center>
                                <font face="Arial" color="#0099ff"><h1>TRADE GO</h1></font>
                                </center>
                                <h3>Hi <font color="#0099ff">${user.name}</font> ,</h3>
                                <p><center><h4>All set ! You can now change your Password !</h4></center></p>
                                <p class="content" style="font-weight: normal;">
                                As we have received a request from you for changing the password , we are here below providing you with a <font color="#0099ff"><b>token</b></font> to reset your password. Enter it in the required field and click <font color="#4964FB"><b>Reset Password.</b></font><br> If you don't want to reset the password , kindly ignore this mail.
                                </p>
                                <p><b>NOTE: </b> This token will be valid only for the next <font size="4px" color="red"><b>30 minutes .</b></font></p>
                                <center>
                                <div class="endgreet" style="width: auto; height: auto; margin-top: 45px; margin-bottom: 45px; letter-spacing: 1.5px; border-radius: 15px;
                                padding:10px; border: 3px outset #000000; background-color: #ffffff; text-align: center; box-shadow: 5px 5px 10px 2px rgba(156, 154, 154, 0.932);">
                                    <p><h4>RESET  TOKEN :</h4></p>
                                    <p><font face="Arial" color="#0099ff">${token}</font></p>
                                 </div>
                                <img src="https://trade-go.s3.ap-south-1.amazonaws.com/Adobe_Post_20210726_1855140.9031505963136341+(2).png" style="object-fit:contain;
                                            width:100px;
                                            height:100px;
                                            border: solid 1px #CCC">
                                </center>
                                </div>
                                </center>
                                `
                  }
                  transporter.sendMail(resetLinkMail,function(error,info){
                      if(error){
                          res.status(408)
                          return res.send({success:false,msg:'Email not sent . Kindly try again !',token_id:"nil"})
                      }else{
                          console.log('Mail Sent : '+info)
                          res.status(200)
                         return res.send({success:true,msg:'Email sent !.Check your mail. Sometimes the mail will be in SPAM folder.',token_id:token})
                      }
                  })
                }
              })
            }
          })
        }
      })
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

    getUserProducts:async(req,res)=>{
       await Product.find({
          user_id:req.body.user_id
       })
        .exec()
        .then(files=>{
            const count=files.length
            const response={
                products:files.map(doc=>{
                    return{
                        name:doc.p_name,
                        desc:doc.p_description,
                        category:doc.p_category,
                        price:doc.p_price,
                        stock:doc.p_stock,
                        p_id:doc._id,
                        user_id:doc.user_id,
                        product_key_1:doc.image_key_1,
                         product_key_2:doc.image_key_2,
                         product_key_3:doc.image_key_3,
                         product_url_1:doc.image_url_1,
                         product_url_2:doc.image_url_2,
                         product_url_3:doc.image_url_3
                    }
                })
            }
           res.status(200)
           return res.json({success:false,msg:count+" products found .",data:JSON.stringify(response)})
        }).catch(err=>{
            console.log(err)
            res.status(408)
            res.json({success:false,msg:"Error getting products . Close the application and try again !"+err,data:null})
        })
    },

    uploadProductDetails:async(req,res)=>{
        var ResponseData=[]
        var product_location=[]
        var product_key=[]
        
        var flag=0
        const p_image=req.files
        await p_image.map((item)=>{
            var params={
                Bucket:bucketName,
                Key:item.originalname,
                Body:item.buffer
            }
              s3Object.upload(params,function(err,data){ 
                if(err){
                    res.status(408)
                    res.json({success:"false", msg:"Network Interrupted . Try Again !"+err})
                }
                    flag++
                    console.log(data)
                    ResponseData.push(data)
                    product_location.push(data.Location)
                    product_key.push(data.Key)
                    
                    
                    if(flag==p_image.length){
                        const newProduct=new Product({
                            user_id:req.body.user_id,
                            p_name:req.body.p_name,
                            p_price:req.body.p_price,
                            p_stock:req.body.p_stock,
                            p_description:req.body.p_description,
                            p_category:req.body.p_category,
                            image_key_1:product_key[0],
                            image_key_2:product_key[1],
                            image_key_3:product_key[2],
                            image_url_1:product_location[0],
                            image_url_2:product_location[1],
                            image_url_3:product_location[2]
    
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
                         user_id:doc.user_id,
                         product_key_1:doc.image_key_1,
                         product_key_2:doc.image_key_2,
                         product_key_3:doc.image_key_3,
                         product_url_1:doc.image_url_1,
                         product_url_2:doc.image_url_2,
                         product_url_3:doc.image_url_3
    
                     }
                 })
             }
             res.status(200)
            return res.json({success:true,msg:response.count+"  products found .",data:response})
         }).catch(err=>{
             console.log(err)
             res.status(408)
             res.json({success:false,msg:"Error getting products . Close the application and try again !"+err,data:null})
         })
    },

    updateProduct_Stock:async(req,res,next)=>{
        const update=req.body.p_stock
        const id=req.body.p_id
        await Product.findByIdAndUpdate(id,{p_stock: update},{new:true},function(err,file){
            if(err){
                console.log(err)
                res.status(408)
                return res.send({success:false,msg:'Cannot update stock ! ERROR:'+err,currentStock:"null"})
            }
            if(file==null){
                console.log(file)
                res.status(405)
                res.send({success:false,msg:'No Product Found .',currentStock:"null"})
            
            }else{
                console.log(file)
                res.status(200)
                const response={p_id:file._id,product:file}
                res.send({success:true,msg:'Product Stock updated .',currentStock:JSON.stringify(response)})
            
            }
    
        })
            
    },

    deleteProduct:async(req,res)=>{
        try{
            var object_keys=[]
            await Product.findById(req.body.p_id,async function(err,product){
                if(err){
                    res.status(408)
                    return res.send({success:false,msg:'Unexpected error ! ERROR:'+err})
                }
                if(product==null){
                  res.status(405)
                  res.send({success:false,msg:'No Product Found .'})
                }else{
                  console.log(product)
                  
                  object_keys.push(product.image_key_1)
                  object_keys.push(product.image_key_2)
                  object_keys.push(product.image_key_3)
                  var delete_response=delete_S3_Objects(object_keys[0],object_keys[1],object_keys[2])
                  console.log("RESPONSE : "+delete_response)
                  if(delete_response==false){
                    res.status(408)
                    return res.send({success:false,msg:'Cannot delete product . Try again !'})
                  }else{
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
                  }
                  
                }
            })
             
            
        }catch(err){
            res.status(405)
            res.send({success:false,msg:'Unexpected error ! ERROR: '+err})
        }
        
    },

    addTo_Cart:async(req,res)=>{
        try{
           
           const uid=req.body.user_id
           const pid=req.body.p_id
          
           await Product.findOne({_id:pid,user_id:uid},async function(err,product){
               if(err){
                console.log(err)
                res.status(405)
                return res.send({success:false,msg:'Cannot add to cart . ERROR: '+err,productDetails:null})
               }
               if(product==null){
                console.log(product)
                res.status(408)
                return res.send({success:false,msg:'No Product found .Try login again!',productDetails:null})
               }else{
                console.log(product)
                const newcartItem= Cart({
                    _id:product._id,
                    user_id:product.user_id,
                    p_name:product.p_name,
                    p_price:product.p_price,
                    p_stock:product.p_stock,
                    p_description:product.p_description,
                    p_category:product.p_category,
                    image_key_1:product.image_key_1,
                    image_key_2:product.image_key_2,
                    image_key_3:product.image_key_3,
                    image_url_1:product.image_url_1,
                    image_url_2:product.image_url_2,
                    image_url_3:product.image_url_3
                })
               await newcartItem
                          .save()
                          .then(cartfile=>{
                              
                              console.log(cartfile)
                              res.status(200)
                              return res.json({success:true,msg:"Product Added to cart !",productDetails:cartfile})
                          })
                          .catch(err=>{
                            console.log(err)
                            res.status(405)
                            return res.json({success:false,msg:"An error occured. Try again !ERROR: "+err})
                          })
                
               }
           })

        }catch(err){
            console.log(err)
            res.status(405)
            return res.send({success:false,msg:'Cannot add to cart . ERROR: '+err,productDetails:null})
        }
    },
   
//...............below these are for demo purpose........
     uploadDummy:function(req,res,err){
         
         if(req.file){
         console.log(req.file)
         console.log(req.body.name)
         console.log(req.body.price)
         
         res.status(200)
         res.send({success:true,msg:"Hi"+req.file.path,pid:"200"})
         }else{
            res.status(405)
            return res.send({success:true,msg:"Hi ! Failed "+err,pid:"400"})
         }
         
    }
}


module.exports ={functions,
upload,uploadDumm}
