const formidable = require("formidable");
const post = require("../models/postModel");

/**
 * postController.js
 * @desc Export functions that handles req/res logic for posts 
 */ 

// Create Post
exports.createPost = (req, res) => {
  const form = formidable();
  form.parse(req, async (formErr, fields) => {
    if(formErr) {
      console.err(formErr);
      return;
    }
    
    try {
      const newPost = new post({
        title: `${ fields.title }`,
        user_id: req.username,
        content: `${ fields.content }`,
        caption: `${ fields.caption }`,
      });

      await newPost.save();
      
    } catch(err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
  // 201 status code created
  res.status(201).send("Post created");
}

// Get Post 
exports.getPost = async (req, res) => {
    try{
        const currPost = await post.findById(req.params.id);
        res.json({ currPost });
    }catch(err){
        console.error(err);
        res.sendStatus(404);
    } finally{
        console.log("found");
    }
}

// Get All Recent Post
exports.getAllPost = async (req, res) => {
  const posts = await post.find();
  res.json({ posts });
}

// Update a part of the Post
exports.updatePost = async (req, res) => {
  const form = formidable();
  form.parse(req, async (formErr, fields) => {
    if(formErr) {
      console.err(formErr);
      return;
    }
    
    try {
      // Maybe check if document exists? Or verify post is actually updated
        post.findByIdAndUpdate(req.params.id, {
            title: `${ fields.title }`,
            content: `${ fields.content }`,
            caption: `${ fields.caption }`,
        }, (err, result) => {
            // Needs callback to execute 
            console.log(result);
        });

        res.status(201).send("Post updated");
        console.log("Post updated with id:" + " " + req.params.id);
      
    } catch(err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
}

// Delete Post
exports.deletePost = async (req, res) => {
    try{
        // need to check if post was actually found
        await post.findByIdAndDelete(req.params.id);
        res.status(200).send("Post deleted");
    }catch(err){
        console.error(err);
        res.status(404).send("Error with deleting post");
    } }

// Upvote Post
exports.upvote = async (req, res) => {
    try{
        post.findOne({
            _id: req.params.id
        }, async (err, result) => {
            if(err){
                console.error(err);
            }

            let voters = result.meta.upvotes.voters;
            let foundUser = 0;
            for(voter in voters){
                if(voters[voter] == req.username){
                    foundUser = 1;
                }
            }
            
            if(foundUser){
                result.meta.upvotes.votes -= 1;
                result.meta.upvotes.voters.pull(req.username);
            }
            else{
                result.meta.upvotes.votes += 1;
                result.meta.upvotes.voters.push(req.username);
            }

            await result.save();
            res.status(200).send("Post upvotes updated");
        });
    } catch(err){
        console.error(err);
        res.status(404).send("Error with post upvote");
    } 
}
