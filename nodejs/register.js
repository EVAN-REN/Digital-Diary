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

async function saveUserToMongoDB(username, password, email) {
    await client.connect();
    const collection = client.db("library").collection("users");
    await collection.insertOne({ username: username, password:password, isadmin: false, email: email });
    await client.close();
}

async function findUsername(username) {
    console.log("finding user")
    await client.connect();
    const collection = client.db("library").collection("users");
    const user = await collection.findOne({username});
    await client.close();
    return !!user
    
}
    
export const handler = async (event) => {
    try{
        const { username, password, email } = JSON.parse(event.body);
        if(await findUsername(username)){
            return {
                statusCode: 401,
                headers: corsHeaders,
                body: JSON.stringify({
                    message: 'The user name is unavailable',
                }),
            };
        }
        console.log("no found same username")
        const emailParams = {
            Destination: {
                ToAddresses: [email], // receiver email address(verify in ese and replace)
            },
            Message: {
                Body: {
                    Text: {
                        Data: `Account registration successful!\n
                        Username:${username}\n
                        Password:${password}`, // content
                    },
                },
                Subject: {
                    Data: "Digital Library Register", // email subject
                },
            },
            Source: "kuimuren@usc.edu", // sender email address(verify in ese and replace)
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