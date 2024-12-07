type Point = { x: number; y: number };

export type GameMapLayout = {
    points: Point[];
    edges: number[][];
};

// Simple Priority Queue Implementation
class PriorityQueue<T> {
    private elements: { item: T; priority: number }[] = [];

    isEmpty(): boolean {
        return this.elements.length === 0;
    }

    enqueue(item: T, priority: number) {
        this.elements.push({ item, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue(): T {
        return this.elements.shift()!.item;
    }

    updatePriority(item: T, priority: number) {
        for (const element of this.elements) {
            if (element.item === item) {
                element.priority = priority;
                break;
            }
        }
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    has(item: T): boolean {
        return this.elements.some((element) => element.item === item);
    }
}

export function pathfind(
    mapLayout: GameMapLayout,
    startIndex: number,
    endIndex: number
): number[] | null {
    const { points, edges } = mapLayout;

    // Build adjacency list (undirected edges)
    const adjacencyList: Map<number, number[]> = new Map();
    for (const [start, end] of edges) {
        if (!adjacencyList.has(start)) adjacencyList.set(start, []);
        adjacencyList.get(start)!.push(end);

        if (!adjacencyList.has(end)) adjacencyList.set(end, []);
        adjacencyList.get(end)!.push(start);
    }

    function heuristic(a: Point, b: Point): number {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.hypot(dx, dy);
    }

    const openSet = new PriorityQueue<number>();
    openSet.enqueue(startIndex, 0);

    const cameFrom: Map<number, number> = new Map();

    const gScore: Map<number, number> = new Map();
    gScore.set(startIndex, 0);

    const fScore: Map<number, number> = new Map();
    fScore.set(startIndex, heuristic(points[startIndex], points[endIndex]));

    while (!openSet.isEmpty()) {
        const current = openSet.dequeue();

        if (current === endIndex) {
            // Reconstruct path
            const path: number[] = [];
            let curr = current;
            while (cameFrom.has(curr)) {
                path.unshift(curr);
                curr = cameFrom.get(curr)!;
            }
            path.unshift(curr);
            return path;
        }

        const neighbors = adjacencyList.get(current) ?? [];
        for (const neighbor of neighbors) {
            const tentative_gScore = gScore.get(current)! + 1; // Uniform cost

            if (tentative_gScore < (gScore.get(neighbor) ?? Infinity)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentative_gScore);
                const tentative_fScore =
                    tentative_gScore + heuristic(points[neighbor], points[endIndex]);
                fScore.set(neighbor, tentative_fScore);

                if (openSet.has(neighbor)) {
                    openSet.updatePriority(neighbor, tentative_fScore);
                } else {
                    openSet.enqueue(neighbor, tentative_fScore);
                }
            }
        }
    }

    // Open set is empty but goal was never reached
    return null;
}