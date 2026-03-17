// BUBBLE SORT
export const bubbleSort = async (array, callbacks) => {
  const { setArray, setComparing, setHistoryLog, setComparisons, setSwaps, tick } = callbacks;
  
  setHistoryLog(prev => [...prev, "Starting Bubble Sort..."]);
  let arr = [...array]; 
  let n = arr.length;

  for (let i = 0; i < n; i++) {
    let swappedThisPass = false;
    for (let j = 0; j < n - i - 1; j++) {
      setComparing([j, j + 1]);
      setHistoryLog(prev => [...prev, `Comparing ${arr[j]} and ${arr[j+1]}...`]);
      setComparisons(prev => prev + 1); // Increment comparison
      await tick(); 

      if (arr[j] > arr[j + 1]) {
        setHistoryLog(prev => [...prev, `👉 Swapping ${arr[j]} and ${arr[j+1]}`]);
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        
        setArray([...arr]); 
        setSwaps(prev => prev + 1); // Increment swap
        swappedThisPass = true;
        await tick(0.5); // Fast tick for the swap visual
      }
    }
    if (!swappedThisPass) break; 
  }
  setHistoryLog(prev => [...prev, "🎉 Bubble Sort Complete!"]);
};

// INSERTION SORT
export const insertionSort = async (array, callbacks) => {
  const { setArray, setComparing, setHistoryLog, setComparisons, setSwaps, tick } = callbacks;

  setHistoryLog(prev => [...prev, "Starting Insertion Sort..."]);
  let arr = [...array];
  let n = arr.length;

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    
    setHistoryLog(prev => [...prev, `Picking ${key} to insert...`]);
    
    while (j >= 0) {
      setComparing([j, j + 1]);
      setComparisons(prev => prev + 1);
      
      if (arr[j] > key) {
        setHistoryLog(prev => [...prev, `👉 ${arr[j]} > ${key}, moving ${arr[j]} right.`]);
        await tick();
        
        arr[j + 1] = arr[j];
        setArray([...arr]);
        setSwaps(prev => prev + 1);
        j = j - 1;
      } else {
        await tick();
        break; // Found the spot
      }
    }
    arr[j + 1] = key;
    setArray([...arr]);
    setSwaps(prev => prev + 1);
    setHistoryLog(prev => [...prev, `Inserted ${key} at position ${j + 1}.`]);
    await tick();
  }
  setHistoryLog(prev => [...prev, "🎉 Insertion Sort Complete!"]);
};

// SELECTION SORT
export const selectionSort = async (array, callbacks) => {
  const { setArray, setComparing, setHistoryLog, setComparisons, setSwaps, tick } = callbacks;

  setHistoryLog(prev => [...prev, "Starting Selection Sort..."]);
  let arr = [...array];
  let n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let min_idx = i;
    setHistoryLog(prev => [...prev, `Scanning for minimum element...`]);

    for (let j = i + 1; j < n; j++) {
      setComparing([min_idx, j]);
      setComparisons(prev => prev + 1);
      await tick(0.5); 

      if (arr[j] < arr[min_idx]) {
        min_idx = j;
        setHistoryLog(prev => [...prev, `New minimum found: ${arr[min_idx]}`]);
      }
    }
    
    if (min_idx !== i) {
      setComparing([i, min_idx]);
      setHistoryLog(prev => [...prev, `👉 Swapping ${arr[i]} with minimum ${arr[min_idx]}`]);
      await tick();
      let temp = arr[i];
      arr[i] = arr[min_idx];
      arr[min_idx] = temp;
      setArray([...arr]);
      setSwaps(prev => prev + 1);
    } else {
      setHistoryLog(prev => [...prev, `${arr[i]} is already in place.`]);
    }
  }
  setHistoryLog(prev => [...prev, "🎉 Selection Sort Complete!"]);
};

