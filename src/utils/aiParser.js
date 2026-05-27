import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeAlgorithmLogic = async (userCode) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemPrompt = `
    You are a visual execution engine for a Linked List visualizer.
    Read the user's code. SIMULATE executing this code on a starting linked list: 
    node1(val:1) -> node2(val:2) -> node3(val:3) -> node4(val:4).

    Output a step-by-step timeline of how variables, nodes, and pointers change.
    CRITICAL: Output ONLY valid JSON. No markdown wrappers.

    JSON SCHEMA:
    {
      "execution_timeline": [
        {
          "step": <Number>,
          "line_number": <Number: approximate line of code>,
          "explanation": <String: Plain English explanation>,
          "action": <String: ENUM ["CREATE_NODE", "ASSIGN_VAR", "CHANGE_LINK"]>,
          
          "node_id": <String: If CREATE_NODE, give it a unique ID (e.g., "new_node_1"). Else null>,
          "node_val": <Number/String: If CREATE_NODE, the value inside it. Else null>,
          
          "var_name": <String: If ASSIGN_VAR, name of the variable (e.g., "prev", "dummy"). Else null>,
          
          "source_node": <String: If CHANGE_LINK, the node where the arrow starts. Else null>,
          "target_node": <String: If CHANGE_LINK or ASSIGN_VAR, the node being pointed to. Else null>
        }
      ]
    }
    
    USER CODE:
    ${userCode}
  `;

  try {
    const result = await model.generateContent(systemPrompt);
    const responseText = result.response.text();
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonString);
  } catch (error) {
    console.error("AI Parsing Error:", error);
    // Check if the error is a 503 Server Overload
    if (error.message && error.message.includes('503')) {
      throw new Error("Google AI servers are currently experiencing high demand. Please wait 10 seconds and click Run again!");
    }
    throw new Error("Could not simulate this code. Please check the syntax.");
  }
};