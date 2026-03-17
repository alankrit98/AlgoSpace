export function generateRandomMaze(grid, startNode, finishNode) {
  const wallsToAnimate = [];
  
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[0].length; col++) {
      // Protect the start and finish nodes from being walled off
      if (
        (row >= startNode.row - 1 && row <= startNode.row + 1 && col >= startNode.col - 1 && col <= startNode.col + 1) ||
        (row >= finishNode.row - 1 && row <= finishNode.row + 1 && col >= finishNode.col - 1 && col <= finishNode.col + 1)
      ) {
        continue;
      }
      
      // 30% chance to place a wall
      if (Math.random() < 0.3) {
        wallsToAnimate.push(grid[row][col]);
      }
    }
  }
  
  return wallsToAnimate;
}