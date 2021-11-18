const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h1fbe.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('wowshop');
        const usersCollection = database.collection('users');
        const productsCollection = database.collection('products');
        const placeOrderCollection = database.collection('placeorder');
        const reviewsCollection = database.collection('reviews');

        //Register User data insert
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })
        //Google singup user data insert
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })

        //Convert a user to Admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

        //Users GET API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role) {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //Products GET API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        //GET Single Products
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productsCollection.findOne(query);
            res.json(result);

        });

        //Add Products POST API
        app.post('/products', async (req, res) => {
            const product = req.body;
            console.log('hit the products post api', product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        })

        //PlaceOrder POST API
        app.post('/placeorder', async (req, res) => {
            const order = req.body;
            console.log('hit the PlaceOrder post api', order);
            const result = await placeOrderCollection.insertOne(order);
            console.log(result);
            res.json(result);
        })

        //GET PlaceOrder data
        app.get('/placeorder', async (req, res) => {
            const cursor = placeOrderCollection.find({});
            const placeorders = await cursor.toArray();
            res.send(placeorders);
        });

        //DELETE API
        app.delete('/placeorder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await placeOrderCollection.deleteOne(query);
            res.json(result);
        })

        //review POST API
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        })

        //review GET API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running my server');
});

app.listen(port, () => {
    console.log('Running server port ', port);
})