import {Character} from "./chargen.service.ts";
import AhoCorasick from "ahocorasick";
import {List, none, Option, some} from "../lib/option.lib.ts";
import {EffectDSL, effectService} from "./effect.service.ts";

type NPCDialogueState = {
    npc: Character;
    topic: string;
}

type DialogueCondition = {
    cType: "npc" | "race" | "dsl";
    cValue: string;
}

type DialogueLine = {
    text: string;
    conditions: DialogueCondition[];
    effect?: EffectDSL;
}

type CacheRecord = {
    topic: string;
    dialogue: DialogueLine[];
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

        this.dialogueCache.set("life force", [
            {
                text: "Life force is the energy that keeps us alive. You want to know more? Ask the elders.",
                conditions: [
                    {
                        "cType": "race",
                        "cValue": "human"
                    }
                ],
                effect: {
                    effect: "quest_id 10 set_journal_stage",
                }
            }
        ]);

        this.dialogueCache.set("life force", [
            {
                text: "Life force? What you need to know about it, is that there is a Source of it. And it is not what you think.",
                conditions: [
                    {
                        "cType": "race",
                        "cValue": "halfdemon"
                    },
                    {
                        "cType": "dsl",
                        "cValue": "quest_id get_journal_stage 10 ="
                    }
                ],
                effect: {
                    effect: "quest_id 20 set_journal_stage",
                }
            },
            {
                text: "Life force? I told you everything I know.",
                conditions: [
                    {
                        "cType": "race",
                        "cValue": "halfdemon"
                    },
                    {
                        "cType": "dsl",
                        "cValue": "quest_id get_journal_stage 15 >"
                    }
                ],
                effect: {
                    effect: "quest_id 20 set_journal_stage",
                }
            },
            {
                text: "Life force is the energy that keeps us alive. You want to know more? Ask the elders.",
                conditions: [
                    {
                        "cType": "race",
                        "cValue": "human"
                    }
                ],
                effect: {
                    effect: "quest_id 10 set_journal_stage",
                }
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

    getDialogueLine(npcDialogueState: NPCDialogueState, skipEffects = false): Option<string> {
        const dialogueLines = this.dialogueCache.get(npcDialogueState.topic) ?? [];

        for (const line of dialogueLines) {
            let conditionsMet = true;
            for (const condition of line.conditions) {
                if (condition.cType === "npc") {
                    conditionsMet = conditionsMet && condition.cValue === npcDialogueState.npc.name;
                } else if (condition.cType === "race") {
                    conditionsMet = conditionsMet && condition.cValue === npcDialogueState.npc.race.name;
                } else if (condition.cType === "dsl") {
                    conditionsMet = conditionsMet && effectService.executeCondition({condition: condition.cValue}).map(v => !!v).unwrapOr(false);
                }

                if (!conditionsMet) {
                    break;
                }
            }
            if (conditionsMet) {
                if (line.effect && !skipEffects) {
                    effectService.executeEffect(line.effect);
                }
                return some(line.text);
            }
        }

        return none();
    }

    knowsTopic(npc: Character, topic: string) {
        return this.dialogueCache.has(topic) && this.getDialogueLine({npc, topic}, true).isSome();
    }
}

export const dialogueService = new DialogueService();
