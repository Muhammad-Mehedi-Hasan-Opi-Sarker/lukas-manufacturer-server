const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ovtmefn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    console.log(uri)
    try {
        const database = client.db("productList").collection("productCollection");
        const database2 = client.db("productList").collection("shortProduct");

        // all product list in 
        app.get('/product', async (req, res) => {
            const query = {};
            const product = await database.find(query).toArray();
            res.send(product);
        })

        // for home product 
        app.get('/homeProduct', async (req, res) => {
            const query = {};
            const homeProduct = await database2.find(query).toArray();
            res.send(homeProduct);
        })
    }
    finally {

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('connected');
})

app.listen(port, () => {
    console.log('server running')
})