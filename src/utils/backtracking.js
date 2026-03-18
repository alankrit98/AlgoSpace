export const solveNQueens = (n) => {
  const history = [];
  const board = Array(n).fill().map(() => Array(n).fill(false));

  const isSafe = (row, col) => {
    // Check column above
    for (let i = 0; i < row; i++) {
      if (board[i][col]) return false;
    }
    // Check upper left diagonal
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j]) return false;
    }
    // Check upper right diagonal
    for (let i = row, j = col; i >= 0 && j < n; i--, j++) {
      if (board[i][j]) return false;
    }
    return true;
  };

  const solve = (row) => {
    // Base Case: All queens are safely placed
    if (row === n) {
      history.push({ board: board.map(r => [...r]), action: 'success' });
      return true;
    }

    let foundSolution = false;
    
    for (let col = 0; col < n; col++) {
      // 1. Try placing a queen here
      history.push({ board: board.map(r => [...r]), row, col, action: 'try' });
      
      if (isSafe(row, col)) {
        // 2. It's safe! Place it.
        board[row][col] = true;
        history.push({ board: board.map(r => [...r]), row, col, action: 'place' });
        
        // 3. Recursively try to place the rest of the queens
        foundSolution = solve(row + 1) || foundSolution; 
        
        if (!foundSolution) {
          // 4. BACKTRACK: We hit a dead end. Remove the queen and try the next column.
          board[row][col] = false;
          history.push({ board: board.map(r => [...r]), row, col, action: 'remove' });
        } else {
          return true; // Stop searching once we find the first valid solution
        }
      } else {
        // Not safe, record the invalid attempt
        history.push({ board: board.map(r => [...r]), row, col, action: 'invalid' });
      }
    }
    return foundSolution;
  };

  solve(0);
  return history;
};