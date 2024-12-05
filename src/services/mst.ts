export type Point = { x: number; y: number };
export type Edge = { from: number; to: number; weight: number };

class UnionFind {
    private parent: number[];
    private rank: number[];

    constructor(size: number) {
        this.parent = Array.from({ length: size }, (_, i) => i);
        this.rank = Array(size).fill(0);
    }

    find(index: number): number {
        if (this.parent[index] !== index) {
            this.parent[index] = this.find(this.parent[index]); // Path compression
        }
        return this.parent[index];
    }

    union(index1: number, index2: number): boolean {
        const root1 = this.find(index1);
        const root2 = this.find(index2);

        if (root1 === root2) return false; // Already in the same set

        // Union by rank
        if (this.rank[root1] > this.rank[root2]) {
            this.parent[root2] = root1;
        } else if (this.rank[root1] < this.rank[root2]) {
            this.parent[root1] = root2;
        } else {
            this.parent[root2] = root1;
            this.rank[root1]++;
        }

        return true;
    }
}

function calculateDistance(point1: Point, point2: Point): number {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function findMST(points: Point[], edges: [number, number][]): Edge[] {
    // Prepare edges with weights
    const weightedEdges: Edge[] = edges.map(([from, to]) => ({
        from,
        to,
        weight: calculateDistance(points[from], points[to]),
    }));

    // Sort edges by weight
    weightedEdges.sort((a, b) => a.weight - b.weight);

    const unionFind = new UnionFind(points.length);
    const mst: Edge[] = [];

    for (const edge of weightedEdges) {
        if (unionFind.union(edge.from, edge.to)) {
            mst.push(edge);
        }
    }

    return mst;
}