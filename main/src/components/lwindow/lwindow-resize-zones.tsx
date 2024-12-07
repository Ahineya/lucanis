import {TWindow, windowsStore} from "../../stores/windows.store.ts";
import React, {FC} from "react";

type Props = {
    win: TWindow;
}

export const LWindowResizeZones: FC<Props> = ({win: {id, x, y, width, height}}) => {

    const seResize = (e: React.MouseEvent) => {
        e.preventDefault();

        const drag = (e: MouseEvent) => {
            if (e.clientX < 0) return;
            if (e.clientY < 0) return;
            if (e.clientX > window.innerWidth) return;
            if (e.clientY > window.innerHeight) return;

            const dx = e.clientX - x - width;
            const dy = e.clientY - y - height;
            if (width + dx < 200) return;
            if (height + dy < 200) return;

            windowsStore.setWindowSize(id, width + dx, height + dy);
        }

        const endDrag = () => {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", endDrag);
        }

        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", endDrag);
    }

    const nwResize = (e: React.MouseEvent) => {
        e.preventDefault();

        const drag = (e: MouseEvent) => {
            if (e.clientX < 0) return;
            if (e.clientY < 0) return;
            if (e.clientX > window.innerWidth) return;
            if (e.clientY > window.innerHeight) return;

            const dx = e.clientX - x;
            const dy = e.clientY - y;
            if (width - dx < 200) return;
            if (height - dy < 200) return;

            windowsStore.setWindowSize(id, width - dx, height - dy);
            windowsStore.setWindowPos(id, x + dx, y + dy);
        }

        const endDrag = () => {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", endDrag);
        }

        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", endDrag);
    }

    const neResize = (e: React.MouseEvent) => {
        e.preventDefault();

        const drag = (e: MouseEvent) => {
            if (e.clientX < 0) return;
            if (e.clientY < 0) return;
            if (e.clientX > window.innerWidth) return;
            if (e.clientY > window.innerHeight) return;

            const dx = e.clientX - x - width;
            const dy = e.clientY - y;
            if (width + dx < 200) return;
            if (height - dy < 200) return;

            windowsStore.setWindowSize(id, width + dx, height - dy);
            windowsStore.setWindowPos(id, x, y + dy);
        }

        const endDrag = () => {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", endDrag);
        }

        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", endDrag);
    }

    const swResize = (e: React.MouseEvent) => {
        e.preventDefault();

        const drag = (e: MouseEvent) => {
            if (e.clientX < 0) return;
            if (e.clientY < 0) return;
            if (e.clientX > window.innerWidth) return;
            if (e.clientY > window.innerHeight) return;

            const dx = e.clientX - x;
            const dy = e.clientY - y - height;
            if (width - dx < 200) return;
            if (height + dy < 200) return;

            windowsStore.setWindowSize(id, width - dx, height + dy);
            windowsStore.setWindowPos(id, x + dx, y);
        }

        const endDrag = () => {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", endDrag);
        }

        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", endDrag);
    }

    const nResize = (e: React.MouseEvent) => {
        e.preventDefault();

        const drag = (e: MouseEvent) => {
            if (e.clientX < 0) return;
            if (e.clientY < 0) return;
            if (e.clientX > window.innerWidth) return;
            if (e.clientY > window.innerHeight) return;

            const dy = e.clientY - y;
            if (height + dy < 200) return

            windowsStore.setWindowSize(id, width, height - dy);
            windowsStore.setWindowPos(id, x, y + dy);
        }

        const endDrag = () => {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", endDrag);
        }

        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", endDrag);
    }

    const eResize = (e: React.MouseEvent) => {
        e.preventDefault();

        const drag = (e: MouseEvent) => {
            if (e.clientX < 0) return;
            if (e.clientY < 0) return;
            if (e.clientX > window.innerWidth) return;
            if (e.clientY > window.innerHeight) return;

            const dx = e.clientX - x - width;
            if (width + dx < 200) return;

            windowsStore.setWindowSize(id, width + dx, height);
        }

        const endDrag = () => {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", endDrag);
        }

        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", endDrag);
    }

    const sResize = (e: React.MouseEvent) => {
        e.preventDefault();

        const drag = (e: MouseEvent) => {
            if (e.clientX < 0) return;
            if (e.clientY < 0) return;
            if (e.clientX > window.innerWidth) return;
            if (e.clientY > window.innerHeight) return;

            const dy = e.clientY - y - height;
            if (height + dy < 200) return;

            windowsStore.setWindowSize(id, width, height + dy);
        }

        const endDrag = () => {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", endDrag);
        }

        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", endDrag);
    }

    const wResize = (e: React.MouseEvent) => {
        e.preventDefault();

        const drag = (e: MouseEvent) => {
            if (e.clientX < 0) return;
            if (e.clientY < 0) return;
            if (e.clientX > window.innerWidth) return;
            if (e.clientY > window.innerHeight) return;

            const dx = e.clientX - x;

            if (width - dx < 200) return;

            windowsStore.setWindowSize(id, width - dx, height);
            windowsStore.setWindowPos(id, x + dx, y);
        }

        const endDrag = () => {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", endDrag);
        }

        window.addEventListener("mousemove", drag);
        window.addEventListener("mouseup", endDrag);
    }

    return (
        <div className="absolute inset-0 flex pointer-events-none w-full h-full">
            <div className="absolute w-full h-2 cursor-n-resize pointer-events-auto"
                 onMouseDown={nResize}/>
            <div className="absolute w-2 h-full cursor-w-resize pointer-events-auto"
                 onMouseDown={wResize}/>
            <div className="absolute w-2 h-full cursor-e-resize pointer-events-auto right-0"
                 onMouseDown={eResize}/>
            <div className="absolute w-full h-2 cursor-s-resize pointer-events-auto bottom-0"
                 onMouseDown={sResize}/>

            <div className="absolute w-2 h-2 cursor-nwse-resize pointer-events-auto"
                 onMouseDown={nwResize}/>
            <div className="absolute w-2 h-2 cursor-nesw-resize pointer-events-auto right-0"
                 onMouseDown={neResize}/>
            <div className="absolute w-2 h-2 cursor-nwse-resize pointer-events-auto right-0 bottom-0"
                 onMouseDown={seResize}/>
            <div className="absolute w-2 h-2 cursor-nesw-resize pointer-events-auto bottom-0"
                 onMouseDown={swResize}/>
        </div>
    )
}