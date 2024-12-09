import {useStoreSubscribe} from "../../lib/store-subject/use-store-subscribe.hook.ts";
import {journalStore} from "../../stores/journal.store.ts";

export const JournalWindow = () => {
    const entries = useStoreSubscribe(journalStore.entries);

    return (
        <div className="grow overflow-auto p-2">
            <h1>Journal</h1>
            <ul>
                {entries.toArray().map((entry) => (
                    <li key={entry.id}>
                        <h2>{entry.text}</h2>
                        <p>{entry.value}</p>
                    </li>
                ))}
            </ul>
        </div>
    )
}
