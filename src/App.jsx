import React, { useState } from "react";
import "./App.css";
import AivaGraph from "./AivaGraph";
import ChatContainer from "./components/Chat/ChatContainer";
import ChannelSimulator from "./components/ChannelSimulator/ChannelSimulator";
import AdvancedChatInterface from "./components/Chat/AdvancedChatInterface";
import NLPDemo from "./components/Demo/NLPDemo";

function App() {
  const [currentView, setCurrentView] = useState("simulator"); // 'simulator', 'chat', 'graph', 'advanced-chat', or 'nlp-demo'
  const [chatContext, setChatContext] = useState(null);

  const handleStartChat = (context) => {
    setChatContext(context);
    setCurrentView("chat");
  };

  const handleBackToSimulator = () => {
    setChatContext(null);
    setCurrentView("simulator");
  };

  return (
    <div className="App">
      <nav
        style={{
          padding: "10px 20px",
          background: "#f8f9fa",
          borderBottom: "1px solid #dee2e6",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <button
          onClick={() => setCurrentView("simulator")}
          style={{
            padding: "8px 16px",
            background: currentView === "simulator" ? "#2563eb" : "white",
            color: currentView === "simulator" ? "white" : "#2563eb",
            border: "1px solid #2563eb",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          📱 Channel Simulator
        </button>
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
          💬 Auto Assistant Chat
        </button>
        <button
          onClick={() => setCurrentView("advanced-chat")}
          style={{
            padding: "8px 16px",
            background: currentView === "advanced-chat" ? "#2563eb" : "white",
            color: currentView === "advanced-chat" ? "white" : "#2563eb",
            border: "1px solid #2563eb",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🤖 Advanced NLP Chat
        </button>
        <button
          onClick={() => setCurrentView("nlp-demo")}
          style={{
            padding: "8px 16px",
            background: currentView === "nlp-demo" ? "#2563eb" : "white",
            color: currentView === "nlp-demo" ? "white" : "#2563eb",
            border: "1px solid #2563eb",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          🧠 NLP Demo
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
          🔄 AIVA Graph
        </button>

        {(currentView === "chat" || currentView === "advanced-chat") &&
          chatContext && (
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#6b7280" }}>
                {chatContext.channel === "sms" ? "📱" : "📧"}{" "}
                {chatContext.customerInfo.name} |{" "}
                {typeof chatContext.customerInfo.vehicle === "string"
                  ? chatContext.customerInfo.vehicle
                  : chatContext.customerInfo.vehicle
                  ? `${chatContext.customerInfo.vehicle.year || ""} ${
                      chatContext.customerInfo.vehicle.make || ""
                    } ${chatContext.customerInfo.vehicle.model || ""}`.trim()
                  : "Vehicle"}
              </span>
              <button
                onClick={handleBackToSimulator}
                style={{
                  padding: "6px 12px",
                  background: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                ← Back to Simulator
              </button>
            </div>
          )}
      </nav>

      {currentView === "simulator" && (
        <ChannelSimulator onStartChat={handleStartChat} />
      )}
      {currentView === "chat" && <ChatContainer initialContext={chatContext} />}
      {currentView === "advanced-chat" && <AdvancedChatInterface />}
      {currentView === "nlp-demo" && <NLPDemo />}
      {currentView === "graph" && <AivaGraph />}
    </div>
  );
}

export default App;
