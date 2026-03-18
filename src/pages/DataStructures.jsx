import { useState } from "react";
import { BST } from "../utils/bst";
import { AVLTree } from "../utils/avl";

export default function DataStructures() {
  const [tree, setTree] = useState(new BST());
  const [treeType, setTreeType] = useState("bst");
  const [inputValue, setInputValue] = useState("");
  const [nodesToRender, setNodesToRender] = useState([]);
  const [linesToRender, setLinesToRender] = useState([]);

  // Calculate coordinates and populate rendering arrays
  const updateVisuals = (currentTree) => {
    const nodes = [];
    const lines = [];

    const traverse = (node, x, y, level) => {
      if (!node) return;

      // The horizontal spacing shrinks as you go deeper down the tree to prevent overlaps
      const horizontalSpacing = 400 / Math.pow(2, level);
      const verticalSpacing = 70;

      if (node.left) {
        const leftX = x - horizontalSpacing;
        const leftY = y + verticalSpacing;
        lines.push({
          id: `line-${node.value}-L`,
          x1: x,
          y1: y,
          x2: leftX,
          y2: leftY,
        });
        traverse(node.left, leftX, leftY, level + 1);
      }

      if (node.right) {
        const rightX = x + horizontalSpacing;
        const rightY = y + verticalSpacing;
        lines.push({
          id: `line-${node.value}-R`,
          x1: x,
          y1: y,
          x2: rightX,
          y2: rightY,
        });
        traverse(node.right, rightX, rightY, level + 1);
      }

      // Add the node itself AFTER lines, so circles render on top of the lines
      nodes.push({ id: node.value, value: node.value, x, y });
    };

    if (currentTree.root) {
      traverse(currentTree.root, 400, 50, 1); // Start root at center top (400, 50)
    }

    setNodesToRender(nodes);
    setLinesToRender(lines);
  };

  const handleInsert = (e) => {
    e.preventDefault();
    const val = parseInt(inputValue);
    if (isNaN(val)) return;

    // Create a new instance based on the current dropdown selection
    const newTree = treeType === "bst" ? new BST() : new AVLTree();
    newTree.root = tree.root; // Copy the existing root

    const success = newTree.insert(val);
    if (success) {
      setTree(newTree);
      updateVisuals(newTree);
    } else {
      alert("Value already exists in the tree!");
    }
    setInputValue("");
  };

  const clearTree = (type = treeType) => {
    setTree(type === "bst" ? new BST() : new AVLTree());
    setNodesToRender([]);
    setLinesToRender([]);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setTreeType(newType);
    clearTree(newType); // Automatically clear the board when switching modes
  };

  return (
    <div className="flex flex-col items-center min-h-full bg-slate-950 p-4 sm:p-8 font-sans text-white">
      <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Trees (Data Structures)</h1>
          <p className="text-slate-400 mt-1">
            Visualize Binary Search Tree (BST) insertions.
          </p>
        </div>

        <form onSubmit={handleInsert} className="flex gap-2 items-center">
          {/* DROPDOWN */}
          <select
            value={treeType}
            onChange={handleTypeChange}
            className="bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm font-bold"
          >
            <option value="bst">Standard BST</option>
            <option value="avl">AVL Tree (Auto-Balancing)</option>
          </select>

          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter a number..."
            className="bg-slate-900 border border-slate-700 rounded-md px-4 py-2 text-white focus:outline-none focus:border-emerald-500 w-40"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-400 transition font-bold shadow-lg shadow-emerald-500/20"
          >
            Insert
          </button>
          <button
            type="button"
            onClick={() => clearTree(treeType)}
            className="px-4 py-2 bg-slate-800 rounded-md hover:bg-slate-700 transition font-medium border border-slate-700"
          >
            Clear
          </button>
        </form>
      </div>

      {/* The SVG Canvas */}
      <div className="w-full bg-slate-900 rounded-lg border border-slate-800 shadow-2xl overflow-x-auto overflow-y-hidden">
        <div className="min-w-[800px] flex justify-center">
          <svg width="800" height="500" className="bg-slate-900">
            {/* Draw Lines First */}
            {linesToRender.map((line) => (
              <line
                key={line.id}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#334155" // slate-700
                strokeWidth="2"
                className="transition-all duration-500"
              />
            ))}

            {/* Draw Nodes Second */}
            {nodesToRender.map((node) => (
              <g key={node.id} className="transition-all duration-500">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  className="fill-slate-800 stroke-emerald-500 stroke-2 drop-shadow-lg transition-all duration-500"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="fill-white font-bold text-sm pointer-events-none"
                >
                  {node.value}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
