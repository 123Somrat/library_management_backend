require("dotenv").config();
const express = require("express");
const app = express();
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId;

const cosrsOptions = ["http://127.0.0.1:5173"]
// middleWare
app.use(express.json())
app.use(cors())
const port =process.env.PORT;

// user role checking middleWare

const hasPermission = async (req,res,next) =>{
     const userRole =  req.body.User.role;
     if(userRole==="librarian"){
        next()
     }else{
       await res.status(403).send( "UnAuthorized")
     }
}


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

    // create collection for users
    const users = bookDB.collection("users")
  
    // create collectoon for borrowed books
    const borrowedBooks = bookDB.collection("borrowedbooks")



// update Book quabtity
app.patch("/decrementbookquantity/:id",async(req,res)=>{
  console.log(req.method)
  const id = req.params.id;
  console.log(id)
  const query = {_id : new ObjectId(id)}
  const data = req.body.quantity;
   const updatedBookQuantity =await books.updateOne(query,{
       $set : {
         quantity : data - 1
       }
   });
   res.send(updatedBookQuantity)
 })



 // delete book from borrowed book  
    app.delete("/bookreturn/:id",async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const data = await borrowedBooks.deleteOne(query)
      res.status(200).send(data)
    })





  // All get methods 
  
  // get all Books
  app.get("/books/:category",async(req,res)=>{
    const query = req.params.category;
    
    if(query==="allbooks"){
      const allBooks = await books.find().toArray();
      res.status(200).send(allBooks)
    }else{
      // get books depends on book categoy
       const bookstype = req.params.category
       const query = {category : bookstype}
       const categoryBook = await books.find(query).toArray()
       res.status(200).send(categoryBook)
    }

  })

  // get single books

  app.get("/bookdetails/:id",async(req,res)=>{
     const id = req.params.id;
     const query = {_id : new ObjectId(id)}
     const book =await books.findOne(query)
     res.status(200).send(book)
  })

// get a single books for reading
app.get("/readbook/:id",async(req,res)=>{
  const id = req.params.id;
  const query = {_id : new ObjectId(id)}
  const book =await books.findOne(query)
  res.status(200).send(book)
})

// get all borrowed books by user
app.get("/borrowedbook",async(req,res)=>{
   const email = req.query.email;
   const query = {userEmail : email};
   const yourBorrowedBooks = await borrowedBooks.find(query).toArray();
   res.status(200).send(yourBorrowedBooks)
})

// get a books depens on search
app.get("/availablebooks",async(req,res)=>{
   const query = { quantity :  {$gt: 0 }}
   const availablebooks = await books.find(query).toArray()
   res.status(200).send(availablebooks)
})



// All Post Method start from here .


// create user
app.post("/users",async(req,res)=>{
   const userInfo= req.body;
    const user = await users.insertOne(userInfo);
    res.status(201),send(user)
})

// Create Book 
app.post("/createbook",hasPermission,async(req,res)=>{
     const bookInfo = req.body;
     const book = await books.insertOne(bookInfo);
     res.status(201).send(book)
})

// borrowed books list 
app.post("/books/borrowedbooks",async(req,res)=>{
   const borrowedBooksData = req.body;
  
   const query ={bookName :borrowedBooksData.bookName,userEmail:borrowedBooksData.userEmail};
  
   // checking books already borrowed or not
   const booksAlredayInBorrowdBooks = await borrowedBooks.findOne(query);
 
  
   // if books not borrowed yet thrn we insert in db
  if(booksAlredayInBorrowdBooks===null || booksAlredayInBorrowdBooks.userEmail !== borrowedBooksData.userEmail){
      const borrowedBook = await borrowedBooks.insertOne(borrowedBooksData);
      res.status(201).send(borrowedBook)
    return
    }
    if((booksAlredayInBorrowdBooks.userEmail === borrowedBooksData.userEmail)){
      res.send("you alreday borrowed the book")
    }
   // if books alreday borrowed we send a messege
   
  // Patch method

 
  

   
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