import {FC} from "react";
import {useStoreSubscribe} from "../../lib/store-subject/use-store-subscribe.hook.ts";
import {dialogueStore} from "../../stores/dialogue.store.ts";
import {DialogueLine} from "./dialogue-line.tsx";

type Props = {
    narrativeEvent: any;
}

export const Dialogue: FC<Props> = ({narrativeEvent}) => {
    const dialogues = useStoreSubscribe(dialogueStore.dialogues);
    const dialogue = dialogues.get(narrativeEvent.id);
    const currentDialogue = useStoreSubscribe(dialogueStore.currentDialogue);

    const isCurrentDialogue = currentDialogue.map(id => id === narrativeEvent.id).unwrapOr(false);

    return (
        <div>
            {
                dialogue.lines.map((line, index) => (
                    <div>
                        {line.topic && <h3 className="text-cyan-300">{line.topic}</h3>}
                        <DialogueLine line={line} subject={dialogue.subject} isCurrentDialogue={isCurrentDialogue}/>
                    </div>
                ))
            }
        </div>
    );
}
