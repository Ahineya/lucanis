import {Character} from "./chargen.service.ts";
import AhoCorasick from "ahocorasick";
import {none, Option, some} from "../lib/option.lib.ts";

type NPCDialogueState = {
    npc: Character;
    topic: string;
}

type DialogueCondition = {
    cType: "npc" | "race";
    cValue: string;
}

type DialogueLine = {
    text: string;
    conditions: DialogueCondition[];
}

// Morrowind-like dialogue system
class DialogueService {
    dialogueCache = new Map<string, DialogueLine[]>();

    async buildDialogueCache() {
        // TODO: Move to resource files
        this.dialogueCache.set("_greeting0", [
            {
                text: "Hello, meat!",
                conditions: [
                    {
                        cType: "race",
                        cValue: "halfdemon"
                    }
                ]
            },
            {
                text: "Hello, stranger!",
                conditions: []
            }
        ]);

        this.dialogueCache.set("Lucanis", [
            {
                text: "Lucanis provides.",
                conditions: [
                    {
                        cType: "race",
                        cValue: "human"
                    }
                ]
            },
            {
                text: "Mmm? Lucanis? It is how our continent is called.",
                conditions: []
            }
        ]);

        this.dialogueCache.set("continent", [
            {
                text: "Lucanis is a continent.",
                conditions: []
            }
        ]);

        this.dialogueCache.set("Lucanis provides", [
            {
                text: "We believe that Lucanis provides us with our life force.",
                conditions: [
                    {
                        "cType": "race",
                        "cValue": "human"
                    }
                ]
            }
        ]);
    }

    getTopicsAhoCorasick() {
        const topics = this.getAllTopics();
        const ac = new AhoCorasick(topics);
        return ac;
    }

    getAllTopics() {
        return Array.from(this.dialogueCache.keys()).filter(topic => !topic.startsWith("_"));
    }

    getDialogueLine(npcDialogueState: NPCDialogueState): Option<string> {
        const dialogueLines = this.dialogueCache.get(npcDialogueState.topic) ?? [];

        for (const line of dialogueLines) {
            let conditionsMet = true;
            for (const condition of line.conditions) {
                if (condition.cType === "npc") {
                    conditionsMet = conditionsMet && condition.cValue === npcDialogueState.npc.name;
                } else if (condition.cType === "race") {
                    conditionsMet = conditionsMet && condition.cValue === npcDialogueState.npc.race.name;
                }
            }
            if (conditionsMet) {
                return some(line.text);
            }
        }

        return none();
    }
}

export const dialogueService = new DialogueService();
