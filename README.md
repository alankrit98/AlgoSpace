# 🚀 AlgoSpace - Interactive CS Library

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

**AlgoSpace** is a high-performance, Full-Stack visualization platform designed to demystify complex Computer Science algorithms through real-time interactive rendering. 

Built with React and Tailwind CSS, this platform bypasses standard virtual DOM bottlenecks to achieve smooth, 60FPS animations for recursive backtracking, mathematical clustering, and heuristic pathfinding.

🔗 **Live Demo:** [AlgoSpace](https://algospace-al.vercel.app)

---

## 🧠 Interactive Modules

AlgoSpace currently features 8 distinct mathematical and algorithmic engines:

1. **Pathfinding (Graphs)**
   - Visualizes **Breadth-First Search (BFS)**, **Depth-First Search (DFS)**, and **A* (A-Star)**.
   - Includes custom obstacle generation (Walls) and weighted terrain (Mud) to demonstrate how heuristics dynamically alter pathing decisions.
2. **Backtracking (Logical Puzzles)**
   - Visualizes the recursive **N-Queens Problem**.
   - Animates the call stack visually as the algorithm places queens, hits dead ends, and rewinds its state matrix to find valid configurations on an N x N chessboard.
3. **Machine Learning (AI)**
   - Interactive **K-Means Clustering** engine.
   - Scatters randomized data points and animates $k$ centroids as they mathematically converge on the center of mass using Pythagorean distance calculations.
4. **Trees (Data Structures)**
   - Dynamic SVG rendering of **Binary Search Trees (BST)** and self-balancing **AVL Trees**.
   - Demonstrates visual node rotations when the AVL balance factor exceeds `[-1, 1]`.
5. **String Searching**
   - Visualizes the **Knuth-Morris-Pratt (KMP)** $O(N+M)$ pattern matching algorithm.
   - Generates the Longest Prefix Suffix (LPS) array and animates the sliding window skipping redundant text comparisons.
6. **CPU Scheduling (OS)**
   - Generates dynamic Gantt charts calculating Turnaround Time (TAT) and Waiting Time (WT).
   - Simulates **First-Come, First-Served (FCFS)**, **Shortest Job First (SJF)**, and preemptive **Round Robin (RR)** with customizable Time Quantums.
7. **Memory Management (OS)**
   - Simulates physical RAM constraints and calculates Page Hits vs. Page Faults.
   - Visualizes both **Least Recently Used (LRU)** and **First-In, First-Out (FIFO)** page replacement algorithms.
8. **Sorting Algorithms**
   - Real-time visual comparison of Time & Space complexity using **Merge Sort**, **Quick Sort**, and **Bubble Sort** on randomized arrays.

---

## 🛠️ Technical Architecture & Highlights

- **Separation of Concerns:** All pure mathematical logic (heuristics, tree rotations, recursive backtracking) is isolated in pure JavaScript utility files (`/src/utils`), ensuring the React UI components act strictly as a rendering layer.
- **Optimized Rendering:** Utilized direct DOM manipulation (`document.getElementById`) for heavy graph animations (like A* Pathfinding) to prevent React state batching from crashing the browser during massive `while` loops.
- **Dynamic SVG Generation:** Engineered custom math to recursively calculate non-overlapping horizontal spacing `(400 / 2^level)` for perfect tree branch rendering at any depth.
- **Custom CSS Animations:** Implemented `.no-scrollbar` utilities and `scale-in` keyframes to ensure a premium, sleek dark-mode aesthetic across all viewports.

---

## 💻 Local Development Setup

To run AlgoSpace locally, clone the repository and run the following commands:

```
1. Clone the repository
git clone https://github.com/alankrit98/algospace.git

2. Navigate into the directory
cd algospace

3. Install dependencies
npm install

4. Start the Vite development server
npm run dev
The application will be available at http://localhost:5173.
```

👨‍💻 Author
[Alankrit Agarwal](https://www.linkedin.com/in/alankrit-agarwal)

Full-Stack Developer

If you found this project helpful for understanding CS concepts, feel free to star the repository!