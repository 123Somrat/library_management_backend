require("dotenv").config();
const express = require("express");
const app = express();
const cors = require('cors')



// middleWare
app.use(express.json())
app.use(cors())
const port =process.env.PORT;




const { MongoClient, ServerApiVersion } = require('mongodb');

// Database Url
const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.byja95t.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// DATA BASE CONNECTION
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const bookDB = client.db("books");
    // create collection for store book
    const books = bookDB.collection("allBooks");
   
  
  // All get methods 
  
  // get all Books
  app.get("/books",async(req,res)=>{
    const allBooks = await books.find().toArray();
     res.status(200).send(allBooks)

  })





// All Post Method strat from here


// Create Book 

app.post("/createbook",async(req,res)=>{
     const bookInfo = req.body;
     const book = await books.insertOne(bookInfo);
     res.status(201).send(book)
})

app.listen(port,()=>{
    console.log(`app is listeing on port ${port}`)
});











    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch(err){
      console.log(err)
  }
  
}
run().catch(console.dir);







app.get("/health",(req,res)=>{
     res.send("every thinng is oke")
})