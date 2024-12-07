import {useStoreSubscribe} from "../../../../../lib/store-subject/use-store-subscribe.hook.ts";
import {dialogueEditStore} from "../../../../../stores/dialogue.store.ts";
import {none, some} from "../../../../../lib/option.lib.ts";

type DialogueCondition = {
    cType: "npc" | "race" | "dsl";
    cValue: string;
}

type DialogueLine = {
    text: string;
    conditions: DialogueCondition[];
    effect?: EffectDSL;
}

type EffectDSL = {
    effect: string; // stack-based DSL
}

type ConditionDSL = {
    condition: string; // stack-based DSL
}

function isEffectDSL(line: DialogueLine): line is { text: string; conditions: DialogueCondition[]; effect: EffectDSL } {
    return !!line.effect;
}

const racesWithGender = [
    // "cavePerson",
    "dwarf",
    // "halfling",
    // "gnome",
    "elf",
    "highelf",
    // "fairy",
    // "highfairy",
    "darkelf",
    // "drow",
    "halfdemon",
    // "dragon",
    // "angel"
] as const;
const otherRaces = [
    // "demon",
    "human",
    "goblin",
    // "ogre",
    "orc"
] as const;

const allRaces = [...racesWithGender, ...otherRaces].sort((a, b) => a.localeCompare(b));

export const EditArea = () => {
    const dialogues = useStoreSubscribe(dialogueEditStore.dialogues);
    const activeTopic = useStoreSubscribe(dialogueEditStore.activeTopic);
    const lines = dialogues[activeTopic.unwrapOr("")] || [];
    const activeLine = useStoreSubscribe(dialogueEditStore.activeLine);

    const line: DialogueLine = lines[activeLine.unwrapOr(-1)];

    if (!activeLine.isSome()) {
        return <div className="grow flex flex-col overflow-scroll border p-2">
            <h2 className="text-lg">Select a line to edit</h2>
        </div>
    }

    const change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (activeLine.isSome()) {
            const newLines = [...lines];
            newLines[activeLine.unwrap()] = {
                ...line,
                text: (e.target as any).value
            };
            dialogueEditStore.dialogues.next({...dialogues, [activeTopic.unwrapOr("")]: newLines});
        }
    }

    const editConditionType = (i: number, e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLines = [...lines];
        newLines[activeLine.unwrap()] = {
            ...line,
            conditions: line.conditions.map((c, j) => {
                if (j === i) {
                    return {
                        ...c,
                        cType: e.target.value as DialogueCondition["cType"]
                    }
                }
                return c;
            })
        };
        dialogueEditStore.dialogues.next({...dialogues, [activeTopic.unwrapOr("")]: newLines});
    }

    const editConditionValue = (i: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newLines = [...lines];
        newLines[activeLine.unwrap()] = {
            ...line,
            conditions: line.conditions.map((c, j) => {
                if (j === i) {
                    return {
                        ...c,
                        cValue: e.target.value
                    }
                }
                return c;
            })
        };
        dialogueEditStore.dialogues.next({...dialogues, [activeTopic.unwrapOr("")]: newLines});
    }

    const deleteCondition = (i: number) => {
        // Are you sure dialog:
        if (confirm("Are you sure?")) {
            const newLines = [...lines];
            newLines[activeLine.unwrap()] = {
                ...line,
                conditions: line.conditions.filter((_, j) => j !== i)
            };
            dialogueEditStore.dialogues.next({...dialogues, [activeTopic.unwrapOr("")]: newLines});
        }
    }

    return (
        <div className="grow flex flex-col gap-2 overflow-scroll border p-2">
            <textarea onChange={change} className="w-full h-16 border p-2 min-h-16" value={line?.text}/>
            <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-center">
                    <h3 className="text-lg">Conditions</h3>
                    <button className="bg-blue-500 text-white p-1 rounded" onClick={() => {
                        const newLines = [...lines];
                        newLines[activeLine.unwrap()] = {
                            ...line,
                            conditions: [...line.conditions, {cType: "npc", cValue: ""}]
                        };
                        dialogueEditStore.dialogues.next({...dialogues, [activeTopic.unwrapOr("")]: newLines});
                    }}>Add
                    </button>
                </div>
                {
                    line?.conditions.map((condition, i) => (
                        <div key={i} className="flex items-center">
                            <select value={condition.cType} className="border p-1"
                                    onChange={e => editConditionType(i, e)}>
                                <option value="npc">NPC</option>
                                <option value="race">Race</option>
                                <option value="dsl">DSL</option>
                            </select>

                            {/*TODO: Implement proper inputs for each condition type*/}
                            {condition.cType !== "race" &&
                                <input className="border p-1 grow" value={condition.cValue}
                                       onChange={e => editConditionValue(i, e)}/>
                            }
                            {
                                condition.cType === "race" &&
                                <select value={condition.cValue} className="border p-1 grow"
                                        onChange={e => editConditionValue(i, e)}>
                                    {
                                        allRaces.map(race => (
                                            <option key={race} value={race}>{race}</option>
                                        ))
                                    }
                                </select>
                            }
                            <button className="bg-red-500 text-white p-1 rounded"
                                    onClick={() => deleteCondition(i)}>Delete
                            </button>
                        </div>
                    ))
                }
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg">Effects</h3>
                    <input className="border p-1 grow" value={line.effect?.effect || ""}
                           onChange={e => {
                               const newLines = [...lines];
                               newLines[activeLine.unwrap()] = {
                                   ...line,
                                   effect: {effect: e.target.value}
                               };
                               dialogueEditStore.dialogues.next({
                                   ...dialogues,
                                   [activeTopic.unwrapOr("")]: newLines
                               });
                           }}/>
                </div>
            </div>
        </div>
    )
}