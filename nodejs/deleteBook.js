import { MongoClient, Collection, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export const handler = async (event) => {
    console.log(event)
    try {
        const { token, id} = JSON.parse(event.body);
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
        var _id = new ObjectId(id);
        const deleteBook = await usersBooksCollection.deleteOne({_id});
        console.log(deleteBook);
        await client.close();
        if (!deleteBook) {
          console.log("book delete fail")
          return {
            headers: corsHeaders,
            statusCode : 401,
            headers: corsHeaders,
            body: JSON.stringify({
              message: 'Book update failed: Contact to administrator'
            })
          }
        }
        
        return {
            headers: corsHeaders,
            statusCode: 200,
            body: JSON.stringify({
                message: 'Book delete success'
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