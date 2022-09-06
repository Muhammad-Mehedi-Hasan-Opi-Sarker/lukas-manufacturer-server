const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ovtmefn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        const database = client.db("productList").collection("productCollection");
        const database2 = client.db("productList").collection("shortProduct");
        const orderCollection = client.db("productList").collection("allOrders");
        const userCollection = client.db("productList").collection("user");

        // all product list in 
        app.get('/product', async (req, res) => {
            const query = {};
            const product = await database.find(query).toArray();
            res.send(product);
        })

        // get single product 
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await database.findOne(query);
            res.send(result);
        })

        // for home product 
        app.get('/homeProduct', async (req, res) => {
            const query = {};
            const homeProduct = await database2.find(query).toArray();
            res.send(homeProduct);
        })
        // get one for home porduct 
        app.get('/homeProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await database2.findOne(query);
            res.send(product)
        })


        /* app.put('/user/email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await movies.updateOne(filter, updateDoc, options);
            res.send(result);
        }) */

        // get order collection 
        app.post('/order/:id', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result)
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