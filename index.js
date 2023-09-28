const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 3000
app.use(express.json());
app.use(cors());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2m0rny5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const menusCollection = await client.db('bistroDataBase').collection('menu')
    const reviewsCollection = await client.db('bistroDataBase').collection('reviews')
    
    // get all the menus
    app.get('/menus', async (req, res) => {
        const query = await menusCollection.find().toArray()
        res.send(query)
    })
    
    // get all review
    app.get('/reviews', async (req, res) => {
        const query = await reviewsCollection.find().toArray()
        res.send(query)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Welcome to the Bistro Boss Website Server')
})

app.listen(port , () => {
    console.log(`Listening on ${port}`)
})