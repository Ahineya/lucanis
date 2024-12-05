import {gameStore} from "../../stores/game.store.ts";
import {useStoreSubscribe} from "../../lib/store-subject/use-store-subscribe.hook.ts";
import {Dialogue} from "./dialogue.tsx";
import {match} from "../../lib/option.lib.ts";

export const NarrativeWindow = () => {
    const narrativeEvents = useStoreSubscribe(gameStore.narrativeEvents);

    return (
        <div className="flex flex-col gap-2 grow overflow-auto p-2">
            {
                narrativeEvents.map((event, index) => match(event.type, {
                    talk: () => <Dialogue key={index} narrativeEvent={event}/>,
                    enter: () => <div key={index}><span className="text-cyan-300">Entered</span> {event.mapName}</div>,
                    exit: () => <div key={index}><span className="text-cyan-300">Exited</span> {event.mapName}</div>,
                    _: () => <div key={index}>{event.type}</div>
                }))
            }
        </div>
    );
}
