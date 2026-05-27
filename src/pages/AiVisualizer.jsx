import { useState } from 'react';
import { analyzeAlgorithmLogic } from '../utils/aiParser';

const defaultCode = `def swapPairs(head):
    dummy = ListNode(0)
    dummy.next = head
    prev = dummy

    while prev.next and prev.next.next:
        first = prev.next
        second = prev.next.next

        # The actual swap
        prev.next = second
        first.next = second.next
        second.next = first

        prev = first

    return dummy.next`;

export default function AiVisualizer() {
  const [code, setCode] = useState(defaultCode);
  const [timeline, setTimeline] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [startingState, setStartingState] = useState("standard");

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError("");
    setTimeline([]);
    setCurrentStep(-1);

    try {
      const data = await analyzeAlgorithmLogic(code, startingState);
      if (data && data.execution_timeline) {
        setTimeline(data.execution_timeline);
        setCurrentStep(0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => currentStep < timeline.length - 1 && setCurrentStep(prev => prev + 1);
  const prevStep = () => currentStep > 0 && setCurrentStep(prev => prev - 1);
  const activeFrame = currentStep >= 0 ? timeline[currentStep] : null;

  // --- DERIVED SVG STATE ---
  const calculateVisualState = () => {
    // 1. Initial State: Dynamically generated based on the dropdown!
    let nodes = [];
    let links = [];

    switch (startingState) {
      case "empty":
        nodes = [];
        links = [];
        break;
      case "single":
        nodes = [{ id: 'node1', val: 1, x: 250, y: 180 }];
        links = [];
        break;
      case "cycle":
        nodes = [
          { id: 'node1', val: 1, x: 250, y: 180 },
          { id: 'node2', val: 2, x: 400, y: 180 },
          { id: 'node3', val: 3, x: 550, y: 180 }
        ];
        links = [
          { from: 'node1', to: 'node2' },
          { from: 'node2', to: 'node3' },
          { from: 'node3', to: 'node2' } // The Cycle!
        ];
        break;
      case "standard":
      default:
        nodes = [
          { id: 'node1', val: 1, x: 250, y: 180 },
          { id: 'node2', val: 2, x: 400, y: 180 },
          { id: 'node3', val: 3, x: 550, y: 180 },
          { id: 'node4', val: 4, x: 700, y: 180 }
        ];
        links = [
          { from: 'node1', to: 'node2' },
          { from: 'node2', to: 'node3' },
          { from: 'node3', to: 'node4' }
        ];
    }

    const variables = {}; 
    let newNodeXOffset = 100;

    // Safe fallback if history hasn't started
    const floatingVariables = [];
    if (currentStep < 0) return { nodes, links, floatingVariables };

    const historySoFar = timeline.slice(0, currentStep + 1);

    historySoFar.forEach((frame) => {
      // DYNAMIC NODE CREATION
      if (frame.action === "CREATE_NODE" && frame.node_id) {
        nodes.push({ id: frame.node_id, val: frame.node_val, x: newNodeXOffset, y: 180 });
        newNodeXOffset += 100;
      }

      // CHANGE POINTER ARROWS
      if (frame.action === "CHANGE_LINK" && frame.source_node) {
        const existingIdx = links.findIndex(l => l.from === frame.source_node);
        if (existingIdx !== -1) links.splice(existingIdx, 1);
        
        if (frame.target_node && frame.target_node !== "null") {
          links.push({ from: frame.source_node, to: frame.target_node });
        }
      }
      
      // MOVE VARIABLE LABELS
      if (frame.action === "ASSIGN_VAR" && frame.var_name) {
        if (frame.target_node === "null") {
          delete variables[frame.var_name];
        } else {
          variables[frame.var_name] = frame.target_node;
        }
      }
    });

    // ------------------------------------------------
    // GARBAGE COLLECTION (Mark and Sweep Algorithm)
    // ------------------------------------------------
    const reachableNodes = new Set();
    
    // 1. MARK: Find all "Roots" (Nodes that have a variable pointing to them)
    Object.values(variables).forEach(targetId => reachableNodes.add(targetId));

    // 2. SWEEP: Traverse the arrows to find all connected children
    let addedNewNode;
    do {
      addedNewNode = false;
      links.forEach(link => {
        // If the source node is alive, the node it points to is also alive!
        if (reachableNodes.has(link.from) && !reachableNodes.has(link.to)) {
          reachableNodes.add(link.to);
          addedNewNode = true;
        }
      });
    } while (addedNewNode); // Keep sweeping until we hit the end of the lists

    // 3. APPLY GARBAGE FLAG
    // Only run the GC if the AI has started assigning variables (so nodes don't vanish on page load)
    const isSimulating = Object.keys(variables).length > 0;
    
    const finalNodes = nodes.map(node => ({
      ...node,
      isGarbage: isSimulating ? !reachableNodes.has(node.id) : false
    }));

    const finalLinks = links.map(link => ({
      ...link,
      isGarbage: isSimulating ? !reachableNodes.has(link.from) : false
    }));
    // ------------------------------------------------

    // Calculate independent coordinates for the floating variable tags
    const varStackingCount = {}; 

    Object.keys(variables).forEach((varName) => {
      const targetId = variables[varName];
      const targetNode = nodes.find(n => n.id === targetId);
      
      if (targetNode) {
        if (!varStackingCount[targetId]) varStackingCount[targetId] = 0;
        
        floatingVariables.push({
          id: varName,
          name: varName,
          x: targetNode.x,
          y: targetNode.y - 45 - (varStackingCount[targetId] * 25) // Stacks them visually!
        });
        
        varStackingCount[targetId]++;
      }
    });

    // We exclusively return these 3 arrays for the JSX to map over.
    return { nodes: finalNodes, links: finalLinks, floatingVariables };
  };

  const visualState = calculateVisualState();

  return (
    <div className="flex flex-col items-center min-h-full bg-slate-950 p-4 sm:p-8 font-sans text-white">
      <div className="w-full max-w-7xl mb-8">
        <h1 className="text-3xl font-bold">Code Execution Visualizer</h1>
        <p className="text-slate-400 mt-1">Watch variables and pointers move dynamically across nodes.</p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px]">
        {/* Editor */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-full">
          <div className="flex flex-col mb-4 gap-3">
            <h2 className="font-bold text-emerald-400 whitespace-nowrap">Source Code</h2>
            
            <div className="flex gap-2 w-full">
              <select 
                value={startingState}
                onChange={(e) => {
                  setStartingState(e.target.value);
                  setTimeline([]); 
                  setCurrentStep(-1);
                }}
                disabled={isLoading}
                className="flex-1 w-full min-w-0 bg-slate-950 border border-slate-800 text-slate-300 text-sm rounded px-2 py-2 outline-none focus:border-indigo-500 truncate"
              >
                <option value="standard">Standard (4 Nodes)</option>
                <option value="empty">Empty List</option>
                <option value="single">Single Node</option>
                <option value="cycle">Cycle (3 Nodes)</option>
              </select>

              <button onClick={handleAnalyze} disabled={isLoading} className="px-3 py-2 bg-indigo-500 rounded font-bold hover:bg-indigo-400 text-sm shadow-lg shadow-indigo-500/20 whitespace-nowrap shrink-0">
                {isLoading ? "Simulating..." : "Run Visualizer"}
              </button>
            </div>
          </div>
          <textarea 
  value={code} 
  onChange={(e) => setCode(e.target.value)} 
  wrap="off"
  className="flex-1 bg-slate-950 border border-slate-800 rounded text-slate-300 font-mono text-sm p-4 resize-none whitespace-pre overflow-x-auto no-scrollbar" 
/>
        </div>

        {/* Player */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col relative h-full">
          {timeline.length === 0 && !isLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 italic">Hit "Run Visualizer" to trace pointer movements.</div>
          ) : (
            <div className="flex flex-col h-full gap-4">
              {/* Controls */}
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded border border-slate-800">
                <button onClick={prevStep} disabled={currentStep <= 0} className="px-4 py-2 bg-slate-800 rounded hover:bg-slate-700 disabled:opacity-50">◀ Prev</button>
                <span className="font-mono text-slate-400">Step {currentStep >= 0 ? currentStep + 1 : 0} of {timeline.length}</span>
                <button onClick={nextStep} disabled={currentStep === timeline.length - 1} className="px-4 py-2 bg-indigo-500 rounded hover:bg-indigo-400 disabled:opacity-50 shadow-md">Next ▶</button>
              </div>

              {/* Explanation */}
              {activeFrame && (
                <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase">AI Explanation</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">Line: {activeFrame.line_number}</span>
                  </div>
                  <p className="text-lg text-slate-200">{activeFrame.explanation}</p>
                </div>
              )}

              {/* SVG Canvas */}
              <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 mt-2 relative overflow-x-auto no-scrollbar">
                <svg className="w-full h-full min-w-[800px] min-h-[350px]">
                  <defs>
  <marker 
    id="arrow" 
    markerWidth="14" 
    markerHeight="14" 
    refX="31" 
    refY="7" 
    orient="auto-start-reverse"
    markerUnits="userSpaceOnUse" 
  >
    <path d="M 0 0 L 14 7 L 0 14 z" fill="#10b981" />
  </marker>
</defs>

                  {/* 1. Draw Arrows */}
                  {visualState.links.map((link, idx) => {
                    const source = visualState.nodes.find(n => n.id === link.from);
                    const target = visualState.nodes.find(n => n.id === link.to);
                    if (!source || !target) return null;

                    const isAdjacent = Math.abs(source.x - target.x) <= 150;
                    const pathD = isAdjacent 
                      ? `M ${source.x} ${source.y} L ${target.x} ${target.y}`
                      : `M ${source.x} ${source.y} Q ${(source.x + target.x)/2} ${source.y - 120} ${target.x} ${target.y}`;

                    return (
                      <path 
                        key={`${link.from}-${link.to}-${idx}`} 
                        d={pathD} 
                        fill="transparent" 
                        // If it's garbage, turn it red and make it thin. Otherwise, green!
                        stroke={link.isGarbage ? "#ef4444" : "#10b981"} 
                        strokeWidth={link.isGarbage ? "1" : "3"} 
                        markerEnd={link.isGarbage ? "" : "url(#arrow)"} 
                        className={`transition-all duration-500 ease-in-out ${link.isGarbage ? 'opacity-20 stroke-dasharray-4' : 'opacity-100'}`}
                      />
                    );
                  })}

                  {/* 2. Draw Nodes (Circles) */}
                  {visualState.nodes.map((node) => (
                    <g 
                      key={node.id} 
                      // If it's garbage, fade the whole group out
                      className={`transition-all duration-500 ease-in-out ${node.isGarbage ? 'opacity-30 scale-90 grayscale' : 'opacity-100 scale-100'}`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                      <circle 
                        cx="0" cy="0" r="20" 
                        className={`stroke-2 transition-colors duration-500 ${node.isGarbage ? 'fill-red-950 stroke-red-500 stroke-dasharray-4' : 'fill-slate-800 stroke-slate-500'}`} 
                      />
                      <text x="0" y="0" textAnchor="middle" alignmentBaseline="middle" className={`font-bold transition-colors duration-500 ${node.isGarbage ? 'fill-red-400' : 'fill-white'}`}>
                        {node.val}
                      </text>
                      <text x="0" y="40" textAnchor="middle" className={`font-mono text-xs transition-colors duration-500 ${node.isGarbage ? 'fill-red-500/50' : 'fill-slate-500'}`}>
                        {node.id}
                      </text>
                    </g>
                  ))}

                  {/* 3. Draw Floating Variable Tags */}
                  {visualState.floatingVariables.map((v) => (
                    <g 
                      key={v.id} 
                      className="transition-transform duration-500 ease-in-out"
                      style={{ transform: `translate(${v.x}px, ${v.y}px)` }}
                    >
                      <rect 
                        x="-30" y="-15" 
                        width="60" height="20" rx="4" 
                        className="fill-indigo-900 border border-indigo-400"
                      />
                      <text 
                        x="0" y="-1" 
                        textAnchor="middle" 
                        className="fill-indigo-300 font-mono text-[10px] font-bold"
                      >
                        {v.name}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}