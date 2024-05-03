import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from 'uuid';

// Example mongodb://admin:vBTaTtAqabuC4NvV7jm3@34.227.192.31:27017
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
};

async function generateAuthToken(username) {
    // const token = `${new Date().toISOString()}`; // Generate a unique token
    const token = uuidv4();
    await client.connect();
    const collection = client.db("library").collection("tokens");
    await collection.insertOne({ username, token, createdAt: new Date()});
    await client.close();
    return token;
}

export const handler = async (event) => {
    console.log(event)
    try {
        const { username, password } = JSON.parse(event.body);
        await client.connect();
        console.log(username, password)
        const usersCollection = client.db("library").collection("users");
        const user = await usersCollection.findOne({ username, password});
        await client.close();

        if (!user) {
            console.log("user not found")
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Login failed: Incorrect username or password',
                }),
            };
        }

        console.log("user_Found")
        const token = await generateAuthToken(username); // Generate an auth token for the user
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Login successful',
                token, // Return the auth token to the user
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'An error occurred during login',
                error: err.toString(),
            }),
        };
    }
};