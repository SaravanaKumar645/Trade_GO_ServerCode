var mongoose=require('mongoose')

const imgSchema=new mongoose.Schema({
    p_image:{type:String,require:true},
    p_name:{type:String,require:true},
    p_price:{type:String,require:true},
    p_stock:{type:String,require:true},
    p_description:{type:String,require:true},
    p_category:{type:String,require:true}
},{timestamps:true},{collection:'products'})

module.exports=mongoose.model('ProductImage',imgSchema)