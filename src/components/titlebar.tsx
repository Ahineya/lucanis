import {getCurrentWindow} from '@tauri-apps/api/window';

export const TitleBar = () => {


    return (
        <div data-tauri-drag-region className="titlebar">
            <button
                className="titlebar-button"
                onClick={() => {
                    const win = getCurrentWindow();
                    win.minimize();
                }}>
                <img
                    src="https://api.iconify.design/mdi:window-minimize.svg"
                    alt="minimize"
                />
            </button>
            <button
                className="titlebar-button"
                onClick={() => {
                    const win = getCurrentWindow();
                    win.toggleMaximize();
                }}
            >
                <img
                    src="https://api.iconify.design/mdi:window-maximize.svg"
                    alt="maximize"
                />
            </button>
            <button
                className="titlebar-button"
                onClick={() => {
                    const win = getCurrentWindow();
                    win.close();
                }}

            >
                <img src="https://api.iconify.design/mdi:close.svg" alt="close"/>
            </button>
        </div>
    )
}