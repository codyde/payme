import { db } from "@/db";
import { transactions } from "@/db/schema";
import { validateRequest } from "@/lib/auth/lucia";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const anthropic = new Anthropic();

export async function POST(req: Request) {
    const { transactionData } = await req.json();
    const { user } = await validateRequest();

    if (!user) {
        return new Response(JSON.stringify({ error: 'User not authenticated' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const msg = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 4096,
        temperature: 0,
        messages: [
            {
                "role": "user",
                "content": `You are tasked with extracting key financial transaction information from input data. The data will be provided in one of two formats: CSV or a pasted transaction log. Your goal is to parse this data, extract relevant information, and return it in a standardized JSON format.\n\nFirst, examine the input data provided here: ${transactionData} . \n\n Determine whether it is in CSV format or a transaction log format.\n\nIf the data is in CSV format:\n1. Identify the column headers and their corresponding indices.\n2. Look for columns that represent the transaction date, description/name, and amount.\n3. If the CSV uses a different date format, prepare to convert it to MM/DD/YYYY.\n4. Determine how debit and credit transactions are represented (e.g., separate columns or negative/positive values).\n\nIf the data is in transaction log format:\n1. Identify the pattern used for each transaction entry.\n2. Look for consistent delimiters or formatting that separate the date, description/name, and amount.\n3. Determine how to distinguish between debit and credit transactions.\n\nFor each transaction, extract and normalize the following information:\n1. Date: Convert to MM/DD/YYYY format if necessary.\n2. Description: Parse the description to determine the name of a the business. If it is a transfer, attempt to parse out the account number as well. \n3. Amount: Determine if it's a debit (negative) or credit (positive) transaction. For amount, you must preserve all decimal place information, as these are financial transactions. \n4. Business: Analyze the description to identify the business name or category. For transfers, include relevant account details.\n\nPrepare the extracted information in the following JSON format:\n{\n  \"transactionData\": [\n    {\n      \"date\": \"MM/DD/YYYY\",\n      \"description\": \"Transaction description\",\n      \"amount\": 123.45,\n      \"business\": \"Identified business or category\"\n    },\n    ...\n  ]\n}\n\nImportant notes:\n- Represent debit transactions as negative numbers and credit transactions as positive numbers in the \"amount\" field.\n- If you cannot determine the business name, use a general category (e.g., \"Unknown\", \"Transfer\", \"Deposit\").\n- If any required information is missing or cannot be parsed, skip that transaction and move to the next one.\n- If you encounter any errors or ambiguities in the data, note them at the end of your JSON output in an \"errors\" array.\n\nProcess the entire input and generate the JSON output. Enclose your final JSON output within <json_output> tags. Skip all conversational responses; only respond the data response. You must not modify the values from the incoming data, they must remain the exact same as previous. For example, -4.99 should be -4.99 NOT -499.`
                    }
                ]
    });

    console.log('msg: ', msg.choices[0].message.content)

    // Extract JSON content and format it
    const jsonMatch = msg.choices[0].message.content!.match(/<json_output>(.*?)<\/json_output>/s);
    if (jsonMatch) {
        const jsonString = jsonMatch[1].replace(/\n/g, '');
        const formattedJson = JSON.parse(jsonString);

        console.log('data: ', formattedJson)
       
        const newTransactions = formattedJson.transactionData.map((transaction: any) => ({
            userId: user.id,
            date: transaction.date,
            description: transaction.description,
            amount: Math.round(transaction.amount * 100), // Convert dollars to cents
            business: transaction.business,
            notes: '', // Initialize with an empty string
        }));
    
        console.log(newTransactions);
    
       await db.insert(transactions).values(newTransactions);
    
        return new Response(JSON.stringify(newTransactions), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    

    // If no JSON found, return an error
    return new Response(JSON.stringify({ error: 'No valid JSON output found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
    });
}