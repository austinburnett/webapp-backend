const formidable = require("formidable");
const user = require("../models/userModel");
let jwt = require("jsonwebtoken");
//const randomBytes = require("node:crypto").randomBytes;

/**
 * userController.js
 * @desc Export functions that handles req/res logic for users
 * @TODO:
 * Secret for signing jwt
 */ 

/** 
 * loginForm
 * @desc Handles login for a user 
 * @response { Token } JWT on success   
 */
exports.loginForm = (req, res, next) => {    
  const form = formidable();
  form.parse(req, async (formErr, fields) => {
    if(formErr) {
      console.err(formErr);
      return;
    }
    
    try {
      const userFound = await user.findOne({email:`${ fields.email }`});

      if(!userFound) { 
        res.status(401).send("User not found");
      }

      else if(await user.authenticate(userFound.password, fields.pass)) {
        const token = jwt.sign({
          audience: `${ userFound._id }`,
          username: `${ userFound.username }`,
          issuer: "Instagram Clone",
        }, process.env.SECRET, {
          algorithm: "HS256",
          expiresIn: "1 hour",
        });
        res.json( { token } );
      }
      else {
        res.sendStatus(401);
      } 
    } catch(err) {
      console.error(err);
    }
  });
}

/**
 * registerForm
 * @desc Handles creating a new user. 
 */
exports.registerForm = (req, res, next) => {    
  const form = formidable();
  form.parse(req, async (formErr, fields) => {
    if(formErr) {
      console.err(formErr);
      return;
    }

    const emailInUse = await user.findOne({email: `${ fields.email }`});
    
    if(emailInUse) {
      res.send(`User found with the same email address: ${ emailInUse.email }`);
    }
    else {
      const hash = await user.argon2id(`${ fields.pass }`);
      const newUser = new user({ email:`${ fields.email }`, username: `${ fields.username }`, password:`${ hash }`});
      newUser.save();
      res.status(201).json("New User stored in db");
    }  
  });
}

/**
 * getUsers
 * @desc Retrieves all users stored in db
 */
exports.getUsers = async (req, res) => {
  const users = await user.find();
  res.status(201).json({ users });
}

// Get user by id
exports.getUser = async (req, res) => {
    try{
        const queryUser = await user.findById(req.params.id);
        if(queryUser == null){
            throw new Error("Check user id ", req.params.id);
        }
        res.status(201).json({ queryUser });
    }catch(error){
        console.error(error);
        res.status(404).json("Error with getting user");
    }
}

/**
 * updateUser
 * @desc Updates all user data except password
 * @TODO: 
 * Enable updates to password
 * Verify post found is not null
 */
exports.updateUser = (req, res) => {
  const form = formidable();
  form.parse(req, async (formErr, fields) => {
    if(formErr) {
      console.err(formErr);
      return;
    }
    
    try {
        user.findByIdAndUpdate(req.params.id, {
            email: `${ fields.email}`,
            username: `${ fields.username }`,
            //pass: `${ fields.password }`,
        }, (err, user) => {
            if(err){
                console.error(err);
            }
            // this still gives null
            console.log(user);
        });

        res.status(201).send("User updated");
        console.log("User updated with id:" + " " + req.params.id);
      
    } catch(err) {
      console.error(err);
      res.sendStatus(500);
    }
  });
}

/**
 * deleteUser
 * @desc Delete all user data
 * @TODO: Delete all post and comment data made by user
 */
exports.deleteUser = async (req, res) => {
    try{
        const userFound = await user.findByIdAndDelete(req.params.id);
        if(userFound == null){
            throw new Error("Check user id ", req.params.id);
        }
        res.status(200).send("User deleted");
    }catch(err){
        console.error(err);
        res.status(404).send("Error deleteing user");
    } 
}

