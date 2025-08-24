// AivaGraph.tsx
import React, { useState } from "react";
import { parseScript } from "./http/api";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Custom Switch Node Component
const SwitchNode = ({ data }: { data: any }) => {
  return (
    <div
      style={{
        background: "#fbbf24",
        border: "2px solid #f59e0b",
        borderRadius: "50%",
        width: "80px",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#555" }}
      />
      <div
        style={{
          textAlign: "center",
          fontSize: "10px",
          fontWeight: "bold",
          color: "#92400e",
          padding: "4px",
          lineHeight: "1.1",
        }}
      >
        <div>⚡</div>
        <div>{data.functionName}</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#555" }}
      />
    </div>
  );
};

// Custom node types
const nodeTypes = {
  switch: SwitchNode,
};

/**
 * Defensive helpers to read state/action fields that backend may use
 * slightly differently. The backend sample you posted had:
 *  TrackNode[name=WelcomeTrack, states=[StateNode[trackName=S1, id=START, actions=[...]]]]
 *
 * So a state sometimes has:
 *  - state.trackName === "S1"   (the state's id)
 *  - state.id === "START"       (the state's type)
 *
 * We'll read both and fall back safely.
 */

type RawTrack = {
  name?: string;
  id?: string;
  states?: any[];
};

type RawState = {
  // backend variant 1: (trackName=S1, id=START)
  trackName?: string;
  id?: string;
  // other variant: (id=S1, type=START)
  type?: string;
  actions?: any[];
};

const safeStateKey = (track: RawTrack, state: RawState) => {
  // determine state name (S1) and state type (START)
  const stateName =
    // prefer the field that looks like an "S1" (starts with 'S' or 'R' frequently),
    // fallback order based on observed backend shapes:
    state.trackName ?? state.id ?? state.type ?? "UNKNOWN_STATE";
  const stateType = state.type ?? state.id ?? "UNKNOWN_TYPE";
  const trackName = track.name ?? track.id ?? "UNKNOWN_TRACK";
  return { trackName, stateName, stateType };
};

const transformAstToFlow = (tracks: RawTrack[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeMap = new Map<string, Node>();

  // Determine parent track (first track is usually the parent)
  const parentTrackName = tracks[0]?.name || tracks[0]?.id || "WelcomeTrack";

  // First pass: create nodes for every state and switches
  let baseY = 20;
  const trackSpacingX = 420;
  const stateSpacingY = 200;

  tracks.forEach((track, ti) => {
    const states = track.states ?? [];
    const isParentTrack = (track.name || track.id) === parentTrackName;

    // Color scheme based on track type
    const trackColors = isParentTrack
      ? {
          background: "#dbeafe",
          border: "#3b82f6",
          textColor: "#1e40af",
        }
      : {
          background: "#dcfce7",
          border: "#22c55e",
          textColor: "#15803d",
        };

    states.forEach((st: RawState, si: number) => {
      const { trackName, stateName, stateType } = safeStateKey(track, st);

      const nodeId = `${trackName}:${stateName}`; // unique node id
      const actionDescriptions: string[] = [];
      let hasSwitchAction = false;
      let switchFunction = "";
      const isReactionState =
        stateName.includes("-R") || stateName.endsWith("R");

      (st.actions ?? []).forEach((a: any) => {
        // Check if this is a switch action
        if (
          a.function &&
          (a.branches || Object.keys(a.branches || {}).length > 0)
        ) {
          hasSwitchAction = true;
          switchFunction =
            String(a.function).split(" ").pop() || String(a.function);
        } else {
          // Describe other actions for the node label
          if (a.template) {
            actionDescriptions.push(`TEMPLATE: ${String(a.template)}`);
          } else if (a.templateName) {
            actionDescriptions.push(`TEMPLATE: ${String(a.templateName)}`);
          } else if (a.channel && a.from && a.to && a.template) {
            actionDescriptions.push(`SEND: ${String(a.template)}`);
          } else if ((a as any).phase) {
            actionDescriptions.push(`PHASE: ${String(a.phase)}`);
          } else if ((a as any).target) {
            actionDescriptions.push(`GOTO: ${String(a.target)}`);
          } else if (a.label && a.target) {
            actionDescriptions.push(`BRANCH_LINE: ${String(a.label)}`);
          } else if (!a.function) {
            actionDescriptions.push("UNKNOWN_ACTION");
          }
        }
      });

      // Position calculation - reaction states are positioned to the right of their parent
      let nodeX = ti * trackSpacingX + 80;
      let nodeY = baseY + si * stateSpacingY;

      if (isReactionState) {
        // Position reaction state to the right of its parent state
        const parentStateName = stateName.replace("-R", "").replace("R", "");
        nodeX += 280; // Offset to the right
        nodeY -= 100; // Slightly higher to show connection
      }

      // Create the main state node with track-specific colors
      const node: Node = {
        id: nodeId,
        data: {
          label: (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontWeight: "bold",
                  color: trackColors.textColor,
                  fontSize: isReactionState ? "11px" : "14px",
                }}
              >
                {stateName}
                {isReactionState && " 🔄"}
              </div>
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.8,
                  color: trackColors.textColor,
                }}
              >
                {stateType}
              </div>
              {actionDescriptions.map((d, ix) => (
                <div
                  key={ix}
                  style={{
                    fontSize: 9,
                    marginTop: 2,
                    color: trackColors.textColor,
                    opacity: 0.8,
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          ),
        },
        position: { x: nodeX, y: nodeY },
        type: "default",
        style: {
          width: isReactionState ? 200 : 220,
          background: isReactionState ? "#fef3c7" : trackColors.background,
          border: `2px solid ${
            isReactionState ? "#f59e0b" : trackColors.border
          }`,
          borderRadius: "8px",
          boxShadow: isReactionState
            ? "0 2px 8px rgba(245, 158, 11, 0.3)"
            : "0 2px 4px rgba(0,0,0,0.1)",
        },
      };

      nodeMap.set(nodeId, node);

      // If this is a reaction state, connect it to its parent state
      if (isReactionState) {
        const parentStateName = stateName.replace("-R", "").replace("R", "");
        const parentNodeId = `${trackName}:${parentStateName}`;

        if (nodeMap.has(parentNodeId) || parentStateName !== stateName) {
          edges.push({
            id: `e-${parentNodeId}-reaction-${nodeId}`,
            source: parentNodeId,
            target: nodeId,
            label: "reaction",
            animated: true,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
            style: {
              stroke: "#f59e0b",
              strokeWidth: 2,
              strokeDasharray: "5,5",
            },
          } as Edge);
        }
      }

      // If there's a switch action, create a separate switch node
      if (hasSwitchAction) {
        const switchNodeId = `${nodeId}-switch`;
        const switchNode: Node = {
          id: switchNodeId,
          data: {
            functionName: switchFunction,
          },
          position: {
            x: nodeX + 70,
            y: nodeY + 120,
          },
          type: "switch",
        };

        nodeMap.set(switchNodeId, switchNode);

        // Add edge from state to switch
        edges.push({
          id: `e-${nodeId}-to-switch`,
          source: nodeId,
          target: switchNodeId,
          animated: false,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
        } as Edge);
      }
    });
  });

  // Second pass: create edges from actions
  tracks.forEach((track) => {
    const states = track.states ?? [];
    states.forEach((st: RawState) => {
      const { trackName, stateName } = safeStateKey(track, st);
      const sourceId = `${trackName}:${stateName}`;
      const switchNodeId = `${sourceId}-switch`;

      (st.actions ?? []).forEach((action: any, ai: number) => {
        // GOTO (action.target) - from regular state node
        if (action.target && !action.function) {
          const rawTarget: string = String(action.target);
          const targetId = rawTarget.includes(":")
            ? rawTarget
            : `${trackName}:${rawTarget}`;
          edges.push({
            id: `e-${sourceId}-goto-${ai}-${targetId}`,
            source: sourceId,
            target: targetId,
            label: "GOTO",
            animated: false,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
          } as Edge);
        }

        // SwitchAction branches - from switch node to targets
        if (
          action.function &&
          action.branches &&
          typeof action.branches === "object"
        ) {
          Object.entries(action.branches).forEach(([lbl, tgt], idx) => {
            const rawTarget = String(tgt);
            const targetId = rawTarget.includes(":")
              ? rawTarget
              : `${trackName}:${rawTarget}`;
            edges.push({
              id: `e-${switchNodeId}-branch-${idx}-${lbl}`,
              source: switchNodeId,
              target: targetId,
              label: lbl,
              animated: true,
              type: "smoothstep",
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { stroke: "#f59e0b", strokeWidth: 2 },
            } as Edge);
          });
        }

        // BranchAction (if backend left them) : { label, target }
        if (action.label && action.target) {
          const rawTarget = String(action.target);
          const targetId = rawTarget.includes(":")
            ? rawTarget
            : `${trackName}:${rawTarget}`;
          edges.push({
            id: `e-${sourceId}-branchline-${ai}-${action.label}`,
            source: sourceId,
            target: targetId,
            label: String(action.label),
            animated: false,
            type: "smoothstep",
            markerEnd: { type: MarkerType.ArrowClosed },
          } as Edge);
        }
      });
    });
  });

  // Finally convert nodeMap to array and return
  const finalNodes = Array.from(nodeMap.values());

  // Simple layout improvement: spread branch targets horizontally around source nodes
  // (Only reposition targets that already exist in nodeMap)
  finalNodes.forEach((src) => {
    const branchEdges = edges.filter(
      (e) => e.source === src.id && e.label && e.label !== "GOTO"
    );
    if (branchEdges.length > 0) {
      const spacing = 260;
      const startX =
        (src.position.x ?? 0) - ((branchEdges.length - 1) * spacing) / 2;
      branchEdges.forEach((e, i) => {
        const t = nodeMap.get(e.target as string);
        if (t) {
          t.position = {
            x: startX + i * spacing,
            y: (src.position.y ?? 0) + 180,
          };
        }
      });
    }
  });

  return { nodes: finalNodes, edges };
};

function AivaGraph() {
  const [script, setScript] = useState(
    `START_TRACK WelcomeTrack
S1. START
    CALL_FUNCTION_SWITCH customerUtils findCustomerType -> @customerType
R1. FORD_0K_NEW_A_NRTA > GOTO FORD_0K_NRTA_1ST_TRACK:S1

END_TRACK

START_TRACK FORD_0K_NRTA_1ST_TRACK
\tS1. START
\t\tSENDMESSAGE SMS AGENT CUST $AN_FORD_0K_NRTA_1ST_TEMP
\t\tMARK_LEAD_PHASE CONTACTED
\tEND
\tS1-R. START
\t\tUNSCHEDULE CUST
\t\tUNSCHEDULE SREP
\t\tSWITCH_DIRECTION OUTBOUND
\t\tMARK_LEAD_PHASE RESPONDED
\t\tGOTO GENERIC_NRTA_1STTEXT_TRACK_RESPONSE_HANDLER:S1
\tEND
END_TRACK`
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [error, setError] = useState("");

  const generateGraph = async () => {
    try {
      setError("");
      const ast = await parseScript(script); // expects TrackNode[]
      const { nodes: newNodes, edges: newEdges } = transformAstToFlow(ast);
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
        backgroundColor: "#07101a",
      }}
    >
      <div style={{ padding: 20, borderRight: "1px solid #ccc", width: 420 }}>
        <h2 style={{ color: "white" }}>AIVA Script</h2>
        <textarea
          rows={20}
          cols={50}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          style={{ fontFamily: "monospace", width: "100%" }}
        />
        <br />
        <button onClick={generateGraph} style={{ marginTop: 10 }}>
          Generate Graph
        </button>
        {error && <p style={{ color: "tomato" }}>{error}</p>}
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <div style={{ padding: 10, color: "white" }}>ReactFlow Container</div>
        <div style={{ width: "100%", height: "calc(100% - 40px)" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
          >
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
