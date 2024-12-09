import clsx from "clsx";
import {useState} from "react";
import {useClickOutside} from "../lib/native-events.hooks.ts";
import {windowsStore} from "../stores/windows.store.ts";
import {useStoreSubscribe} from "../lib/store-subject/use-store-subscribe.hook.ts";
import {stopPropagation} from "../lib/stop-propagation.ts";

export const MainMenuBar = () => {
    const windows = useStoreSubscribe(windowsStore.windows);
    const [menuOpen, setMenuOpen] = useState(false);

    const [windowDropdownOpen, setWindowDropdownOpen] = useState(false);

    useClickOutside(".window-menu", () => {
        if (windowDropdownOpen) {
            setWindowDropdownOpen(false);
        }
    });

    return (
        <div className={clsx(
            "absolute top-0 left-0 right-0 h-8 min-h-8 flex items-center justify-between",
            "border-b border-primary bg-bg",
            "transition-transform duration-200",
            "drop-shadow",
            {
                "translate-y-0": menuOpen,
                "-translate-y-full": !menuOpen,
            }
            )}
        >
            <div className="flex items-center">
                <button
                    className="window-menu ml-4"
                    onClick={() => {
                        setWindowDropdownOpen(!windowDropdownOpen)
                    }}
                >
                    Window &darr;

                    {windowDropdownOpen && (
                        <div className="absolute top-8 left-0 bg-bg border border-primary">
                            <div className="flex flex-col">
                                <button
                                    className="p-2 flex justify-between gap-4 hover:bg-secondary"
                                    onClick={stopPropagation(() => {
                                        windowsStore.toggleWindow("map");
                                    })}
                                >
                                    <span>Map</span>
                                    <span>{
                                        windows.find(win => win.id === "map")?.hidden
                                            ? ""
                                            : "✔"
                                    }</span>
                                </button>
                                <button
                                    className="p-2 flex justify-between gap-4 hover:bg-secondary"
                                    onClick={stopPropagation(() => {
                                        windowsStore.toggleWindow("location");
                                    })}
                                >
                                    <span>Location</span>
                                    <span>{
                                        windows.find(win => win.id === "location")?.hidden
                                            ? ""
                                            : "✔"
                                    }</span>
                                </button>
                                <button
                                    className="p-2 flex justify-between gap-4 hover:bg-secondary"
                                    onClick={stopPropagation(() => {
                                        windowsStore.toggleWindow("action");
                                    })}
                                >
                                    <span>Action</span>
                                    <span>{
                                        windows.find(win => win.id === "action")?.hidden
                                            ? ""
                                            : "✔"
                                    }</span>
                                </button>
                                <button
                                    className="p-2 flex justify-between gap-4 hover:bg-secondary"
                                    onClick={stopPropagation(() => {
                                        windowsStore.toggleWindow("narrative");
                                    })}
                                >
                                    <span>Narrative</span>
                                    <span>{
                                        windows.find(win => win.id === "narrative")?.hidden
                                            ? ""
                                            : "✔"
                                    }</span>
                                </button>
                                <button
                                    className="p-2 flex justify-between gap-4 hover:bg-secondary"
                                    onClick={stopPropagation((e) => {
                                        windowsStore.toggleWindow("journal");
                                    })}
                                >
                                    <span>Journal</span>
                                    <span>{
                                        windows.find(win => win.id === "journal")?.hidden
                                            ? ""
                                            : "✔"
                                    }</span>
                                </button>
                            </div>
                        </div>
                    )}
                </button>
            </div>
            <div className="flex items-center">
                <div className="mr-4">Settings</div>
                <div className="mr-4">Exit</div>
            </div>

            {/*In the middle bottom, we want to have a menu bar toggle button. It should have a shape of a gem, like this:*/}
            <button
                className="absolute -bottom-[24px] left-[50%] -translate-x-[50%]"
                onClick={() => setMenuOpen(!menuOpen)}
            >
                <svg className="stroke-primary fill-bg" width="24" height="25" viewBox="0 0 24 25" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M3 1C4.83333 2.5 8.3 6.5 7.5 10.5C6.7 14.5 4.5 16.5 3.5 17C6.16667 17.1667 11.5 18.2 11.5 21C11.5 18.2 16.8333 17.1667 19.5 17C18.5 16.5 16.3 14.5 15.5 10.5C14.7 6.5 18.1667 2.5 20 1M10 10.5V16ZM13 10.5V16Z"
                        />
                    <path
                        d="M3 1C4.83333 2.5 8.3 6.5 7.5 10.5C6.7 14.5 4.5 16.5 3.5 17C6.16667 17.1667 11.5 18.2 11.5 21C11.5 18.2 16.8333 17.1667 19.5 17C18.5 16.5 16.3 14.5 15.5 10.5C14.7 6.5 18.1667 2.5 20 1M10 10.5V16M13 10.5V16"
                        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>


            </button>
        </div>
    )
}