const express = require('express');
const router = express.Router();
const {createAuthor,login} = require("../controllers/authorController")
const {createBlog,deleteblog1,deleteblog2,getblogs,updateBlog} = require("../controllers/blogController")
const {authentication,Authorization} = require('../middleWares/middleWare')

router.post('/authors',createAuthor)
router.post('/blogs',authentication,Authorization,createBlog)
router.delete('/blogs/:_id',authentication, Authorization,deleteblog1)
router.delete('/blogs?',authentication, Authorization,deleteblog2)
router.get('/blogs',authentication,getblogs)
router.put('/blogs/:_id',authentication, Authorization,updateBlog)
router.post('/login',login)


module.exports = router;
