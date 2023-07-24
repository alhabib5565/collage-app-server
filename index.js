const express = require('express');
const cors = require('cors')
const morgan = require('morgan')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express()

app.use(cors())
app.use(express.json())
morgan('dev')

app.get('/', (req, res) => {
    res.send('collage admission server running')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.czarj6h.mongodb.net/?retryWrites=true&w=majority`;

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
        const usersCollection = client.db('jobTaskDB').collection('users')
        const collageCollection = client.db('jobTaskDB').collection('collages')
        const candidateCollection = client.db('jobTaskDB').collection('candidates')
        const reviewCollection = client.db('jobTaskDB').collection('reviews')

        //save user data after register
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body
            const query = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })
        // get  all collage data 
        app.get('/collages',async (req, res) => {
            const result =await collageCollection.find().toArray()
            res.send(result)
        })
        // search collage 
        app.get('/collages/:name', async (req, res) => {
            const name = req.params.name
            const result = await collageCollection
                .find({ collageName: { $regex: name, $options: "i" } }).toArray()
            res.send(result)
        })

        // a collage details 
        app.get('/collage/:id', async (req, res) => {
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const result = await collageCollection.findOne(query)
            res.send(result)
        })
        // save candidate data
        app.post('/saveCandidate', async (req, res) => {
            const candidateDetails = req.body
            const result = await candidateCollection.insertOne(candidateDetails)
            res.send(result)
        })
        // save collage review
        app.post('/review', async (req, res) => {
            const review = req.body
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        app.get('/allReview', async (req, res) => {
            const result = await reviewCollection.find().toArray()
            res.send(result)
        })

        app.get('/candidate', async (req, res) => {
            const email = req.query.email
            console.log(email)
            const query = {candidateEmail: email}
            const result = await candidateCollection.findOne(query)
            res.send(result)
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


app.listen(port, () => {
    console.log(`collage admission server running on port ${port}`)
})