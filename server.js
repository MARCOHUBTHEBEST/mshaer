const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

// test
app.get("/", (req, res) => {
    res.json({ status: "OK" });
});

app.post("/analyze", async (req, res) => {
    try {
        const text = req.body.text;

        if (!text) {
            return res.status(400).json({ error: "No text provided" });
        }

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: `حلل المشاعر لهذا النص وارجع JSON فقط:
                        
النص: ${text}

الشكل:
{
"emotion": "string",
"confidence": number,
"secondary_emotion": "string",
"advice": "string"
}`
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const raw = response.data.choices?.[0]?.message?.content;

        if (!raw) {
            return res.status(500).json({ error: "Empty AI response" });
        }

        let result;

        try {
            result = JSON.parse(raw);
        } catch (e) {
            // fallback لو AI ما رجع JSON صحيح
            result = {
                emotion: "غير واضح",
                confidence: 0,
                secondary_emotion: "",
                advice: raw
            };
        }

        res.json(result);

    } catch (error) {
        console.error("ERROR:", error.response?.data || error.message);
        res.status(500).json({
            error: "Server crashed",
            details: error.response?.data || error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on", PORT);
});
