const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
require("dotenv").config();
require('./helpers/init_redis');
require('./helpers/init_mongodb');
const PORT = process.env.PORT || 3000;
const { verifyAccessToken } = require("./helpers/jwt_helper");

const Auth_route = require('./Routes/Auth_route');
const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.get('/', verifyAccessToken, (req, res, next)=> {
    console.log(req.headers['Authorization']|| req.headers['authorization']);
    res.send(`This is home page`);
});
app.use('/auth', Auth_route);
app.use((req,res,next) =>{
    next(createError.NotFound(`This route does not exist`));
});
app.use((err, req, res, next) =>{
    res.status(err.status || 500);
    res.send({
        error:{
            statusCode: err.status || 500,
            message: err.message
        }
    });
})

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
})