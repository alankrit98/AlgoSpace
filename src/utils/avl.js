export class AVLNode {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1; // AVL requires height tracking
  }
}

export class AVLTree {
  constructor() {
    this.root = null;
  }

  getHeight(node) {
    if (!node) return 0;
    return node.height;
  }

  getBalance(node) {
    if (!node) return 0;
    return this.getHeight(node.left) - this.getHeight(node.right);
  }

  // Right Rotation Math
  rightRotate(y) {
    let x = y.left;
    let T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

    return x; // Return new root
  }

  // Left Rotation Math
  leftRotate(x) {
    let y = x.right;
    let T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights
    x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
    y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

    return y; // Return new root
  }

  insert(value) {
    let isDuplicate = false;
    
    const insertHelper = (node, value) => {
      // 1. Perform standard BST insertion
      if (!node) return new AVLNode(value);

      if (value < node.value) {
        node.left = insertHelper(node.left, value);
      } else if (value > node.value) {
        node.right = insertHelper(node.right, value);
      } else {
        isDuplicate = true; // Value already exists
        return node;
      }

      // 2. Update height of this ancestor node
      node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

      // 3. Get the balance factor to check if it became unbalanced
      let balance = this.getBalance(node);

      // 4. If unbalanced, trigger the 4 possible rotations:
      
      // Left Left Case
      if (balance > 1 && value < node.left.value) {
        return this.rightRotate(node);
      }
      // Right Right Case
      if (balance < -1 && value > node.right.value) {
        return this.leftRotate(node);
      }
      // Left Right Case
      if (balance > 1 && value > node.left.value) {
        node.left = this.leftRotate(node.left);
        return this.rightRotate(node);
      }
      // Right Left Case
      if (balance < -1 && value < node.right.value) {
        node.right = this.rightRotate(node.right);
        return this.leftRotate(node);
      }

      return node;
    };

    this.root = insertHelper(this.root, value);
    return !isDuplicate; // Return true if successful, false if duplicate
  }
}