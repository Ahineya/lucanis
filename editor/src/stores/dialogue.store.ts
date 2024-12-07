import {StoreSubject} from "../lib/store-subject/store-subject.ts";
import {none, Option, some} from "../lib/option.lib.ts";
import dialJson from "../../../main/src-tauri/resources/dialogue/dialogue.json";

class DialogueEditStore {
    public dialogueJson = new StoreSubject(JSON.stringify(dialJson));
    public dialogues = new StoreSubject({});

    public activeTopic = new StoreSubject<Option<string>>(none());
    public activeLine = new StoreSubject<Option<number>>(none());

    public setDialogueJson(json: string) {
        this.dialogueJson.next(json);
    }

    public load() {
        try {
            this.dialogues.next(JSON.parse(this.dialogueJson.getValue()));
        } catch (e) {
            console.error(e);
        }
    }

    public save() {
        this.dialogueJson.next(JSON.stringify(this.dialogues.getValue(), null, 2));
        // Copy to clipboard
        navigator.clipboard.writeText(this.dialogueJson.getValue());
    }

    public setActiveTopic(topic: string) {
        this.activeLine.next(none());
        this.activeTopic.next(some(topic));
    }

    public addTopic(topic: string) {
        this.dialogues.next({...this.dialogues.getValue(), [topic]: []});
    }

    public setActiveLine(line: number) {
        this.activeLine.next(some(line));
    }

    public addLine() {
        const topic = this.activeTopic.getValue();
        if (topic.isSome()) {
            const lines: Array<unknown> = this.dialogues.getValue()[topic.unwrap()];
            this.dialogues.next({...this.dialogues.getValue(), [topic.unwrap()]: [...lines, {text: "", conditions: []}]});
            this.activeLine.next(some(lines.length));
        }
    }
}

export const dialogueEditStore = new DialogueEditStore();