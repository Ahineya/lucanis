import {StoreSubject} from "../lib/store-subject/store-subject.ts";
import {List, Option} from "../lib/option.lib.ts";
import {JournalEntry, journalService} from "../services/journal.service.ts";

export type JournalState = {
    id: string; // Will be the same as quest id?
    stage: number;
}

class JournalStore {
    public currentState = new StoreSubject<List<JournalState>>(new List<JournalState>());
    public entries = new StoreSubject<List<JournalEntry>>(new List<JournalEntry>());

    public addRecord(record: JournalState) {
        this.currentState.next(this.currentState.getValue().addImmutable(record));

        const journalEntry = journalService.getJournalEntry(record.id, record.stage);

        journalEntry.map((entry) => {
            this.entries.next(this.entries.getValue().addImmutable(entry));
        });
    }

    public hasRecordStage(id: string, stage: number): boolean {
        return this.currentState.getValue().findRight((record) => record.id === id && record.stage === stage).isSome();
    }

    public getRecordStage(id: string): Option<JournalState> {
        return this.currentState.getValue().findRight((record) => record.id === id);
    }
}

export const journalStore = new JournalStore();
