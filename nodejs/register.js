import{ MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
};

async function saveUserToMongoDB(username, password, email) {
    await client.connect();
    const collection = client.db("library").collection("users");
    await collection.insertOne({ username: username, password:password, isadmin: false, email: email });
    await client.close();
}
    
export const handler = async (event) => {
    try{
        const { username, password, email } = JSON.parse(event.body);
        await saveUserToMongoDB(username, password, email);
        console.log("success register")
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'User registered successfully',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Failed to add user',
                error: err.toString(),
            }),
        };
    }
};