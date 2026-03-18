// Standard Pythagorean theorem to find distance between two points
export const calculateDistance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

// Step 1: Assign every point to the closest centroid
export const assignClusters = (points, centroids) => {
  return points.map(point => {
    let minDistance = Infinity;
    let closestCentroidIndex = -1;
    
    centroids.forEach((centroid, idx) => {
      const dist = calculateDistance(point, centroid);
      if (dist < minDistance) {
        minDistance = dist;
        closestCentroidIndex = idx;
      }
    });
    
    return { ...point, cluster: closestCentroidIndex };
  });
};

// Step 2: Move the centroids to the average X/Y of their assigned points
export const recalculateCentroids = (points, k, oldCentroids) => {
  const newCentroids = Array.from({ length: k }, () => ({ x: 0, y: 0, count: 0 }));
  
  points.forEach(point => {
    if (point.cluster !== -1) {
      newCentroids[point.cluster].x += point.x;
      newCentroids[point.cluster].y += point.y;
      newCentroids[point.cluster].count += 1;
    }
  });
  
  return newCentroids.map((c, idx) => {
    // If a centroid loses all points, keep it where it was
    if (c.count === 0) return oldCentroids[idx];
    return { x: c.x / c.count, y: c.y / c.count };
  });
};