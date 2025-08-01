const express = require('express');
const Blog = require('../models/blog')
const path = require('path');
const multer = require('multer');
const Comment = require('../models/comment');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads`));
    },
    filename: function (req, file, cb) {
      const filename = `${Date.now()} - ${file.originalname}`;
      cb(null, filename); //cb means callback
    }
  })
  
const upload = multer({ storage: storage }) 


const router = express.Router();

router.get('/add-new', (req,res) => {
    return res.render('addblog',{
        user: req.user,
    });
});

router.get('/:id', async (req,res)=> {
   const blog = await Blog.findById(req.params.id).populate('createdBy');
   const comments = await Comment.find({ blogId : req.params.id}).populate('createdBy')
   return res.render('blog', {
    user: req.user,
    blog,
    comments,
   });
});

router.post('/', upload.single('coverImage'), async (req,res) => {
    // console.log(req.body);
    // console.log(req.file); 
    const { title,body } = req.body
    const blog = await Blog.create({
        body,
        title,
        createdBy: req.user._id,
        coverImageURL: `uploads/${req.file.filename}`
    });  
    return res.redirect(`/blog/${blog._id}`);
});

router.post('/comment/:blogId', async (req,res) => {
  if (!req.user) {
    return res.redirect('/user/signin');
  }

  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});


module.exports = router;