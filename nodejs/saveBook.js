import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export const handler = async (event) => {
    console.log(event)
    try {
        const { token, booktitle, bookimg, bookcategory, bookauthor } = JSON.parse(event.body);
        await client.connect();
        const tokenCollection = client.db("Library").collection("tokens"); 
        const usersCollection = client.db("Library").collection("users");
        const usersBooksCollection = client.db("Library").collection("usersBooks");
        const userToken = await tokenCollection.findOne({ token });
        if (!userToken) {
          console.log("token not found")
          return {
            statusCode : 401,
            headers: corsHeaders,
            body: JSON.stringify({
              message: 'Unauthorized token'
            })
          }
        }
        console.log("Token matched");
        const username = userToken.username;
        const user = await usersCollection.findOne({ username });
        if (!user) {
          console.log("user not found")
          return {
            headers: corsHeaders,
            statusCode : 401,
            body: JSON.stringify({
              message: 'Login failed: Incoreect username or password'
            })
          }
        }
        console.log("user_Found")
        
        const userid = user._id;
        const bookcomment = '';
        const bookrate = 0;
        const addbook = await usersBooksCollection.insertOne({ userid,  booktitle, bookimg, bookcategory, bookauthor, bookrate, bookcomment});
        await client.close();
        if (!addbook) {
          console.log("book add fail")
          return {
            headers: corsHeaders,
            statusCode : 401,
            headers: corsHeaders,
            body: JSON.stringify({
              message: 'Book add failed: Contact to administrator'
            })
          }
        }
        
        return {
            headers: corsHeaders,
            statusCode: 200,
            body: JSON.stringify({
                message: 'Book add success'
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            headers: corsHeaders,
            statusCode: 500,
            body: JSON.stringify({
                message: 'An error occurred during login',
                error: err.toString(),
            }),
          
        };
      }
};