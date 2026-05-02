const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

// Health check
app.get("/", (req, res) => {
    res.send("Emotion API is running 🚀");
});

// تحليل المشاعر
app.post("/analyze", async (req, res) => {
    try {
        const userText = req.body.text;

        if (!userText) {
            return res.status(400).json({ error: "No text provided" });
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: `
حلل المشاعر في النص التالي بشكل عميق:
"${userText}"

ارجع JSON فقط بدون شرح:
{
"emotion": "",
"confidence": 0,
"secondary_emotion": "",
"advice": ""
}
`
                    }
                ]
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const aiText = response.data.choices[0].message.content;

        // نحاول نحوله JSON
        let parsed;
        try {
            parsed = JSON.parse(aiText);
        } catch {
            parsed = { raw: aiText };
        }

        res.json(parsed);

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
