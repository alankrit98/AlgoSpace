export const calculateFCFS = (processes) => {
  let time = 0;
  let gantt = [];
  let results = [];

  // Sort purely by arrival time
  const sorted = [...processes].sort((a, b) => a.at - b.at);

  sorted.forEach((p) => {
    // If the CPU is idle waiting for the next process
    if (time < p.at) {
      gantt.push({ id: 'Idle', start: time, end: p.at });
      time = p.at;
    }
    
    // Execute the process
    gantt.push({ id: p.id, start: time, end: time + p.bt });
    time += p.bt;
    
    // Calculate metrics
    results.push({
      ...p,
      ct: time, // Completion Time
      tat: time - p.at, // Turnaround Time
      wt: (time - p.at) - p.bt // Waiting Time
    });
  });

  return { gantt, results: results.sort((a, b) => a.id.localeCompare(b.id)) };
};

export const calculateSJF = (processes) => {
  let time = 0;
  let gantt = [];
  let results = [];
  let remaining = [...processes].map(p => ({ ...p, completed: false }));
  let completedCount = 0;

  while (completedCount < processes.length) {
    // Find all processes that have arrived and are not finished
    let available = remaining.filter(p => p.at <= time && !p.completed);
    
    if (available.length === 0) {
      // CPU is idle, jump time forward to the next arriving process
      let nextArrival = Math.min(...remaining.filter(p => !p.completed).map(p => p.at));
      gantt.push({ id: 'Idle', start: time, end: nextArrival });
      time = nextArrival;
      continue;
    }

    // Sort available by Burst Time (shortest first). If tie, sort by Arrival Time.
    available.sort((a, b) => {
      if (a.bt === b.bt) return a.at - b.at;
      return a.bt - b.bt;
    });

    let p = available[0];
    
    // Execute the shortest job
    gantt.push({ id: p.id, start: time, end: time + p.bt });
    time += p.bt;
    
    // Mark as completed
    let target = remaining.find(x => x.id === p.id);
    target.completed = true;
    completedCount++;

    results.push({
      id: p.id,
      at: p.at,
      bt: p.bt,
      ct: time,
      tat: time - p.at,
      wt: (time - p.at) - p.bt
    });
  }
  
  return { gantt, results: results.sort((a, b) => a.id.localeCompare(b.id)) };
};

export const calculateRR = (processes, timeQuantum = 2) => {
  let time = 0;
  let gantt = [];
  let results = [];
  
  // Clone and add tracking variables
  let remaining = processes.map(p => ({ ...p, rem_bt: p.bt, completed: false, inQueue: false }));
  let readyQueue = [];
  let completedCount = 0;
  let n = processes.length;

  // Sort by arrival initially to find the first arriving processes
  remaining.sort((a, b) => a.at - b.at);

  let i = 0;
  // Push all processes that arrive at time 0
  while (i < n && remaining[i].at <= time) {
    readyQueue.push(remaining[i]);
    remaining[i].inQueue = true;
    i++;
  }

  while (completedCount < n) {
    // If the queue is empty but processes are arriving later (Idle Time)
    if (readyQueue.length === 0) {
      let nextArrival = remaining.find(p => !p.completed && !p.inQueue);
      if (nextArrival) {
        gantt.push({ id: 'Idle', start: time, end: nextArrival.at });
        time = nextArrival.at;
        
        while (i < n && remaining[i].at <= time) {
          readyQueue.push(remaining[i]);
          remaining[i].inQueue = true;
          i++;
        }
      }
      continue;
    }

    // Dequeue the next process
    let p = readyQueue.shift();
    
    // Execute for either the Time Quantum or whatever burst time is left
    let executeTime = Math.min(p.rem_bt, timeQuantum);

    // Merge adjacent blocks if the same process runs consecutively (edge cases)
    if (gantt.length > 0 && gantt[gantt.length - 1].id === p.id) {
      gantt[gantt.length - 1].end += executeTime;
    } else {
      gantt.push({ id: p.id, start: time, end: time + executeTime });
    }
    
    time += executeTime;
    p.rem_bt -= executeTime;

    // VERY IMPORTANT: Check for NEW arrivals during this execution window and queue them FIRST
    while (i < n && remaining[i].at <= time) {
      readyQueue.push(remaining[i]);
      remaining[i].inQueue = true;
      i++;
    }

    // If the current process still has work to do, push it to the BACK of the queue
    if (p.rem_bt > 0) {
      readyQueue.push(p);
    } else {
      p.completed = true;
      completedCount++;
      results.push({
        id: p.id,
        at: p.at,
        bt: p.bt,
        ct: time,
        tat: time - p.at,
        wt: (time - p.at) - p.bt
      });
    }
  }

  // Sort results back by Process ID for the table
  return { gantt, results: results.sort((a, b) => a.id.localeCompare(b.id)) };
};