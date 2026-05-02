const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.OPENAI_API_KEY;

// اختبار السيرفر
app.get("/", (req, res) => {
    res.send("Emotion AI API Running 🚀");
});

// تحليل المشاعر
app.post("/analyze", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const aiResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "أنت محلل نفسي ذكي"
                    },
                    {
                        role: "user",
                        content: `
حلل النص التالي تحليل عميق:

"${text}"

ارجع JSON فقط:
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

        const raw = aiResponse.data.choices[0].message.content;

        let result;

        try {
            result = JSON.parse(raw);
        } catch {
            result = { raw };
        }

        res.json(result);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
