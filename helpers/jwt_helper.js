const JWT = require("jsonwebtoken");
const createError = require("http-Errors");
const client = require("./init_redis");


module.exports = {
    signAccessToken:(userId)=> {
        return new Promise((resolve, reject)=>{
            const payload = {};
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const options = {
                expiresIn: "15s",
                issuer:'ethan',
                audience: userId
            };

            JWT.sign(payload,secret,options,(err, token)=>{
                if(err) {
                    console.log(err.message);
                    return reject(createError.InternalServerError());
                }
                client.SET(userId, token, (err,reply)=>{
                    if(err){
                        console.log(err.message);
                        reject(createError.InternalServerError());
                        return;
                    }
                    resolve(token);
                })
            })
        });
    },

    verifyAccessToken: (req,res,next)=>{
        if(!req.headers['authorization'] && !req.headers['Authorization']){
            return next(createError.Unauthorized());
        }
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, payload)=>{
            if(err){
                const message = err.name === 'JsonWebTokenError' ? 'Unauthoizaed' : err.message;
                return next(createError.Unauthorized(message));
            }
            req.payload = payload;
            console.log(`Payload is `, payload);
            next();
        })
    },
    signRefreshToken: (userId)=> {
        return new Promise((resolve, reject)=>{
            const payload = {};
            const secret = process.env.REFRESH_TOKEN_SECRET;
            const options = {
                expiresIn: "1y",
                issuer:'ethan',
                audience: userId
            };

            JWT.sign(payload,secret,options,(err, token)=>{
                if(err) {
                    console.log(err.message);
                    return reject(createError.InternalServerError());
                }
                resolve(token);
            })
        });
    },
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject)=>{
            JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET,(err, payload)=>{
                if(err){
                    return reject(createError.Unauthorized());
                }
                const userId = payload.aud;
                resolve(userId);
            })
        })
    }
}

