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

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsLoading(true);
    setError("");
    setTimeline([]);
    setCurrentStep(-1);

    try {
      const data = await analyzeAlgorithmLogic(code);
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
    // 1. Initial State: ONLY the standard 4 nodes. No hardcoded dummies!
    const nodes = [
      { id: 'node1', val: 1, x: 250, y: 180 },
      { id: 'node2', val: 2, x: 400, y: 180 },
      { id: 'node3', val: 3, x: 550, y: 180 },
      { id: 'node4', val: 4, x: 700, y: 180 }
    ];
    
    const links = [
      { from: 'node1', to: 'node2' },
      { from: 'node2', to: 'node3' },
      { from: 'node3', to: 'node4' }
    ];

    const variables = {}; 
    let newNodeXOffset = 100; // If they create a node, spawn it on the left

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
    return { nodes, links, floatingVariables };
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-emerald-400">Source Code</h2>
            <button onClick={handleAnalyze} disabled={isLoading} className="px-4 py-2 bg-indigo-500 rounded font-bold hover:bg-indigo-400 text-sm shadow-lg shadow-indigo-500/20">
              {isLoading ? "Simulating..." : "Run Visualizer"}
            </button>
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
                        fill="transparent" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow)"
                        className="transition-all duration-500 ease-in-out"
                      />
                    );
                  })}

                  {/* 2. Draw Nodes (Circles) */}
                  {visualState.nodes.map((node) => (
                    <g 
                      key={node.id} 
                      className="transition-transform duration-500 ease-in-out"
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                      <circle cx="0" cy="0" r="20" className="fill-slate-800 stroke-slate-500 stroke-2" />
                      <text x="0" y="0" textAnchor="middle" alignmentBaseline="middle" className="fill-white font-bold">{node.val}</text>
                      <text x="0" y="40" textAnchor="middle" className="fill-slate-500 font-mono text-xs">{node.id}</text>
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