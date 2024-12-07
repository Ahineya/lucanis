import {useStoreSubscribe} from "../../../../lib/store-subject/use-store-subscribe.hook.ts";
import {dialogueEditStore} from "../../../../stores/dialogue.store.ts";
import clsx from "clsx";

export const Topics = () => {
    const dialogues = useStoreSubscribe(dialogueEditStore.dialogues);
    const activeTopic = useStoreSubscribe(dialogueEditStore.activeTopic);

    const topics = Object.keys(dialogues).sort((a, b) => a.localeCompare(b));

    const setActiveTopic = (topic: string) => {
        dialogueEditStore.setActiveTopic(topic);
    }

    const addTopic = () => {
        const newTopic = prompt("Enter new topic");
        if (newTopic) {
            dialogueEditStore.addTopic(newTopic);
        }
    }

    return (
        <div className="flex flex-col h-full overflow-scroll min-w-64 max-w-64 w-64 border">
            <div className="min-w-64">
                <div className="flex gap-2 items-center">
                    <h2 className="text-xl">
                        Topics
                    </h2>
                    <button
                        onClick={() => addTopic()}
                        className="bg-blue-500 text-white p-1 rounded"
                    >Add
                    </button>
                </div>
                <ul>
                    {topics.map((topic) => (
                        <li key={topic}>
                            <button
                                onClick={() => setActiveTopic(topic)}
                                className={clsx("w-full text-left px-2", {
                                    "bg-blue-500 text-white": activeTopic.map((t) => t === topic).unwrapOr(false),
                                    "hover:bg-blue-100": !activeTopic.map((t) => t === topic).unwrapOr(false)
                                })}
                            >{topic}</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}