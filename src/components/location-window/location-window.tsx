import {useStoreSubscribe} from "../../lib/store-subject/use-store-subscribe.hook.ts";
import {gameStore} from "../../stores/game.store.ts";
import {CharacterName} from "./character-name.tsx";

export const LocationWindow = () => {
    const gameMap = useStoreSubscribe(gameStore.currentMap);
    const playerPosition = useStoreSubscribe(gameStore.position);

    if (!gameMap.isSome()) return null;

    const {points: mapPoints, edges: mapEdges} = gameMap.unwrap().layout;
    const {mapIndex, pointIndex} = playerPosition;

    const playerPointData = gameMap.unwrap().pointsData[pointIndex];
    const characters = gameMap.unwrap().characters[pointIndex];

    return (
        <div className="grow overflow-auto p-2">
            <h1>{playerPointData.name} ({playerPointData.type})</h1>

            {
                characters.map((character) => {
                    return (
                        <div key={character.id}>
                            <h2><CharacterName character={character}/>, {character.race.name}, {character.gender}</h2>
                            {/*<div>*/}
                            {/*    {*/}
                            {/*        character.attributes.map((attribute) => {*/}
                            {/*            return (*/}
                            {/*                <div key={attribute.name}>*/}
                            {/*                    <strong>{attribute.name}</strong>: {attribute.value}*/}
                            {/*                </div>*/}
                            {/*            )*/}
                            {/*        })*/}
                            {/*    }*/}
                            {/*</div>*/}
                            {/*<div>*/}
                            {/*    {*/}
                            {/*        character.skills.map((skill) => {*/}
                            {/*            return (*/}
                            {/*                <div key={skill.name}>*/}
                            {/*                    <strong>{skill.name}</strong>: {skill.value}*/}
                            {/*                </div>*/}
                            {/*            )*/}
                            {/*        })*/}
                            {/*    }*/}
                            {/*</div>*/}
                        </div>
                    )
                })
            }
        </div>
    )
}
