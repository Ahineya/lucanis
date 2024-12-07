import {useStoreSubscribe} from "../../../../lib/store-subject/use-store-subscribe.hook.ts";
import {dialogueEditStore} from "../../../../stores/dialogue.store.ts";
import clsx from "clsx";
import {none, some} from "../../../../lib/option.lib.ts";

export const Lines = () => {
    const dialogues = useStoreSubscribe(dialogueEditStore.dialogues);
    const activeTopic = useStoreSubscribe(dialogueEditStore.activeTopic);
    const lines = dialogues[activeTopic.unwrapOr("")] || [];
    const activeLine = useStoreSubscribe(dialogueEditStore.activeLine);

    const setActiveLine = (lineIndex: number) => {
        dialogueEditStore.setActiveLine(lineIndex);
    }

    return (
        <div className="min-h-32 max-h-32 flex flex-col overflow-scroll border">
            <div className="flex gap-2 items-center">
                <h2 className="text-xl p-2">Lines</h2>
                <button
                    onClick={() => dialogueEditStore.addLine()}
                    className="bg-blue-500 text-white p-1 rounded"
                >Add</button>
                {
                    activeLine.isSome() && (
                        <div className="flex gap-2 grow justify-end">
                            {/*Controls*/}
                            <button className="bg-blue-500 text-white p-1 rounded" onClick={() => {
                                // Move line up
                                if (activeLine.unwrap() > 0) {
                                    const newLines = [...lines];
                                    const temp = newLines[activeLine.unwrap()];
                                    newLines[activeLine.unwrap()] = newLines[activeLine.unwrap() - 1];
                                    newLines[activeLine.unwrap() - 1] = temp;
                                    dialogueEditStore.dialogues.next({...dialogues, [activeTopic.unwrapOr("")]: newLines});
                                    dialogueEditStore.activeLine.next(some(activeLine.unwrap() - 1));
                                }
                            }}>Up
                            </button>
                            <button className="bg-blue-500 text-white p-1 rounded" onClick={() => {
                                // Move line down
                                if (activeLine.unwrap() < lines.length - 1) {
                                    const newLines = [...lines];
                                    const temp = newLines[activeLine.unwrap()];
                                    newLines[activeLine.unwrap()] = newLines[activeLine.unwrap() + 1];
                                    newLines[activeLine.unwrap() + 1] = temp;
                                    dialogueEditStore.dialogues.next({...dialogues, [activeTopic.unwrapOr("")]: newLines});
                                    dialogueEditStore.activeLine.next(some(activeLine.unwrap() + 1));
                                }
                            }}>Down
                            </button>
                            <button className="bg-red-500 text-white p-1 rounded" onClick={() => {
                                // Delete line
                                if (confirm("Are you sure?")) {
                                    const newLines = [...lines];
                                    newLines.splice(activeLine.unwrap(), 1);
                                    dialogueEditStore.dialogues.next({...dialogues, [activeTopic.unwrapOr("")]: newLines});
                                    dialogueEditStore.activeLine.next(none());
                                }
                            }}>Delete
                            </button>
                        </div>
                    )
                }
            </div>
            <ul>
                {lines.map((line, i) => (
                    <li key={i}>
                        <button
                            className={clsx("w-full text-left px-2 overflow-hidden max-h-6 min-h-6 truncate", {
                                "bg-blue-500 text-white": i === activeLine.unwrapOr(-1),
                                "hover:bg-blue-100": i !== activeLine.unwrapOr(-1)
                            })}
                            onClick={() => setActiveLine(i)}>
                            {line.text || <span>[[EMPTY LINE]]</span>}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
