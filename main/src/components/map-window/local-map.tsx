import clsx from "clsx";
import {Tooltip} from "react-tooltip";
import React, {FC} from "react";
import {GameMap} from "../../services/worldgen.service.ts";
import {useStoreSubscribe} from "../../lib/store-subject/use-store-subscribe.hook.ts";
import {gameStore} from "../../stores/game.store.ts";
import {Player} from "./player.tsx";
import {pathfind} from "../../services/pathfinder.service.ts";
import {movePlayerAlongPath} from "../../services/movement.service.ts";

function isSameEdge(edge1: [number, number], edge2: [number, number]): boolean {
    return (edge1[0] === edge2[0] && edge1[1] === edge2[1]) || (edge1[0] === edge2[1] && edge1[1] === edge2[0]);
}

type Props = {
    gameMap: GameMap;
    pan: {x: number, y: number};
    startPan: (e: React.MouseEvent) => void;
}
export const LocalMap: FC<Props> = ({gameMap, pan, startPan}) => {
    const {points: mapPoints, edges: mapEdges, bridges} = gameMap.layout;
    const playerPosition = useStoreSubscribe(gameStore.position);
    const [w, h] = gameMap.size;

    const move = (pointIndex: number) => {
        if (playerPosition.pointIndex !== pointIndex) {
            const path = pathfind(gameMap.layout, playerPosition.pointIndex, pointIndex);
            console.log("Path", path, gameMap.layout, playerPosition.pointIndex, pointIndex);
            if (!path) {
                return;
            }

            movePlayerAlongPath(path, mapPoints, playerPosition.mapIndex);
            return;
        }
    }

    return (
        <div className="w-full h-full overflow-hidden relative">
            <h1 className="text-2xl text-center">{gameMap.name}</h1>

            <div
                className="absolute overflow-hidden"
                onMouseDown={startPan}
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px)`,
                    width: `${w + 32}px`,
                    height: `${h + 32}px`
                }}
            >
                <svg viewBox={`0 0 ${w + 30} ${h + 30}`} className="fill-primary text-primary w-full h-full">
                    {
                        mapEdges.map((edge, index) => {
                            const isBridge = bridges.some(bridge => isSameEdge(bridge, edge));

                            return (
                                <line
                                    key={index}
                                    x1={mapPoints[edge[0]][0] + 8}
                                    y1={mapPoints[edge[0]][1] + 8}
                                    x2={mapPoints[edge[1]][0] + 8}
                                    y2={mapPoints[edge[1]][1] + 8}
                                    className={clsx("stroke-current transition-colors duration-200 ease-in-out",
                                        isBridge ? "text-red-400" : "text-primary"
                                    )}
                                    style={{
                                        strokeWidth: 2
                                    }}
                                />
                            )
                        })
                    }
                    {
                        mapPoints.map((point, index) => {
                            return (
                                <circle
                                    key={index}
                                    cx={point[0] + 8}
                                    cy={point[1] + 8}
                                    r={8}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={() => move(index)}
                                    className={clsx("fill-current transform transition-transform duration-200 ease-in-out hover:scale-150",
                                        `point-${index}`,
                                        {
                                            "text-primary": gameMap.pointsData[index].type !== "gate",
                                            "text-white": gameMap.pointsData[index].type === "gate",
                                        } as Record<string, boolean>
                                    )}
                                    style={{
                                        transformOrigin: 'center',
                                        transformBox: 'fill-box'
                                    }}
                                />
                            )
                        })
                    }
                    <Player layout={gameMap.layout}/>
                </svg>
            </div>
            {
                mapPoints.map((point, index) => {
                    const playerHint = index === playerPosition.pointIndex ? "You are here" : "";
                    return (
                        <Tooltip anchorSelect={`.point-${index}`} key={`${point[0]}-${point[1]}-${gameMap.name}`}>
                            <div className="flex flex-col items-center">
                                <div>{`${gameMap.pointsData[index].name} (${gameMap.pointsData[index].type})`}</div>
                                <div>{`${playerHint}`}</div>
                            </div>
                        </Tooltip>
                    )
                })
            }
        </div>
    )
}