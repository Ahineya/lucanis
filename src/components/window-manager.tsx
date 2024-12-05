import {useStoreSubscribe} from "../lib/store-subject/use-store-subscribe.hook.ts";
import {windowsStore} from "../stores/windows.store.ts";
import {useMemo} from "react";
import {LWindow} from "./lwindow/lwindow.tsx";
import {MapWindow} from "./map-window/map-window.tsx";
import {LocationWindow} from "./location-window/location-window.tsx";
import {ActionWindow} from "./action-window/action-window.tsx";
import {NarrativeWindow} from "./narrative-window/narrative-window.tsx";

export const WindowManager = () => {
    const windows = useStoreSubscribe(windowsStore.windows);
    const activeWindow = useStoreSubscribe(windowsStore.activeWindow);
    const windowOrder = useStoreSubscribe(windowsStore.windowOrder);

    const orderedWindows = useMemo(() => {
        return windowOrder.map(windowId => windows.find(window => window.id === windowId));
    }, [windowOrder, windows]);

    return (
        <div className="h-full w-full flex-grow overflow-hidden relative">
            {
                orderedWindows.map(window => {
                    return (
                        <LWindow win={window} key={window.id}>
                            {window.id === "map" && (
                                <MapWindow/>
                            )}
                            {
                                window.id === "location" && (
                                    <LocationWindow/>
                                )
                            }
                            {
                                window.id === "action" && (
                                    <ActionWindow/>
                                )
                            }
                            {
                                window.id === "narrative" && (
                                    <NarrativeWindow/>
                                )
                            }
                        </LWindow>
                    )
                })
            }
        </div>
    )
}