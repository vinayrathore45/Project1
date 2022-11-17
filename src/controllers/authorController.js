const AuthorModel = require("../models/authorModel");
const jwt = require("jsonwebtoken");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  if (typeof value != "string") return false;
  return true;
};


let regex = new RegExp(
    "([!#-'+/-9=?A-Z^-~-]+(.[!#-'+/-9=?A-Z^-~-]+)|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'+/-9=?A-Z^-~-]+(.[!#-'+/-9=?A-Z^-~-]+)|[[\t -Z^-~]*])"
  )

//--------------------------------------------------------CREATE AUTHOR API------------------------------------------------------------------------------------------------------//

const createAuthor = async function (req, res) {
  try {
    
    const { fname, lname, title, email, password } = req.body;
    if (Object.keys(req.body).length === 0) {
     return res
        .status(400)
        .send({ status: false, msg: "input field cannot be empty" }); //request body should not be empty validation.
    }

    if (!isValid(fname)) {
      return res
        .status(400)
        .send({
          status: false,
          msg: "First Name is  required and must be in String only",
        }); // fname key should be present in data.
    }

    if (!isValid(lname)) {
      return res
        .status(400)
        .send({
          status: false,
          msg: "Last Name is required  and must be in String only ",
        }); // lname key should be present in data.
    }

    if (!isValid(title)) {
      return res
        .status(400)
        .send({
          status: false,
          msg: "title is required and must be in String only",
        }); // title key should be present in data.
    }
    if (!["mr", "mrs", "miss"].includes(title)) {
      return res
        .status(400)
        .send({ status: false, msg: "title should have mr mrs miss" }); // validation for fixed enums.
    }

    if (!regex.test(email)||!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, msg: "enter a valid email id" }); // email id validation with @ and some fixed length of character.
    }
    let emailpresent = await AuthorModel.findOne({ email: email });
    if (emailpresent) {
      return res
        .status(409)
        .send({ status: false, msg: "email already registered" }); // email id validation for verifying that email is not repeated.
    }


    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, msg: "password must be present" }); //password key should be present in data
    }

    if (!/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)) return res.status(400).send({ status: false, message: "Please enter strong password of atleast 8 character, It should contain atleast One Capital letter , one lower case letter and special character ," })


    const createData = await AuthorModel.create(req.body);
   return res.status(201).send({ status: true, data: createData });
  } catch (err) {
    console.log("This is the error :", err.message);
   return res.status(500).send({ msg: "Error", error: err.message });
  }
};

//-------------------------------------------------------------------LOGIN USER API-----------------------------------------------------------------//

const login = async function (req, res) {
  try {
       const{email,password} = req.body;

    if (Object.keys(req.body).length === 0) {
    return res
        .status(400)
        .send({ status: false, msg: "input field cannot be empty" }); //request body should not be empty validation.
    }

    if (!regex.test(email)) {
      return res
        .status(400)
        .send({ status: false, msg: "enter a valid email id" }); // email id validation with @ and some fixed length of character.
    }

    if (!password) {
      return res
        .status(400)
        .send({ status: false, msg: "password must be present" }); //password key should be present in data
    }

    var loginUser = await AuthorModel.findOne({
      email: email,
      password: password,
    });
    //console.log(loginUser);
    if (!loginUser) {
      return res
        .status(404)
        .send({ status: false, msg: "login Credentials are wrong" }); //login email and password does not match validation.
    }
  } catch (err) {
    console.log("This is the error :", err.message);
    res.status(500).send({ msg: "Error", error: err.message });
  }

  let token = jwt.sign(
    {
      loginUser: loginUser._id,
    },
    "Project-1"
  );
  res.setHeader("x-api-key", token);
  res.status(201).send({ status: true, data: token }); //creating jwt after successful login by author
};

module.exports = {createAuthor,login}