// QUICK SORT
export const quickSort = async (array, callbacks) => {
  const { setArray, setComparing, setHistoryLog, setComparisons, setSwaps, tick } = callbacks;

  setHistoryLog(prev => [...prev, "Starting Quick Sort..."]);
  let arr = [...array];
  
  const qsHelper = async (arr, low, high) => {
    if (low < high) {
      let pivotIndex = await partition(arr, low, high);
      await qsHelper(arr, low, pivotIndex - 1);
      await qsHelper(arr, pivotIndex + 1, high);
    }
  };

  const partition = async (arr, low, high) => {
    let pivot = arr[high];
    setHistoryLog(prev => [...prev, `Pivot chosen: ${pivot}`]);
    let i = low - 1;

    for (let j = low; j < high; j++) {
      setComparing([j, high]);
      setComparisons(prev => prev + 1);
      await tick();

      if (arr[j] < pivot) {
        i++;
        setHistoryLog(prev => [...prev, `👉 Swapping ${arr[i]} and ${arr[j]}`]);
        let temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
        setArray([...arr]);
        setSwaps(prev => prev + 1);
        await tick(0.5);
      }
    }
    
    setHistoryLog(prev => [...prev, `Placing pivot ${pivot} in correct position`]);
    let temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    setArray([...arr]);
    setSwaps(prev => prev + 1);
    await tick();
    
    return i + 1;
  };

  await qsHelper(arr, 0, arr.length - 1);
  setHistoryLog(prev => [...prev, "🎉 Quick Sort Complete!"]);
};

// MERGE SORT
export const mergeSort = async (array, callbacks) => {
  const { setArray, setComparing, setHistoryLog, setComparisons, setSwaps, tick } = callbacks;

  setHistoryLog(prev => [...prev, "Starting Merge Sort..."]);
  let arr = [...array];

  const mergeSortHelper = async (arr, l, r) => {
    if (l >= r) return;
    const m = l + Math.floor((r - l) / 2);
    await mergeSortHelper(arr, l, m);
    await mergeSortHelper(arr, m + 1, r);
    await merge(arr, l, m, r);
  };

  const merge = async (arr, l, m, r) => {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    let i = 0, j = 0, k = l;
    
    const mergeMsg = `Merging segments: [${L.join(', ')}] and [${R.join(', ')}]`;
    setHistoryLog(prev => [...prev, mergeMsg]);

    while (i < n1 && j < n2) {
      setComparing([k]); 
      
      const compMsg = `Comparing ${L[i]} and ${R[j]}...`;
      setHistoryLog(prev => [...prev, compMsg]);
      setComparisons(prev => prev + 1);
      await tick();
      
      if (L[i] <= R[j]) {
        const logMsg = `👉 ${L[i]} is smaller/equal. Placing it.`;
        setHistoryLog(prev => [...prev, logMsg]);
        arr[k] = L[i];
        i++;
      } else {
        const logMsg = `👉 ${R[j]} is smaller. Placing it.`;
        setHistoryLog(prev => [...prev, logMsg]);
        arr[k] = R[j];
        j++;
      }
      
      setArray([...arr]);
      setSwaps(prev => prev + 1); // Array write
      await tick(0.5);
      k++;
    }

    while (i < n1) {
      const logMsg = `Placing remaining ${L[i]}`;
      setHistoryLog(prev => [...prev, logMsg]);
      arr[k] = L[i];
      setComparing([k]);
      setArray([...arr]);
      setSwaps(prev => prev + 1);
      await tick(0.5);
      i++; k++;
    }
    
    while (j < n2) {
      const logMsg = `Placing remaining ${R[j]}`;
      setHistoryLog(prev => [...prev, logMsg]);
      arr[k] = R[j];
      setComparing([k]);
      setArray([...arr]);
      setSwaps(prev => prev + 1);
      await tick(0.5);
      j++; k++;
    }
  };

  await mergeSortHelper(arr, 0, arr.length - 1);
  setHistoryLog(prev => [...prev, "🎉 Merge Sort Complete!"]);
};