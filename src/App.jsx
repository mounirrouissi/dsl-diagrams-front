import React, { useState } from "react";
import "./App.css";
import AivaGraph from "./AivaGraph";
import ChatContainer from "./components/Chat/ChatContainer";

function App() {
  const [currentView, setCurrentView] = useState("chat"); // 'chat' or 'graph'

  return (
    <div className="App">
      <nav
        style={{
          padding: "10px 20px",
          background: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setCurrentView("chat")}
          style={{
            padding: "8px 16px",
            background: currentView === "chat" ? "#2563eb" : "white",
            color: currentView === "chat" ? "white" : "#2563eb",
            border: "1px solid #2563eb",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Auto Assistant Chat
        </button>
        <button
          onClick={() => setCurrentView("graph")}
          style={{
            padding: "8px 16px",
            background: currentView === "graph" ? "#2563eb" : "white",
            color: currentView === "graph" ? "white" : "#2563eb",
            border: "1px solid #2563eb",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          AIVA Graph
        </button>
      </nav>

      {currentView === "chat" ? <ChatContainer /> : <AivaGraph />}
    </div>
  );
}

export default App;
