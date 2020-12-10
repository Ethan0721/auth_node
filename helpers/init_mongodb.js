const mongoose = require("mongoose");
const DB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_NAME;

mongoose.connect(DB_URI,
    { 
        dbName: DB_NAME,
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(()=>{
    console.log('mongodb connected..');
}).catch((err)=>{
    console.log(`DB Connection Error: ${err.message}`);
})

mongoose.connection.on('connected', ()=>{
    console.log('Monggose connection to db');
});

mongoose.connection.on('error', (err)=>{
    console.log(`Mongoose connection Error ${err.message}`);
});

mongoose.connection.on('disconnected', ()=>{
    console.log('Mongoose connection is disconnected.');
});

process.on('SIGINT', async()=>{
    await mongoose.connection.close();
    process.exit(0);
});
