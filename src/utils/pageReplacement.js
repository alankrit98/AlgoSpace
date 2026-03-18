export const calculatePageReplacement = (pages, capacity, algorithm) => {
  let frames = Array(capacity).fill(null);
  let history = []; // Tracks the state at every single step for animation
  let faults = 0;
  let hits = 0;

  // For LRU tracking
  let lastUsed = new Map();
  // For FIFO tracking
  let queue = [];

  pages.forEach((page, stepIndex) => {
    let action = "";
    let replaced = null;

    if (frames.includes(page)) {
      // PAGE HIT: The memory is already in RAM
      action = "HIT";
      hits++;
      if (algorithm === "lru") {
        lastUsed.set(page, stepIndex); // Update last used time
      }
    } else {
      // PAGE FAULT: Not in RAM, we need to load it
      action = "FAULT";
      faults++;

      if (frames.includes(null)) {
        // RAM has empty space
        const emptyIndex = frames.indexOf(null);
        frames[emptyIndex] = page;
        if (algorithm === "fifo") queue.push(page);
        if (algorithm === "lru") lastUsed.set(page, stepIndex);
      } else {
        // RAM is full, we must replace something!
        if (algorithm === "fifo") {
          replaced = queue.shift();
          const replaceIndex = frames.indexOf(replaced);
          frames[replaceIndex] = page;
          queue.push(page);
        } else if (algorithm === "lru") {
          // Find the page with the oldest 'lastUsed' timestamp
          let oldestTime = Infinity;
          let oldestPage = null;
          frames.forEach(p => {
            if (lastUsed.get(p) < oldestTime) {
              oldestTime = lastUsed.get(p);
              oldestPage = p;
            }
          });
          replaced = oldestPage;
          const replaceIndex = frames.indexOf(replaced);
          frames[replaceIndex] = page;
          lastUsed.delete(replaced);
          lastUsed.set(page, stepIndex);
        }
      }
    }

    // Save a snapshot of this exact moment in time
    history.push({
      step: stepIndex,
      pageRequested: page,
      action: action,
      framesSnapshot: [...frames],
      replacedPage: replaced
    });
  });

  return { history, totalFaults: faults, totalHits: hits };
};