const mongoose = require('mongoose')
const BlogModel = require('../models/blogModel')
const AuthorModel=require('../models/authorModel')



const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value != "string") return false;
  return true;
}; 



//-----------------------------------------------------------------CREATE BLOG API-------------------------------------------------------------//


const createBlog = async function (req, res) {
  try {
    const{title,body,authorId,tags,category,subCategory,} = req.body
    if (Object.keys(req.body).length === 0) {
      res.status(400).send({ msg: "cant be empty object" })  //request body should not be empty validation.
    }
    
    if(!isValid(title)){
    return res.status(400).send({status:false,msg:"title is required and must be in String only"}) // title key should be present in data.
   }
   
    
    if(!isValid(body)){
    return res.status(400).send({status:false,msg:"body is required and must be in String only"}) // body key should be present in data.
   }

    
    if (!isValid(authorId)) {
      res.status(400).send({ status: false, msg: "authorid is required" }) //authorid key validation in data.
    }
    if (!mongoose.isValidObjectId(authorId)) return res.status(400).send({ msg: "inavalid id format" });

    let author = await AuthorModel.findById(authorId)
    if(!author){
      return res.status(404).send({status:false,msg:"Author not found"}) //author validation by searching in db or wrong author Id.
    }

    if(authorId!==req.authorId){
      return res.status(403).send({status:false,msg:"author loggedIn is not allowed to create other authors blog."}) //Authorization of author
    }
    
    if(!isValid(category)){
    return res.status(400).send({status:false,msg:"category is required and must in String"}) // category key should be present in data.
   }
    
   
  if(tags){
   if(typeof tags!="object"||!tags.length){
    return res.status(400).send({status:false,msg:"tags must be a Array of Strings"}) //tags key should be in object only.
   }
   for (let i=0;i<tags.length;i++){
    if (!isValid(tags[i]))
      return res.status(400).send({status:false,msg:"tags should not have Extra space and must be a string"}) // validation if extra spaces around tags is given by frontend.
   }
  }
   
  // console.log(results)
   if(subCategory){
  if(typeof subCategory!="object"||!subCategory.length){
    return res.status(400).send({status:false,msg:"subCategory must be array"}) //subCategory key should be in object only.
   }
   for (let i=0;i<subCategory.length;i++){
    if (!isValid(subCategory[i]))
      return res.status(400).send({status:false,msg:"tags should not have Extra space and must be a string"})// validation if extra spaces around subCategory is given by frontend.
   }
  }
   
  //  console.log(result)
   

    const createData = await BlogModel.create(req.body)
    res.status(201).send({ status:true,msg: createData })
  }
  catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
  }
}


//------------------------------------------------------------CREATE BLOG API-------------------------------------------------------------------------------------------------//



const getblogs = async function (req, res) {
  try {
    let query = req.query
    console.log(query)
    const getblog = await BlogModel.find({ $and: [{ isDeleted: false }, query] })

    if (getblog.length === 0) {
      return res.status(404).send({ status: false, msg: "no author found" }) // if we are getting empty array 
    }
    res.status(200).send({ status: true, data: getblog })

  }
  catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
  }

}



//--------------------------------------------------------------UPDATE BLOG API---------------------------------------------------------------------------//



const updateBlog = async function (req, res) {
  try {
     const{tags,subCategory,title,body} = req.body;
     let blogId = req.params._id
    if (Object.keys(req.body).length === 0) {
      res.status(400).send({status:false, msg: "input field cannot be empty" }) // data cannot be empty in body
    }
    // naming validation according to characters and length by regex


    if((tags && !isValid(tags))){
      return res.status(400).send({status:false, msg: "tags should be in valid format"}) 
    }
    if(subCategory && !isValid(subCategory)){
      return res.status(400).send({status:false, msg: "subCategory should be in valid format"})
    }
    if(title && !isValid(title)){
      return res.status(400).send({status:false, msg: "title should be in valid format"})
    }
    if(body && !isValid(body)){
      return res.status(400).send({status:false, msg: "body should be in valid format"})
    }

    const checkBlog = await BlogModel.find({ _id: blogId,isDeleted:false })
    if (checkBlog.length === 0) return res.status(404).send({ status: false, msg: "Blog Not Found" }) // if we get empty array

    else {
      const updatedBlog = await BlogModel.findOneAndUpdate({ _id: blogId }, { title: title, body: body, isPublished: true, publishedAt: new Date()},{ new: true },)
      if (subCategory){
        updatedBlog.subCategory.push(subCategory)
      }
      if (tags){
        updatedBlog.tags.push(tags)
      }
      updatedBlog.save()          // update in db after pushing the tags and subCategory, because we are using push out of db query.
      res.status(200).send({ msg: true, data: updatedBlog })
    
    }
  }
  catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ error: err.message })

  }
}





// -----------------------------------------------DELETE BLOG BY PATH PARAMS----------------------------------------------------------------//


const deleteblog1 = async function (req, res) {
  try {
    let blogId = req.params._id
    let findblog= await BlogModel.findById({ _id: blogId })
    if(findblog.isDeleted==true){
      return res.status(400).send({status:false,msg:"Document is Already Deleted"})
    }
    let updatedblog = await BlogModel.findByIdAndUpdate({ _id: blogId }, { isDeleted: true, deletedAt: new Date() }, { new: true });
    res.status(200).send({ status:true, data: updatedblog });
  console.log(updatedblog)
  }
  catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
  }
}

  

//-----------------------------------------------------------DELETE BLOG BY QUERY PARAMS--------------------------------------------------------------------------------//




const deleteblog2 = async function (req, res) {
  try {
    let authIdtoken = req.authorId
    let query = req.query
    let getdata =await BlogModel.findOne(query) //first filter conditions according to query.
    if(!getdata){
      return res.status(404).send({status:false,msg:"no such blog exist"}) // if no such conditions much validation for empty array
    }
    console.log(getdata)
    if(getdata.isDeleted==true){
      return res.status(400).send({status:false,msg:"we cannot update deleted blog"}) // if conditions mach and blog deleted,validation.
    }

    let updatedBlog = await BlogModel.updateMany({$and:[{authorId:authIdtoken},query]},{$set:{isDeleted:true,deletedAt:new Date()}},{new:true})

    res.status(200).send({ status: true, data: updatedBlog,msg:"blog deleted"});
  }
  catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
  }
}


module.exports = {createBlog,deleteblog1,deleteblog2,getblogs,updateBlog}

