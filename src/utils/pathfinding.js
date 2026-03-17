export function bfs(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  let unvisitedNodes = [startNode];
  startNode.isVisited = true;

  while (unvisitedNodes.length > 0) {
    const currentNode = unvisitedNodes.shift(); // Dequeue the first node
    
    // Skip walls
    if (currentNode.isWall) continue;

    visitedNodesInOrder.push(currentNode);

    // If we reached the target, stop and return the path history
    if (currentNode === finishNode) return visitedNodesInOrder;

    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    for (const neighbor of neighbors) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode; // Keep track of where we came from
      unvisitedNodes.push(neighbor); // Enqueue the neighbor
    }
  }
  
  return visitedNodesInOrder; // Returns all visited nodes even if finish isn't found
}

function getUnvisitedNeighbors(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  
  // Look Up, Down, Left, Right
  if (row > 0) neighbors.push(grid[row - 1][col]);
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  if (col > 0) neighbors.push(grid[row][col - 1]);
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  
  return neighbors.filter(neighbor => !neighbor.isVisited);
}

// Backtracks from the finishNode to find the shortest path
export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null && currentNode !== undefined && currentNode.previousNode) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  // Add the start node to the beginning
  if (currentNode) nodesInShortestPathOrder.unshift(currentNode);
  return nodesInShortestPathOrder;
}

export function dfs(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  const stack = [startNode];
  startNode.isVisited = true;

  while (stack.length > 0) {
    const currentNode = stack.pop(); // LIFO (Last-In, First-Out)
    
    // Skip walls
    if (currentNode.isWall) continue;

    visitedNodesInOrder.push(currentNode);

    // Stop if we hit the target
    if (currentNode === finishNode) return visitedNodesInOrder;

    const neighbors = getUnvisitedNeighbors(currentNode, grid);
    
    // Reverse the neighbors so it explores in a visually pleasing order (e.g., Up, Right, Down, Left)
    for (const neighbor of neighbors.reverse()) {
      neighbor.isVisited = true;
      neighbor.previousNode = currentNode;
      stack.push(neighbor);
    }
  }
  
  return visitedNodesInOrder;
}