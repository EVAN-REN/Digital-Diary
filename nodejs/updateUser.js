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
    const { token, useremail } = JSON.parse(event.body);
    await client.connect();
    const tokenCollection = client.db("Library").collection("tokens"); 
    const usersCollection = client.db("Library").collection("users")
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
    const user = await usersCollection.updateOne({ username }, {$set: {email : useremail}});
    if (!user){
      console.log("user not found");
      return {
        statusCode : 401,
        headers: corsHeaders,
        body: JSON.stringify({
          message: 'User not found'
        })
      }
    }
    
    return {
      headers: corsHeaders,
      statusCode : 200,
      body: JSON.stringify({
        message: 'user update success'
      })
    }
  } catch (err) {
      console.log(err);
      return {
        headers: corsHeaders,
        statusCode: 500,
        body: JSON.stringify({
          message: 'An error occurred',
          error: err.toString(),
        }),
      };
    }
}