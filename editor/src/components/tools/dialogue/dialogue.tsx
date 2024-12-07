import {useStoreSubscribe} from "../../../lib/store-subject/use-store-subscribe.hook.ts";
import {dialogueEditStore} from "../../../stores/dialogue.store.ts";
import {Editor} from "./editor/editor.tsx";

export const Dialogue = () => {
    const dialogueJson = useStoreSubscribe(dialogueEditStore.dialogueJson);

    const load = () => {
        dialogueEditStore.load();
    }

    const change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dialogueEditStore.setDialogueJson((e.target as any).value);
    }

    const save = () => {
        dialogueEditStore.save();
    }

    return (
        <div className="p-4 flex flex-col overflow-hidden h-full gap-2 ">
            <h1 className="text-2xl">Dialogue Tool</h1>
            <textarea className="w-full h-16 border" placeholder="Enter dialogue JSON here" value={dialogueJson}
                      onChange={change}/>
            <div className="flex gap-2">
                <button className="bg-blue-500 text-white p-2 rounded" onClick={load}>Load</button>
                <button className="bg-blue-500 text-white p-2 rounded" onClick={save}>Save</button>
            </div>
            <Editor/>
        </div>
    )
}
