import {StoreSubject} from "../lib/store-subject/store-subject.ts";
import {Character} from "../services/chargen.service.ts";
import {randomService} from "../services/random.service.ts";
import {dialogueService} from "../services/dialogue.service.ts";
import {none, Option, some} from "../lib/option.lib.ts";

export type TDialogueLine = {
    subject: Character;
    text: string;
    topic?: string;
}

type Dialogue = {
    id: string;
    subject: Character;
    lines: TDialogueLine[];
}

class DialogueStore {
    public dialogues = new StoreSubject<Map<string, Dialogue>>(new Map());
    public currentDialogue = new StoreSubject<Option<string>>(none());

    public allTopics = new StoreSubject<string[]>([]);

    public fillTopics() {
        const topics = dialogueService.getAllTopics().sort((a, b) => a.localeCompare(b));
        this.allTopics.next(topics);
    }

    public startDialogue(subject: Character) {
        const id = randomService.randomId("dialogue-");

        this.dialogues.next(new Map([...this.dialogues.getValue(), [id, {
            id, subject, lines: [
                {
                    subject,
                    text: dialogueService.getDialogueLine({npc: subject, topic: "_greeting0"}).unwrap()
                }
            ]
        }] as [string, Dialogue]]));

        this.currentDialogue.next(some(id));

        return id;
    }

    public advanceCurrentDialogue(topic: string) {
        const current = this.currentDialogue.getValue().unwrap();
        const dialogue = this.dialogues.getValue().get(current);
        if (!dialogue) {
            return;
        }

        const line = dialogueService.getDialogueLine({npc: dialogue.subject, topic});

        line.map(text => {
            dialogue.lines.push({
                subject: dialogue.subject,
                text,
                topic
            });

            this.dialogues.next(new Map([...this.dialogues.getValue(), [current, dialogue]]));
        });
    }

    public endDialogue() {
        this.currentDialogue.next(none());
    }
}

export const dialogueStore = new DialogueStore();