import {GameAction, gameStore} from "../../stores/game.store.ts";
import {useStoreSubscribe} from "../../lib/store-subject/use-store-subscribe.hook.ts";
import {isSome, none, some} from "../../lib/option.lib.ts";
import {dialogueStore} from "../../stores/dialogue.store.ts";
import {useMemo} from "react";
import {dialogueService} from "../../services/dialogue.service.ts";

export const ActionWindow = () => {
    const currentAction = useStoreSubscribe(gameStore.selectedAction);
    const conversationTopics = useStoreSubscribe(dialogueStore.allTopics);
    const dialogues = useStoreSubscribe(dialogueStore.dialogues);
    const currentDialogueId = useStoreSubscribe(dialogueStore.currentDialogue);

    const currentMap = useStoreSubscribe(gameStore.currentMap);
    const playerPosition = useStoreSubscribe(gameStore.position);

    const cancelAction = () => {
        gameStore.setAction(none());
    }

    const talk = () => {
        gameStore.setAction(some<GameAction>("talk"));
    }

    const mbCurrentDialogue = currentDialogueId.map(id => dialogues.get(id));

    const filteredTopics = useMemo(() => {
        if (!mbCurrentDialogue.isSome()) {
            return [];
        }

        const currentDialogue = mbCurrentDialogue.unwrap();

        return conversationTopics.filter(topic => dialogueService.getDialogueLine({npc: currentDialogue.subject, topic}).isSome());
    }, [conversationTopics, mbCurrentDialogue]);

    const exitToWorldMap = () => {
        gameStore.exitLocation();
    }

    return (
        <div className="grow overflow-auto p-2 ">
            {/*<p>Selected action: {isSome(currentAction) && currentAction.unwrap()}</p>*/}
            {
                currentMap.map(_ => playerPosition.pointIndex === 0 ?
                    <button className="underline underline-offset-2 text-cyan-300"
                            onClick={exitToWorldMap}>Exit to World Map</button> : null).unwrapOr(null)
            }
            {
                currentAction.map(_ => <button className="underline underline-offset-2 text-cyan-300"
                                               onClick={cancelAction}>Cancel</button>).unwrapOr(null)
            }
            <div>
                <button
                    className="underline underline-offset-2 text-cyan-300"
                    onClick={talk}
                >
                    Talk
                </button>
            </div>
            {mbCurrentDialogue.map(_ => <div>
                <h2>Conversation Topics</h2>
                <ul className="flex flex-wrap gap-2">
                    {
                        filteredTopics.map(topic => (
                            <button className="underline underline-offset-2 text-cyan-300" key={topic}
                                    onClick={() => dialogueStore.advanceCurrentDialogue(topic)}
                            >{topic}</button>
                        ))
                    }
                </ul>
            </div>).unwrapOr(null)}
        </div>
    );
}
