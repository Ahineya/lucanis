// movement.service.ts
import { gameStore } from '../stores/game.store';
import {Point} from "./mst.ts";

export function movePlayerAlongPath(
    path: number[],
    mapPoints: Point[],
    mapIndex: number,
    durationPerSegment: number = 500 // duration in milliseconds per segment
) {
    if (path.length < 2) return;

    let currentSegmentIndex = 0;
    let startTime: number | null = null;

    function animate(timestamp: number) {
        if (!startTime) startTime = timestamp;

        const elapsed = timestamp - startTime;
        const t = Math.min(elapsed / durationPerSegment, 1); // Normalize time to [0,1]

        const startPointIndex = path[currentSegmentIndex];
        const endPointIndex = path[currentSegmentIndex + 1];

        const [startX, startY] = mapPoints[startPointIndex];
        const [endX, endY] = mapPoints[endPointIndex];

        // Interpolate positions
        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t;

        // Update the store with the new position
        gameStore.position.next({
            mapIndex,
            pointIndex: endPointIndex,
            x,
            y,
        });

        if (t < 1) {
            // Continue animating the current segment
            requestAnimationFrame(animate);
        } else {
            // Move to the next segment
            currentSegmentIndex++;
            if (currentSegmentIndex < path.length - 1) {
                // Reset startTime for the next segment
                startTime = null;
                requestAnimationFrame(animate);
            } else {
                // Movement along the path is complete
                console.log('Player has reached the destination.');
            }
        }
    }

    // Start the animation
    requestAnimationFrame(animate);
}