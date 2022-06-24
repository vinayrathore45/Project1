const AuthorModel = require('../models/authorModel')
const jwt = require('jsonwebtoken')

//--------------------------------------------------------CREATE AUTHOR API------------------------------------------------------------------------------------------------------//


const createAuthor = async function(req,res){
    try{
        let data = req.body

    if ( Object.keys(data).length == 0) {
        res.status(400).send({ msg: "cant be empty object" })
       }

    let regex = new RegExp("([!#-'+/-9=?A-Z^-~-]+(\.[!#-'+/-9=?A-Z^-~-]+)|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'+/-9=?A-Z^-~-]+(\.[!#-'+/-9=?A-Z^-~-]+)|\[[\t -Z^-~]*])");
    let testmails=data.email
    let emailvalidation= regex.test(testmails)
    if(!emailvalidation){
        return res.status(400).send({status:false,msg: "enter a valid email id"})
    }
    
    const createData = await AuthorModel.create(data)
    res.status(201).send({msg:createData})
}
catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
}
}

//-------------------------------------------------------------------LOGIN USER API-----------------------------------------------------------------//


const login = async function(req,res){
    try{
    let data=req.body
    let email = data.email
    let password = data.password
    if ( Object.keys(data).length == 0) {
        res.status(400).send({ msg: "cant be empty object" })
       }
    var loginUser = await AuthorModel.findOne({email:email,password:password})
    console.log(loginUser)
    if(!loginUser){
        res.status(400).send({status:false,msg:"login Credentials are wrong"})
    }
}
catch (err) {
    console.log("This is the error :", err.message)
    res.status(500).send({ msg: "Error", error: err.message })
}

    let token = jwt.sign(
        {
            loginUser:loginUser._id.toString(),
            batch:"radon",
            organisation:"functionUp"
        },"Project-1"
        )
        res.setHeader("x-api-key",token)
        res.status(201).send({status:true,msg:token})

  }

module.exports.createAuthor = createAuthor
module.exports.login = login
