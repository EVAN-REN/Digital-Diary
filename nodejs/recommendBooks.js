import { MongoClient } from "mongodb";
import {removeStopwords} from "stopword"

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type'
};
// references : https://stackoverflow.com/questions/5631422/stop-word-removal-in-javascript
function extractMeaningfulWords(title){
  // const commonWords = ["a", "the", "he", "his", "she", "her", "of"];
  let meaningfulWords = title.split(/\s+/);
  meaningfulWords = removeStopwords(meaningfulWords);
  // const meaningfulWords = words.filter(word => !commonWords.includes(word.toLowerCase()));
  return meaningfulWords;
}

function getRandomValueFromList(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}

export const handler = async (event) => {
    console.log(event)
    try {
        const { token } = JSON.parse(event.body);
        // console.log(token);
        await client.connect();
        const tokenCollection = client.db("Library").collection("tokens"); 
        const usersCollection = client.db("Library").collection("users")
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
        console.log(username);
        const user = await usersCollection.findOne({ username });
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
        const userid = user._id;
        
        const result = await usersBooksCollection.find({ userid }).toArray();
        await client.close();
        
        if (!result) {
          console.log("book fetch fail")
          return {
            headers: corsHeaders,
            statusCode : 401,
            body: JSON.stringify({
              message: 'Book fetch failed: No books'
            })
          }
        }
        
        if(result.length == 0){
          return {
              headers: corsHeaders,
              statusCode: 200,
              body: JSON.stringify({
                  message: 'No saved books',
                  result_length : 0
              }),
          };
        }
        
        let recommendList = [1, 2, 3]; // 1 : author, 2 : category, 3 : title
        var recommendIndex = getRandomValueFromList(recommendList);
        var RecommendKeyword = "";
        var RecommendType = "";
        if(recommendIndex == 1){
          let authorList = [];
          for (let i = 0; i < result.length; i++){
            if(result[i]["bookauthor"] != null){
              for (let j = 0; j < result[i]["bookauthor"].length; j++){
                authorList.push(result[i]["bookauthor"][j]);  
              }
            }
          }
          RecommendKeyword = getRandomValueFromList(authorList);
          RecommendType = "author";
        } else if(recommendIndex == 2){
          let categoryList = [];
          for (let i = 0; i < result.length; i++){
            if(result[i]["bookcategory"] != null){
              for (let j = 0; j < result[i]["bookcategory"].length; j++){
                categoryList.push(result[i]["bookcategory"][j]);  
              }
            }
          }
          RecommendKeyword = getRandomValueFromList(categoryList);
          RecommendType = "category";
        } else if(recommendIndex == 3){
          let titleList = [];
          for (let i = 0; i < result.length; i++){
            if(result[i]["booktitle"] != null){
              var meaningfulWords = extractMeaningfulWords(result[i]["booktitle"]);
              for (let j = 0; j < meaningfulWords.length; j++){
                titleList.push(meaningfulWords[j]);
              }
            }
          RecommendKeyword = getRandomValueFromList(titleList);
          RecommendType = "title";
          }
        }  
        return {
            headers: corsHeaders,
            statusCode: 200,
            body: JSON.stringify({
                message: 'Book fetch success',
                RecommendType,
                RecommendKeyword
            }),
        };
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
};