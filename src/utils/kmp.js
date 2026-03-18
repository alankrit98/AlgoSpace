export const kmpSearch = (text, pattern) => {
  const history = [];
  if (!text || !pattern) return { history, lps: [] };

  // 1. Build the LPS (Longest Prefix Suffix) Array
  const lps = Array(pattern.length).fill(0);
  let len = 0;
  let i = 1;
  
  while (i < pattern.length) {
    if (pattern[i] === pattern[len]) {
      len++;
      lps[i] = len;
      i++;
    } else {
      if (len !== 0) {
        len = lps[len - 1];
      } else {
        lps[i] = 0;
        i++;
      }
    }
  }

  // 2. The Search Process
  let tIdx = 0; // Index for text
  let pIdx = 0; // Index for pattern
  let shift = 0; // How far the pattern is shifted relative to the text

  while (tIdx < text.length) {
    // Record the attempt
    history.push({ action: 'compare', tIdx, pIdx, shift });

    if (pattern[pIdx] === text[tIdx]) {
      history.push({ action: 'match', tIdx, pIdx, shift });
      pIdx++;
      tIdx++;
    }

    if (pIdx === pattern.length) {
      // Full match found!
      history.push({ action: 'found', tIdx: tIdx - 1, pIdx: pIdx - 1, shift });
      pIdx = lps[pIdx - 1];
      shift = tIdx - pIdx; 
    } else if (tIdx < text.length && pattern[pIdx] !== text[tIdx]) {
      // Mismatch!
      history.push({ action: 'mismatch', tIdx, pIdx, shift });
      
      if (pIdx !== 0) {
        // The KMP Magic: Use the LPS array to slide the pattern forward without resetting tIdx
        pIdx = lps[pIdx - 1];
        shift = tIdx - pIdx;
      } else {
        tIdx++;
        shift = tIdx;
      }
    }
  }

  return { history, lps };
};