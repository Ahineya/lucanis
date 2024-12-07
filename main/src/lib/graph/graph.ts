type Graph = Map<number, number[]>;

export function findBridgesAndArticulationPoints(numNodes: number, edges: number[][]): {
    bridges: number[][];
    articulationPoints: number[];
} {
    const graph: Graph = buildGraph(numNodes, edges);
    const visited: boolean[] = new Array(numNodes).fill(false);
    const disc: number[] = new Array(numNodes).fill(-1); // Discovery times
    const low: number[] = new Array(numNodes).fill(-1);  // Low values
    const parent: number[] = new Array(numNodes).fill(-1);
    const ap: boolean[] = new Array(numNodes).fill(false); // Articulation points
    const bridges: number[][] = [];
    let time = 0; // Global time counter

    function dfs(u: number) {
        visited[u] = true;
        disc[u] = low[u] = time++;
        let children = 0; // Number of children in DFS tree

        for (const v of graph.get(u) || []) {
            if (!visited[v]) {
                children++;
                parent[v] = u;
                dfs(v);

                // Update low value for u
                low[u] = Math.min(low[u], low[v]);

                // Check for articulation point
                if (parent[u] === -1 && children > 1) {
                    // Case 1: If u is root and has more than one child
                    ap[u] = true;
                }
                if (parent[u] !== -1 && low[v] >= disc[u]) {
                    // Case 2: If u is not root and low[v] >= disc[u]
                    ap[u] = true;
                }

                // Check for bridge
                if (low[v] > disc[u]) {
                    bridges.push([u, v]);
                }
            } else if (v !== parent[u]) {
                // Update low value of u for back edge
                low[u] = Math.min(low[u], disc[v]);
            }
        }
    }

    // Run DFS for each unvisited node
    for (let i = 0; i < numNodes; i++) {
        if (!visited[i]) {
            dfs(i);
        }
    }

    // Collect articulation points
    const articulationPoints = [];
    for (let i = 0; i < numNodes; i++) {
        if (ap[i]) {
            articulationPoints.push(i);
        }
    }

    return {
        bridges,
        articulationPoints,
    };
}

// Very inefficient solution
export function findEdgeCutsOfSizeTwo(numNodes: number, edges: number[][]): number[][] {
    const edgeCuts: number[][] = [];
    const graph: Graph = buildGraph(numNodes, edges);

    // Generate all unique pairs of edges
    for (let i = 0; i < edges.length; i++) {
        for (let j = i + 1; j < edges.length; j++) {
            const removedEdges = [edges[i], edges[j]];

            // Create a copy of the graph without the two edges
            const modifiedGraph = removeEdgesFromGraph(graph, removedEdges);

            // Check if the modified graph is disconnected
            if (isGraphDisconnected(modifiedGraph, numNodes)) {
                edgeCuts.push([i, j]); // Store indices of the edges
            }
        }
    }

    return edgeCuts;
}

function removeEdgesFromGraph(graph: Graph, edgesToRemove: number[][]): Graph {
    // Deep copy the graph to avoid modifying the original
    const newGraph: Graph = new Map();
    for (const [node, neighbors] of graph.entries()) {
        newGraph.set(node, [...neighbors]);
    }

    for (const [u, v] of edgesToRemove) {
        // Remove edge u-v
        newGraph.set(u, newGraph.get(u)!.filter((neighbor) => neighbor !== v));
        newGraph.set(v, newGraph.get(v)!.filter((neighbor) => neighbor !== u));
    }

    return newGraph;
}

function isGraphDisconnected(graph: Graph, numNodes: number): boolean {
    const visited: boolean[] = new Array(numNodes).fill(false);
    let components = 0;

    function dfs(u: number) {
        visited[u] = true;
        for (const v of graph.get(u) || []) {
            if (!visited[v]) {
                dfs(v);
            }
        }
    }

    for (let i = 0; i < numNodes; i++) {
        if (!visited[i]) {
            components++;
            if (components > 1) {
                return true; // Graph is disconnected
            }
            dfs(i);
        }
    }

    return false; // Graph is connected
}

function buildGraph(numNodes: number, edges: number[][]): Graph {
    const graph: Graph = new Map();
    for (let i = 0; i < numNodes; i++) {
        graph.set(i, []);
    }
    for (const [u, v] of edges) {
        graph.get(u)!.push(v);
        graph.get(v)!.push(u); // Undirected graph
    }
    return graph;
}
