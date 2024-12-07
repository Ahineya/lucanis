import {FC, useRef} from "react";
import {TWindow, windowsStore} from "../../stores/windows.store.ts";

type Props = {
    win: TWindow;
}

export const LWindowHeader: FC<Props> = ({win: {id, x, y, width, height, title}}) => {
    const dragStartPos = useRef<{x: number, y: number} | null>(null);

    const startDrag = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        windowsStore.selectWindow(id);

        dragStartPos.current = {
            x: e.clientX - x,
            y: e.clientY - y,
        }

        const drag = (e: MouseEvent) => {
            if (!dragStartPos.current) return;

            let dx = e.clientX - dragStartPos.current.x;
            let dy = e.clientY - dragStartPos.current.y;

            if (dx < 0) dx = 0;
            if (dy < 0) dy = 0;

            if (dx + width > window.innerWidth) dx = window.innerWidth - width;
            if (dy + height > window.innerHeight) dy = window.innerHeight - height

            windowsStore.setWindowPos(id, dx, dy);
        }

        const endDrag = () => {
            document.removeEventListener("mousemove", drag);
            document.removeEventListener("mouseup", endDrag);

            dragStartPos.current = null;
        }

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", endDrag);
    }

    return (
        <div
            className="h-6 min-h-6 border-b border-primary bg-bg px-2 text-sm flex items-center"
            onMouseDown={startDrag}
        >
            {title}
        </div>
    )
}
