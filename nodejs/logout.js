import { MongoClient } from "mongodb";

// Example mongodb://admin:vBTaTtAqab222332112134@34.227.192.31:27017
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export const handler = async (event) => {
    console.log(event)
    try {
        const { token } = JSON.parse(event.body);
        await client.connect();
        const tokenCollection = client.db("Library").collection("tokens"); 
        const userToken = await tokenCollection.deleteOne({ token });
        
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'logout success'
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'An error occurred during logout',
                error: err.toString(),
            }),
        };
    }
};