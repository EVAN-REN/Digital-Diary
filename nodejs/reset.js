import{ MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// replace region

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
};

async function resetUser(username, email, password) {
    await client.connect();
    const collection = client.db("Library").collection("users");
    await collection.updateOne(
        { username, email },
        { $set: { password: password } }
    );
    await client.close();
}

async function findToken(username, email) {
    await client.connect();
    const collection = client.db("Library").collection("resettoken");
    const user = await collection.findOne({username, email});
    await client.close();
    return user.token;
}
    
export const handler = async (event) => {
    try{
        const { username, email, verifytoken, password } = JSON.parse(event.body);
        const token = await findToken(username, email);
        if(token != verifytoken){
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'The token is incorrect',
                }),
            };
        }
        console.log("verify successful")

        await resetUser(username, email, password );
        console.log("success reset")
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'User reset successfully',
            }),
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({
                message: 'Failed to reset',
                error: err.toString(),
            }),
        };
    }
};