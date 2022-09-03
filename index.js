const express = require('express');
const app= express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://manufacture:<password>@cluster0.ovtmefn.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        console.log('connect')
    }
    finally{

    }

}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('connected');
})

app.listen(port,()=>{
    console.log('server running')
})