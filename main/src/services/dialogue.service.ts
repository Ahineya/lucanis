import {Character} from "./chargen.service.ts";
import AhoCorasick from "ahocorasick";
import {combine, List, none, option, Option, some} from "../lib/option.lib.ts";
import {EffectDSL, effectService} from "./effect.service.ts";
import {resolveResource} from "@tauri-apps/api/path";
import {readTextFile} from "@tauri-apps/plugin-fs";
import {GameMap} from "./worldgen.service.ts";
import {randomService} from "./random.service.ts";
import {dialogueStore} from "../stores/dialogue.store.ts";

type NPCDialogueState = {
    npc: Character;
    topic: string;
}

export type EffectDSL = {
    effect: string; // stack-based DSL
}

export type ConditionDSL = {
    condition: string; // stack-based DSL
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

export function replaceVariablesInText(line: {text: string}, npcMap: Map<string, {
    npc: Character;
    mapIndex: number;
    pointIndex: number
}>, maps: GameMap[]) {
    const regex = /\$NPC_[a-zA-Z0-9_]+/g;
    line.text = line.text.replace(regex, (match: string) => {
        return npcMap.get(match)?.npc.name ?? match;
    });

    const regex21 = /\$HE_NPC_[a-zA-Z0-9_]+/g;
    line.text = line.text.replace(regex21, (match: string) => {
        // console.log(`Matched ${match}`);
        // console.log(npcMap);

        const npcRef = match.replace("HE_", "");

        const npc = option(npcMap.get(npcRef)?.npc); // unsafe
        return npc.map(n => n.gender === "male" ? "he" : "she").unwrapOr("they");
    });

    const regex22 = /\$HIM_NPC_[a-zA-Z0-9_]+/g;
    line.text = line.text.replace(regex22, (match: string) => {
        // console.log(`Matched ${match}`);
        // console.log(npcMap);

        const npcRef = match.replace("HIM_", "");

        const npc = option(npcMap.get(npcRef)?.npc); // unsafe
        return npc.map(n => n.gender === "male" ? "him" : "her").unwrapOr("them");
    });

    const regex3 = /\$LOC_NPC_[a-zA-Z0-9_]+/g;
    line.text = line.text.replace(regex3, (match: string) => {
        console.log(`Matched ${match}`);
        console.log(npcMap);

        const npcRef = match.replace("LOC_", "");

        const mapIndex = option(npcMap.get(npcRef)?.mapIndex); // unsafe
        return mapIndex.map(n => maps[n].name).unwrapOr("somewhere");
    });

    const regex4 = /\$POINT_NPC_[a-zA-Z0-9_]+/g;
    line.text = line.text.replace(regex4, (match: string) => {
        // console.log(`Matched ${match}`);
        // console.log(npcMap);

        const npcRef = match.replace("POINT_", "");

        const mapIndex = option(npcMap.get(npcRef)?.mapIndex); // unsafe
        const pointIndex = option(npcMap.get(npcRef)?.pointIndex); // unsafe
        return combine([mapIndex, pointIndex]).map(([mi, pi]) => maps[mi].pointsData[pi].name).unwrapOr("somewhere");
    });
}

// Morrowind-like dialogue system
class DialogueService {
    dialogueCache = new Map<string, DialogueLine[]>();
    npcReferences = new Set<string>();

    async buildDialogueCache() {
        const resourcePath = await resolveResource(`dialogue/dialogue.json`);
        const dialogueData = JSON.parse(await readTextFile(resourcePath));

        for (const [topic, lines] of Object.entries(dialogueData)) {
            this.dialogueCache.set(topic, lines.map((line: any) => ({
                text: line.text,
                conditions: line.conditions,
                effect: line.effect
            })));
        }
    }

    resolveNpcs(maps: GameMap[]) {
        // Search the cache for all npc references in conditions
        for (const dialogueLines of this.dialogueCache.values()) {
            for (const line of dialogueLines) {
                for (const condition of line.conditions) {
                    if (condition.cType === "npc") {
                        this.npcReferences.add(condition.cValue);
                    } else if (condition.cType === "dsl") {
                        const tokens = condition.cValue.split(" ");
                        for (const token of tokens) {
                            if (token.startsWith("$NPC_")) {
                                this.npcReferences.add(token);
                            }
                        }
                    }
                }
            }
        }

        for (const topic in this.dialogueCache.keys()) {
            if (topic.startsWith("$NPC_")) {
                this.npcReferences.add(topic);
            }
        }

        // Randomly assign npcs from maps to the references
        const npcMap = new Map<string, {
            npc: Character,
            mapIndex: number,
            pointIndex: number
        }>(); // $NPC_ -> npc id
        for (const npcReference of this.npcReferences) {
            const mmaps: Character[][][] = maps.map(map => map.characters); // Characters per map point
            const mi = randomService.pickIndex(mmaps);
            const map = mmaps[mi];
            const pc = randomService.pickIndex(map);
            const pointCharacters = map[pc];
            const npci = randomService.pickIndex(pointCharacters);
            const npc = pointCharacters[npci];
            npcMap.set(npcReference, {
                npc,
                mapIndex: mi,
                pointIndex: pc
            });

            // search npc id in the map to get indexes
            let mapIndex = 0;
            let pointIndex = 0;

            for (let i = 0; i < mmaps.length; i++) {
                const map = mmaps[i];
                for (let j = 0; j < map.length; j++) {
                    const point = map[j];
                    if (point.includes(npc)) {
                        mapIndex = i;
                        pointIndex = j;
                        break;
                    }
                }
            }

            console.log(`Assigned ${npc.name} to ${npcReference}. Map: ${mapIndex}, Point: ${pointIndex}`);
        }

        // Replace npc references with npc ids
        for (const dialogueLines of this.dialogueCache.values()) {
            for (const line of dialogueLines) {
                for (const condition of line.conditions) {
                    if (condition.cType === "npc") {
                        condition.cValue = npcMap.get(condition.cValue)?.npc.id ?? condition.cValue;
                    } else if (condition.cType === "dsl") {
                        const tokens = condition.cValue.split(" ");
                        for (let i = 0; i < tokens.length; i++) {
                            if (tokens[i].startsWith("$NPC_")) {
                                tokens[i] = npcMap.get(tokens[i])?.npc.id ?? tokens[i];
                            }
                        }
                        condition.cValue = tokens.join(" ");
                    }
                }

                replaceVariablesInText(line, npcMap, maps);

                console.log(`Replaced npc references in ${line.text}`);
            }
        }

        for (const topic of this.dialogueCache.keys()) {
            if (topic.startsWith("$NPC_")) {
                const name = npcMap.get(topic)?.npc.name;
                const dialogueLines = this.dialogueCache.get(topic);
                this.dialogueCache.delete(topic);
                console.log(`Renamed topic ${topic} to ${name}`);
                this.dialogueCache.set(name, dialogueLines);
            }
        }

        return npcMap;
    }

    getTopicsAhoCorasick() {
        const topics = this.getAllTopics();
        return new AhoCorasick(topics);
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
                    conditionsMet = conditionsMet && condition.cValue === npcDialogueState.npc.id;
                } else if (condition.cType === "race") {
                    conditionsMet = conditionsMet && condition.cValue === npcDialogueState.npc.race.name;
                } else if (condition.cType === "dsl") {
                    conditionsMet = conditionsMet && effectService.executeCondition({condition: condition.cValue}, npcDialogueState.npc).map(v => !!v).unwrapOr(false);
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
