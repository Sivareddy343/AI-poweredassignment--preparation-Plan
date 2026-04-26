import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
app.get("/", (req, res) => {
  res.send("Backend is running");
});


const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Analyze api
app.post("/analyze", async (req, res) => {
  try {
    const { jd, resume } = req.body;

    const prompt = `
You are an AI skill assessment agent.

Job Description:
${jd}

Resume:
${resume}

Tasks:
1. Extract skills from Job Description
2. Extract skills from Resume
3. Compare and categorize into:
   - matched skills
   - missing skills
   - weak skills

Return ONLY JSON:

{
  "jd_skills": [],
  "resume_skills": [],
  "matched_skills": [],
  "missing_skills": [],
  "weak_skills": []
}
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();

    res.json({ result: text });
    console.log("Gemini output:", text);
    

  } catch (error) {
    console.error("Analyze Error:", error);
    res.status(500).json({ error: "Error analyzing data" });
  }
});
app.post("/questions", async (req, res) => {
  try {
    const { missing_skills, weak_skills } = req.body;
const prompt = `
You are a strict AI interviewer.

You are given:

Missing Skills:
${JSON.stringify(missing_skills)}

Weak Skills:
${JSON.stringify(weak_skills)}

Only generate questions for these skills.Do NOT add any new skills. Do NOT include unrelated technologies.

only generate 
- Maximum 3 skills total
- Maximum 1 question per skill
- Keep questions simple and clear

Return ONLY JSON:

{
  "questions": [
    {
      "skill": "",
      "question": ""
    }
  ]
}

Output must start with { and end with }
`;

    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();

    res.json({ result: text });
    console.log("Gemini output:", text);

  } catch (error) {
    console.error("Questions Error:", error);
    res.status(500).json({ error: "Error generating questions" });
  }
});
// evaluation api
app.post("/evaluate", async (req, res) => {
  try {
    const { questions, answers } = req.body;

    if (!questions || !answers) {
      return res.status(400).json({ error: "Missing questions or answers" });
    }

    const prompt = `
You are a strict JSON generator. You only output JSON.

Questions:
${JSON.stringify(questions)}

Answers:
${JSON.stringify(answers)}

Evaluate each skill based on:
- clarity
- depth
- practical knowledge

Return ONLY JSON:

{
  "evaluation": [
    {
      "skill": "",
      "score": 0,
      "level": "",
      "reason": ""
    }
  ]
}

Output must start with { and end with }
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("Invalid JSON:", text);
      return res.status(500).json({ error: "Invalid JSON from AI" });
    }

    res.json(parsed);

  } catch (error) {
    console.error("EVALUATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});
// lernin plan api
app.post("/plan", async (req, res) => {
  try {
    const { missing_skills } = req.body;

    const prompt = `
You are an AI mentor.

Based on:
- missing skills
- evaluation

Create a learning plan.

Return JSON:
{
  "plan": [
    {
      "skill": "",
      "time": "",
      "resources": [],
      "steps": []
    }
  ]
}
`;

    const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();

    res.json({ result: text });
    console.log("Gemini output:", text);

  } catch (error) {
    console.error("Plan Error:", error);
    res.status(500).json({ error: "Error generating plan" });
  }
});
//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});