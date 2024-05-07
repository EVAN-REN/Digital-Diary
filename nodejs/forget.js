import{ MongoClient } from "mongodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// replace region
const sesClient = new SESClient({ region: "us-east-2" });

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
};

async function generateResetToken(username, email) {
    const token = Math.floor(1000 + Math.random() * 9000);
    await client.connect();
    const collection = client.db("Library").collection("resettoken");
    await collection.deleteOne({ username, email });
    await collection.insertOne({ username: username, email: email, token: token});
    await client.close();
    return token;
}

async function findUser(username, email) {
    console.log("finding user")
    await client.connect();
    const collection = client.db("Library").collection("users");
    const user = await collection.findOne({username, email});
    await client.close();
    return !user
    
}
    
export const handler = async (event) => {
    try{
        const { username, email } = JSON.parse(event.body);
        if(await findUser(username, email)){
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'The username and email is unavailable',
                }),
            };
        }
        console.log("no found same username")

        const verifytoken = await generateResetToken(username, email);

        const emailParams = {
            Destination: {
                ToAddresses: [email], // receiver email address(verify in ese and replace)
            },
            Message: {
                Body: {
                    Text: {
                        Data: `Account Verify Token:\n
                        Token:${verifytoken}\n`, // content
                    },
                },
                Subject: {
                    Data: "Books Diary Token for forgetting password", // email subject
                },
            },
            Source: process.env.ADMIN_EMAIL, // sender email address(verify in ses and replace)
        };

        try {
            // send email
            const response = await sesClient.send(new SendEmailCommand(emailParams));
            console.log(response);
        } catch (err) {
            console.error(err);
            return {
                statusCode: 500,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'Mail sending failure',
                }),
            };
        }

        console.log("success send token")
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