import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import './index.css'
function ChatPage() {
  const location = useLocation();
  const { analysis } = location.state || {};

  const [messages, setMessages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answers, setAnswers] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [plan, setPlan] = useState(null);


  useEffect(() => {
    if (!analysis) return;

    fetch("http://localhost:5000/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        missing_skills: analysis.missing_skills,
        weak_skills: analysis.weak_skills
      })
    })
      .then((res) => res.json())
      .then((data) => {
        const parsed = JSON.parse(data.result);

        setQuestions(parsed.questions);

        setMessages([
          { type: "ai", text: "Analysis completed" },
          { type: "ai", text: parsed.questions[0].question }
        ]);

        setQuestionIndex(1);
      });
  }, [analysis]);

  const sendMessage = () => {
    if (!input) return;

    const updatedAnswers = [...answers, input];
    setAnswers(updatedAnswers);

    let nextMessage = "";

    if (questionIndex < questions.length) {
      nextMessage = questions[questionIndex].question;
      setQuestionIndex(questionIndex + 1);
    } else {
      nextMessage = "Evaluating your answers...";
      evaluateAnswers(updatedAnswers);
    }

    setMessages((prev) => [
      ...prev,
      { type: "user", text: input },
      { type: "ai", text: nextMessage }
    ]);

    setInput("");
  };
  const evaluateAnswers = async (answersData) => {
    try {
      const res = await fetch("http://localhost:5000/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          answers: answersData,
          questions: questions
        })
      });

      const data = await res.json();

      if (!data.evaluation) {
        alert("Evaluation failed");
        return;
      }

      setEvaluation(data);

      const planRes = await fetch("http://localhost:5000/plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          missing_skills: analysis.missing_skills,
          evaluation: data
        })
      });

      const planData = await planRes.json();

      setPlan(planData);

      setMessages((prev) => [
        ...prev,
        { type: "ai", text: "Evaluation completed" },
        { type: "ai", text: "Here is your learning plan" }
      ]);

    } catch (error) {
      console.error(error);
      alert("Error during evaluation");
    }
  };

  return (
    <div className="app-container2">
      <h2>Skill Analysis and Preparation Plan</h2>
      <p>Here is conducted skill assessment and provided Personalized learning plan</p> 
      
      <div
        style={{
          border: "1px solid grey",
          height: "300px",
          width:"80%",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px"
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.type === "user" ? "right" : "left",width:"100px" }}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your answer..."
      />
      <button onClick={sendMessage}>Send</button>
            
      {evaluation && evaluation.evaluation && (
        <div>
          <h3>Evaluation</h3>
          {evaluation.evaluation.map((e, i) => (
            <div key={i}>
              <p><b>{e.skill}</b> - {e.level}</p>
              <p>{e.reason}</p>
            </div>
          ))}
        </div>
      )}
       
            {plan && plan.plan && (
        <div>
          <h3>Learning Plan</h3>
          {plan.plan.map((p, i) => (
            <div key={i}>
              <p><b>{p.skill}</b></p>
              <p>Time: {p.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
}

export default ChatPage;