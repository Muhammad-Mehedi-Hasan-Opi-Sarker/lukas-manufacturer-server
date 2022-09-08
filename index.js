const express = require('express');
const app = express();
let jwt = require('jsonwebtoken');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.ovtmefn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}


async function run() {

    try {
        const database = client.db("productList").collection("productCollection");
        const database2 = client.db("productList").collection("shortProduct");
        const orderCollection = client.db("productList").collection("allOrders");
        const userCollection = client.db("productList").collection("user");
        const paymentCollection = client.db("productList").collection("payments");
        const profileCollection = client.db("productList").collection("profile");

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

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        // for admin role
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin') {
                const filter = { email: email };
                const updateDoc = {
                    $set: { role: 'admin' },
                };
                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result, token);
            }
            else {
                res.status(403).send({ message: 'forbidden' })
            }

        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })


        // payment gate way 
        app.post('/create-payment-intent',verifyJWT, async(req,res)=>{
            const service = req.body;
            const price = service.price;
            const amount = price*100;
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types:['card']
            });
            res.send({clientSecret:paymentIntent.client_secret})
        })


        // get order collection 
        app.post('/order/:id', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result)
        })

        // order get all comment 
     /*    app.get('/order', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        }) */


        app.get('/order', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const result = await orderCollection.find(query).toArray();
                return res.send(result);
            }
            else {
                return res.status(403).send({ message: 'forbidden access' })
            }
        })


        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })


        // payment for 
        app.get('order/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order)
        })


        // get for transition id 
    app.patch('/order/:id', verifyJWT,async(req,res)=>{
        const id = req.params.id;
        const payment =req.body;
        const filter = {_id:ObjectId(id)};
        const updatedDoc= {
            $set:{
                paid:true,
                transactionId: payment.transactionId
            }
        }
        
        const result = await paymentCollection.insertOne(payment);
        const updatedBooking = await orderCollection.updateOne(filter, updatedDoc);
        res.send(updatedDoc);
    })


        // users data 
        app.get('/users', verifyJWT, async (req, res) => {
            const query = {}
            const result = await userCollection.find(query).toArray();
            res.send(result);
        })
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })


        // profile for update 
        app.put('/profile/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await profileCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        app.get('/profile', async(req,res)=>{
            const email = req.query.email;
            const query = { email: email };
            const result = await profileCollection.find(query).toArray();
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