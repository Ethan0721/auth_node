const express = require("express");
const creatError = require("http-errors");
const router = express.Router();
const User = require("../Models/User.model");
const {authSchema} = require("../helpers/validattion_schema");
const {signAccessToken, signRefreshToken, verifyRefreshToken} = require("../helpers/jwt_helper");


router.post('/register', async(req, res, next)=>{
    try{
        // 1. validate body input
        // 2. find the user in db if exist
        // 3. if not exist, create new User using schema and save
        // 4. generating access token and refresh token and send back. 
        const result = await authSchema.validateAsync(req.body);
        const doesExist = await User.findOne({email: result.email});
        if(doesExist){
            throw creatError.Conflict(`This email already registered`)
        }
        const user = new User(result);
        const savedUser = await user.save();
        const accessToken = await signAccessToken(savedUser.id);
        const refreshToken = await signRefreshToken(savedUser.id);
        res.send({accessToken, refreshToken});
    }
    catch(error){
        if(error.isJoi === true){
            error.status = 422;
        }
        next(error);
    }
});

router.post('/login', async(req, res, next)=>{
    try{
        const result = await authSchema.validateAsync(req.body);
        const user = await User.findOne({email: result.email});
        if(!user){
            throw creatError.NotFound("User is not registered");
        }
        const isMatch = await user.isValidPassword(result.password);
        if(!isMatch){
            throw creatError.Unauthorized("Username/password not valid");
        }
        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);
        res.send({accessToken, refreshToken});
    }
    catch(error){
        if(error.isJoi === true){
            return next(creatError.BadRequest("Invalid Username/Password"));
        }
        next(error);
    }   
});

router.post('/refresh-token', async(req, res, next)=> {
    try{
        const { refreshToken } = req.body;
        console.log("refreshToken: ", refreshToken);
        if(!refreshToken) throw creatError.BadRequest();
        
        const userId = await verifyRefreshToken(refreshToken);
        const accessToken = await signAccessToken(userId);
        const refToken = await signRefreshToken(userId);
        res.send({ accessToken : accessToken, refreshToken: refToken});
    }catch(error){
        next(error);
    }
});

router.delete('/logout', async(req, res, next)=>{
    res.send(`logout route`);
});

module.exports = router;