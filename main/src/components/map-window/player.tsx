import React, {FC} from "react";
import {useStoreSubscribe} from "../../lib/store-subject/use-store-subscribe.hook.ts";
import {gameStore} from "../../stores/game.store.ts";
import {GameMapLayout} from "../../services/worldgen.service.ts";

type Props = {
    layout: GameMapLayout;
}
export const Player: FC<Props> = ({layout}) => {
    const {points: mapPoints, edges: mapEdges} = layout;
    const playerPosition = useStoreSubscribe(gameStore.position);

    // const x = mapPoints[playerPosition.pointIndex][0] + 8;
    // const y = mapPoints[playerPosition.pointIndex][1] + 8;

    const x = playerPosition.x + 8;
    const y = playerPosition.y + 8;

    console.log("Player", x, y, playerPosition);

    return (
        <circle
            cx={x}
            cy={y}
            r={8}
            className="pointer-events-none fill-blue-300 text-primary transform transition-transform duration-200 ease-in-out hover:scale-150"
            style={{
                transformOrigin: 'center',
                transformBox: 'fill-box'
            }}
        />
    )
}
