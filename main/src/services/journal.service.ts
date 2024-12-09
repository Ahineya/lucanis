import {FMap, Option} from "../lib/option.lib.ts";
import {resolveResource} from "@tauri-apps/api/path";
import {readTextFile} from "@tauri-apps/plugin-fs";
import {Character} from "./chargen.service.ts";
import {GameMap} from "./worldgen.service.ts";
import {replaceVariablesInText} from "./dialogue.service.ts";

type JournalData = {
    title: string;
    entries: JournalEntry[];
}

export type JournalEntry = {
    id: string;
    value: number;
    text: string;
    // conditions: JournalCondition[];
}

class JournalService {
    private journalCache: FMap<string, JournalEntry[]> = new FMap();
    private journalTitleCache: FMap<string, string> = new FMap();

    async buildJournalCache() {
        const resourcePath = await resolveResource(`journal/journal.json`);
        const journalData: Record<string, JournalData> = JSON.parse<Record<string, JournalData>>(await readTextFile(resourcePath));

        for (const [id, data] of Object.entries(journalData)) {
            this.journalCache.set(id, data.entries);
            this.journalTitleCache.set(id, data.title);
        }

        console.log(this.journalCache);
    }

    resolveNpcs(maps: GameMap[], npcMap: Map<string, {
        npc: Character,
        mapIndex: number,
        pointIndex: number
    }>) {
        for (const journalEntries of this.journalCache.values()) {
            for (const entry of journalEntries) {
                replaceVariablesInText(entry, npcMap, maps);
            }
        }
    }

    getJournalEntry(id: string, value: number): Option<JournalEntry> {
        return this.journalCache.get(id).map(entries => entries.find(entry => entry.value === value));
    }
}

export const journalService = new JournalService();