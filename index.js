const express = require('express')
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;



app.use(cors())
app.use(express.json())

const { MongoClient } = require('mongodb');
// const uri = "mongodb+srv://travelPro:oTobZdWZGhdgi0De@cluster0.baet0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.baet0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        console.log('win it')
    }
    finally {
        // await client.close
    }
}

client.connect(err => {
    const userCollection = client.db("travellers").collection("users");
    const orderCollection = client.db("travellers").collection("orders");
    const memberCollection = client.db("travellers").collection("members");


    app.post("/addUser", async (req, res) => {
        const result = await userCollection.insertOne(req.body);
        res.send(result.acknowledged)
    });

    // app.get('/users/:email', async(req,res)=>{
    //     const email = req.params.email;
    //     const query = {email: email};
    //     const user = await memberCollection.find(query);
    //     if(user?.role === 'admin'){

    //     }
    // })

    app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await memberCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
        console.log('find', {admin: isAdmin})
    })

    app.post("/members", async (req, res) => {
        const user = req.body;
        const result = await memberCollection.insertOne(user);
        console.log(result)
        res.json(result)
    })

    app.put("/members", async (req, res) => {
        const user = req.body;
        const filter = { email: user.email };
        const options = { upsert: true };
        const updateDoc = { $set: user };
        const result = await memberCollection.updateOne(filter, updateDoc, options);
        res.json(result)
    });

    // app.put('/members/admin', async(req,res)=>{
    //     const user = req.body;
    //     console.log('put',user)
    //     const filter = {email: user.email};
    //     const updateDoc = {$set: {role: 'admin'}};
    //     const result = await memberCollection.updateOne(filter,updateDoc)
    //     res.json(result)
    // })

    app.put('/members/admin', async (req, res) => {
        const user = req.body;
        console.log('put', user)

        const filter = { email: user.email };
        const updateDoc = { $set: { role: 'admin' } };
        const result = await memberCollection.updateOne(filter, updateDoc);
        res.json(result);

    })

    app.post('/addreviews', async (req, res) => {
        console.log(req.body);
        const result = await orderCollection.insertOne(req.body);
        res.send(result.acknowledged);
    })

    // app.put('/users/admin', async(req,res)=>{
    //     const user = req.body; 
    //     const filter = {email:user.email}
    //     const updateDoc = {$set: {role:'admin'}};
    //     const result = await memberCollection.updateOne(filter, updateDoc);
    //     res.json(result);
    // })

    app.get('/', (req, res) => {
        res.send('Server on run')
    })

    app.get("/users", async (req, res) => {
        const result = await userCollection.find({}).toArray();
        console.log(result)
        res.send(result)
    });

    app.get("/reviews", async (req, res) => {
        const result = await orderCollection.find({}).toArray();
        console.log(result)
        res.send(result)
    });

    app.delete("/deleteUser/:id", async (req, res) => {
        const id = req.params.id;
        const item = { _id: ObjectId(id) }
        const result = await userCollection.deleteOne(item);
        console.log(result.acknowledged)
    });


    app.post("/addOrder", (req, res) => {
        console.log(req.body);
        orderCollection.insertOne(req.body).then(result => {
            res.send(result)
        })
    })

    app.get("/singleProduct/:id", async (req, res) => {
        console.log(req.params.id);

        userCollection.findOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                console.log(result);
                res.send(result)
            })
    });

    app.put('/update/:id', async (req, res) => {
        const id = req.params.id;
        const updatedInfo = req.body;
        const filter = { _id: ObjectId(id) };

        userCollection.updateOne(filter, {
            $set: {
                name: updatedInfo.name,
                price: updatedInfo.price,
            }
        })
            .then(result => {
                res.send(result)
            })
    })

    app.get("/myOrders/:email", async (req, res) => {
        console.log(req.params.email);

        const result = await orderCollection.find({ email: req.params.email }).toArray();
        res.send(result)
    });



});

app.listen(port, () => {
    console.log("Running server on port", 5000)
})



