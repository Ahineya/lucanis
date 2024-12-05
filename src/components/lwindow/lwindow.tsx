import {FC, HTMLProps, PropsWithChildren} from "react";
import {TWindow, windowsStore} from "../../stores/windows.store.ts";
import {LWindowHeader} from "./lwindow-header.tsx";
import {LWindowResizeZones} from "./lwindow-resize-zones.tsx";

type Props = PropsWithChildren<{
    win: TWindow;
}> & HTMLProps<HTMLDivElement>;

export const LWindow: FC<Props> = ({
                                       win,
                                       children,
                                   }) => {
    return (
        <div
            className="absolute bg-secondary shadow-2xl border border-primary flex flex-col overflow-hidden"
            style={{
                left: win.x,
                top: win.y,
                width: win.width,
                height: win.height,
            }}
            onClick={() => windowsStore.selectWindow(win.id)}
        >
            <LWindowHeader win={win}/>
            <div className="flex overflow-hidden flex-grow">
                {children}
            </div>
            <LWindowResizeZones win={win}/>
        </div>
    )
}
