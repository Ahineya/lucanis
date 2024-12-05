import React, {useEffect, useState} from "react";
import {gameStore} from "../../stores/game.store.ts";
import {useStoreSubscribe} from "../../lib/store-subject/use-store-subscribe.hook.ts";
import {LocalMap} from "./local-map.tsx";
import {identity} from "../../lib/option.lib.ts";
import {WorldMap} from "./world-map.tsx";

export const MapWindow = () => {
    const [pan, setPan] = useState({x: 0, y: 0});
    const gameMap = useStoreSubscribe(gameStore.currentMap);
    const overworldMap = useStoreSubscribe(gameStore.overworldMap);

    useEffect(() => {
        setPan({x: 0, y: 0});
    }, [gameMap, overworldMap]);

    const startPan = (e: React.MouseEvent) => {
        e.preventDefault();

        const start = {
            x: e.clientX,
            y: e.clientY
        };

        const doPan = (e: MouseEvent) => {
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;

            start.x = e.clientX;
            start.y = e.clientY;

            // Use functional update to ensure latest state is used
            setPan((prevPan) => ({
                x: prevPan.x + dx,
                y: prevPan.y + dy
            }));
        };

        const endPan = () => {
            document.removeEventListener("mousemove", doPan);
            document.removeEventListener("mouseup", endPan);
        };

        document.addEventListener("mousemove", doPan);
        document.addEventListener("mouseup", endPan);
    };

    return (
        // gameMap.map(gameMap => <LocalMap gameMap={gameMap} pan={pan} startPan={startPan}/>).unwrapOr(null)
        gameMap.map(gameMap => <LocalMap gameMap={gameMap} pan={pan} startPan={startPan}/>)
            .fold(identity, () => overworldMap.map(m => <WorldMap gameMap={m} pan={pan} startPan={startPan}/>).unwrapOr(null))
    )
}
