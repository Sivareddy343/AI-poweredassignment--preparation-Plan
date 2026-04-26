import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './App.css'
function App() {
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!jd || !resume) {
      alert("Please enter both Job Description and Resume");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ jd, resume })
      });

      const data = await res.json();

      if (!data.result) {
        alert("Analysis failed");
        return;
      }

      let parsed;

      try {
        parsed = JSON.parse(data.result);
      } catch {
        alert("Invalid JSON from backend");
        return;
      }
      navigate("/chat", { state: { analysis: parsed } });

    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    }
  };

  return (
    <div className="app-container">
      <h2>AI Skill Assessment Agent</h2>

      <p style={{ color: "orange", maxWidth: "600px" }}>
        Analyze your skills against a job description, assess your real proficiency,
        and get a personalized learning plan.
      </p>

      <h4>Job Description</h4>
      <textarea
        rows="4"
        style={{ width: "80%" }}
        value={jd}
        placeholder="Please provide Job description here"
        onChange={(e) => setJd(e.target.value)}
      />

      <h4>Resume</h4>
      <textarea
        rows="4"
        style={{ width: "80%" }}
        value={resume}
        placeholder="please provide Resume here"
        onChange={(e) => setResume(e.target.value)}
      />
      <div className="buttoncontainer">
          <button onClick={handleAnalyze} className="button">
            Start Analysis
          </button>
      </div>
    </div>
  );
}

export default App;