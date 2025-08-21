import React, { useState } from "react";
import axios from "axios";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "S1",
    data: {
      label: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: "bold" }}>S1</div>
          <div style={{ fontSize: "12px" }}>START</div>
        </div>
      ),
    },
    position: { x: 250, y: 0 },
    type: "default",
  },
  {
    id: "R1",
    data: {
      label: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: "bold" }}>R1</div>
          <div style={{ fontSize: "12px" }}>VIP Path</div>
        </div>
      ),
    },
    position: { x: 100, y: 200 },
    type: "default",
  },
  {
    id: "R2",
    data: {
      label: (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: "bold" }}>R2</div>
          <div style={{ fontSize: "12px" }}>Regular Path</div>
        </div>
      ),
    },
    position: { x: 400, y: 200 },
    type: "default",
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-S1-R1",
    source: "S1",
    target: "R1",
    label: "VIP",
    animated: true,
  },
  {
    id: "e-S1-R2",
    source: "S1",
    target: "R2",
    label: "REG",
    animated: true,
  },
];

// This function converts our backend's AST JSON into the format React Flow needs
const transformAstToFlow = (ast: any) => {
  const nodes: any[] = [];
  const edges: any[] = [];
  let yPos = 0;

  ast.forEach((stateNode: any) => {
    // Collect action descriptions for display
    const actionDescriptions = stateNode.actions.map((action: any) => {
      if (action.function) {
        return `SWITCH: ${action.function}`;
      } else if (action.templateName) {
        return `TEMPLATE: ${action.templateName}`;
      } else if (action.targetStateId) {
        return `GOTO: ${action.targetStateId}`;
      }
      return "Unknown Action";
    });

    // Each state becomes a node
    nodes.push({
      id: stateNode.id,
      data: {
        label: (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "bold" }}>{stateNode.id}</div>
            {actionDescriptions.map((desc: string, index: number) => (
              <div key={index} style={{ fontSize: "10px", margin: "2px 0" }}>
                {desc}
              </div>
            ))}
          </div>
        ),
      },
      position: { x: 250, y: yPos },
      type: "default",
    });

    yPos += 200; // space nodes out vertically

    // Create edges based on action types
    stateNode.actions.forEach((action: any) => {
      // Handle GOTO actions
      if (action.targetStateId) {
        edges.push({
          id: `e-${stateNode.id}-${action.targetStateId}`,
          source: stateNode.id,
          target: action.targetStateId,
          animated: true,
        });
      }

      // Handle SWITCH actions (CALL_FUNCTION_SWITCH)
      if (action.branches) {
        for (const [label, targetId] of Object.entries(action.branches)) {
          edges.push({
            id: `e-${stateNode.id}-${targetId}-${label}`,
            source: stateNode.id,
            target: targetId,
            label: label, // e.g., "VIP", "REG"
            animated: true,
          });
        }
      }
    });
  });

  return { nodes, edges };
};

function AivaGraph() {
  const [script, setScript] = useState(
    `START_TRACK WelcomeTrack
S1. START
    CALL_FUNCTION_SWITCH customerUtils findCustomerType -> @customerType
        VIP   : R1
        REG   : R2

S2. R1
    SEND_TEMPLATE vipGreeting
    GOTO S3

S3. R2
    SEND_TEMPLATE regularGreeting`
  );

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [error, setError] = useState("");

  const generateGraph = async () => {
    try {
      setError("");
      const response = await axios.post(
        "http://localhost:8080/api/parse",
        script,
        {
          headers: { "Content-Type": "text/plain" },
        }
      );
      const { nodes: newNodes, edges: newEdges } = transformAstToFlow(
        response.data
      );
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error(err);
      setError("Failed to parse script. Check backend console.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        backgroundColor: "green",
      }}
    >
      <div style={{ padding: 20, borderRight: "1px solid #ccc" }}>
        <h2>AIVA Script</h2>
        <textarea
          rows={20}
          cols={50}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          style={{ fontFamily: "monospace" }}
        />
        <br />
        <button onClick={generateGraph} style={{ marginTop: 10 }}>
          Generate Graph
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
      <div
        style={{
          flex: 1,
          width: "100%",
          height: "100vh",
          backgroundColor: "red",
          minWidth: "400px",
          minHeight: "400px",
        }}
      >
        <p style={{ color: "white", padding: "10px" }}>ReactFlow Container</p>
        <div style={{ width: "100%", height: "calc(100% - 40px)" }}>
          <ReactFlow nodes={nodes} edges={edges} fitView>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default AivaGraph;
