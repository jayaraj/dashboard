export class Edge {
  inputNode: Node;
  outputNode: Node;

  _linkTo(node, direction) {
    if (direction <= 0) {
      node.inputEdges.push(this);
    }

    if (direction >= 0) {
      node.outputEdges.push(this);
    }

    node.edges.push(this);
  }

  link(inputNode: Node, outputNode: Node) {
    this.unlink();
    this.inputNode = inputNode;
    this.outputNode = outputNode;

    this._linkTo(inputNode, 1);
    this._linkTo(outputNode, -1);
    return this;
  }

  unlink() {
    let pos;
    let inode = this.inputNode;
    let onode = this.outputNode;

    if (!(inode && onode)) {
      return;
    }

    pos = inode.edges.indexOf(this);
    if (pos > -1) {
      inode.edges.splice(pos, 1);
    }

    pos = onode.edges.indexOf(this);
    if (pos > -1) {
      onode.edges.splice(pos, 1);
    }

    pos = inode.outputEdges.indexOf(this);
    if (pos > -1) {
      inode.outputEdges.splice(pos, 1);
    }

    pos = onode.inputEdges.indexOf(this);
    if (pos > -1) {
      onode.inputEdges.splice(pos, 1);
    }

    this.inputNode = null;
    this.outputNode = null;
  }
}

export class Node {
  name: string;
  edges: Edge[];
  inputEdges: Edge[];
  outputEdges: Edge[];

  constructor(name: string) {
    this.name = name;
    this.edges = [];
    this.inputEdges = [];
    this.outputEdges = [];
  }

  getEdgeFrom(from: string | Node): Edge {
    if (!from) {
      return null;
    }

    if (typeof from === 'object') {
      return this.inputEdges.find(e => e.inputNode.name === from.name);
    }

    return this.inputEdges.find(e => e.inputNode.name === from);
  }

  getEdgeTo(to: string | Node): Edge {
    if (!to) {
      return null;
    }

    if (typeof to === 'object') {
      return this.outputEdges.find(e => e.outputNode.name === to.name);
    }

    return this.outputEdges.find(e => e.outputNode.name === to);
  }

  getOptimizedInputEdges(): Edge[] {
    let toBeRemoved = [];
    this.inputEdges.forEach(e => {
      let inputEdgesNodes = e.inputNode.inputEdges.map(e => e.inputNode);

      inputEdgesNodes.forEach(n => {
        let edgeToRemove = n.getEdgeTo(this.name);
        if (edgeToRemove) {
          toBeRemoved.push(edgeToRemove);
        }
      });
    });

    return this.inputEdges.filter(e => toBeRemoved.indexOf(e) === -1);
  }
}

export class Graph {
  nodes = {};

  constructor() {}

  createNode(name: string): Node {
    const n = new Node(name);
    this.nodes[name] = n;
    return n;
  }

  createNodes(names: string[]): Node[] {
    let nodes = [];
    names.forEach(name => {
      nodes.push(this.createNode(name));
    });
    return nodes;
  }

  link(input: string | string[] | Node | Node[], output: string | string[] | Node | Node[]): Edge[] {
    let inputArr = [];
    let outputArr = [];
    let inputNodes = [];
    let outputNodes = [];

    if (input instanceof Array) {
      inputArr = input;
    } else {
      inputArr = [input];
    }

    if (output instanceof Array) {
      outputArr = output;
    } else {
      outputArr = [output];
    }

    for (let n = 0; n < inputArr.length; n++) {
      const i = inputArr[n];
      if (typeof i === 'string') {
        inputNodes.push(this.getNode(i));
      } else {
        inputNodes.push(i);
      }
    }

    for (let n = 0; n < outputArr.length; n++) {
      const i = outputArr[n];
      if (typeof i === 'string') {
        outputNodes.push(this.getNode(i));
      } else {
        outputNodes.push(i);
      }
    }

    let edges = [];
    inputNodes.forEach(input => {
      outputNodes.forEach(output => {
        edges.push(this.createEdge().link(input, output));
      });
    });
    return edges;
  }

  createEdge(): Edge {
    return new Edge();
  }

  getNode(name: string): Node {
    return this.nodes[name];
  }
}

export const printGraph = (g: Graph) => {
  Object.keys(g.nodes).forEach(name => {
    const n = g.nodes[name];
    let outputEdges = n.outputEdges.map(e => e.outputNode.name).join(', ');
    if (!outputEdges) {
      outputEdges = '<none>';
    }
    let inputEdges = n.inputEdges.map(e => e.inputNode.name).join(', ');
    if (!inputEdges) {
      inputEdges = '<none>';
    }
    console.log(`${n.name}:\n - links to:   ${outputEdges}\n - links from: ${inputEdges}`);
  });
};
