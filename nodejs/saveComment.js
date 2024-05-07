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
        const { token, id, bookcomment, bookrate} = JSON.parse(event.body);
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
        const updatebook = await usersBooksCollection.updateOne(
          {_id}, 
          { $set: { bookcomment, bookrate} }
          );
        console.log(updatebook);
        await client.close();
        if (!updatebook) {
          console.log("book update fail")
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
                message: 'Book update success'
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