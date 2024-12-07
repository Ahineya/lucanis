import {StoreSubject} from "../lib/store-subject/store-subject.ts";
import {List, Option} from "../lib/option.lib.ts";

export type JournalRecord = {
    id: string; // Will be the same as quest id?
    stage: number;
}

class JournalStore {
    public records = new StoreSubject<List<JournalRecord>>(new List<JournalRecord>());

    public addRecord(record: JournalRecord) {
        console.log("Adding record", record);
        this.records.next(this.records.getValue().addImmutable(record));
    }

    public hasRecordStage(id: string, stage: number): boolean {
        return this.records.getValue().findRight((record) => record.id === id && record.stage === stage).isSome();
    }

    public getRecordStage(id: string): Option<JournalRecord> {
        return this.records.getValue().findRight((record) => record.id === id);
    }
}

export const journalStore = new JournalStore();
