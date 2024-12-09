import {StoreSubject} from "../lib/store-subject/store-subject.ts";
import {configService} from "../services/config.service.ts";

export type TWindow = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    title: string;
    hidden?: boolean;
}

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

class WindowsStore {
    public windows = new StoreSubject<TWindow[]>([]);
    public activeWindow = new StoreSubject<string | null>(null);
    public windowOrder = new StoreSubject<string[]>([]);

    constructor() {
        this.load();
    }

    public load() {
        configService.readConfigFile().then(data => {
            if (!data) {
                this.addWindow({
                    id: "map",
                    x: 0,
                    y: 0,
                    width: 200,
                    height: 200,
                    title: "Map",
                });

                this.addWindow({
                    id: "location",
                    x: 100,
                    y: 100,
                    width: 200,
                    height: 200,
                    title: "Location",
                });

                this.addWindow({
                    id: "action",
                    x: 200,
                    y: 200,
                    width: 200,
                    height: 200,
                    title: "Action",
                });

                this.addWindow({
                    id: "narrative",
                    x: 300,
                    y: 300,
                    width: 200,
                    height: 200,
                    title: "Narrative",
                })
            } else {
                const {windows, activeWindow, windowOrder} = JSON.parse(data);
                this.windows.next(windows);
                this.activeWindow.next(activeWindow);
                this.windowOrder.next(windowOrder);
            }

            this.selectWindow("location");
        });
    }

    public addWindow(window: TWindow) {
        this.windows.next([...this.windows.getValue(), window]);
        this.windowOrder.next([...this.windowOrder.getValue(), window.id]);
    }

    public selectWindow(id: string) {
        if (this.activeWindow.getValue() === id) return;

        this.activeWindow.next(id);
        this.windowOrder.next([...this.windowOrder.getValue().filter(windowId => windowId !== id), id]);

        this.storeWindowData();
    }

    public setWindowPos(id: string, x: number, y: number) {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > window.innerWidth) x = window.innerWidth;
        if (y > window.innerHeight) y = window.innerHeight;

        this.windows.next(this.windows.getValue().map(window => {
            if (window.id === id) {
                return {
                    ...window,
                    x,
                    y,
                }
            }
            return window;
        }));

        this.storeWindowData();
    }

    public setWindowSize(id: string, width: number, height: number) {
        if (width < 200) width = 200;
        if (height < 200) height = 200;

        const w = this.windows.getValue().find(window => window.id === id);
        if (!w) return;

        if (w.x + width > window.innerWidth) width = window.innerWidth - w.x;
        if (w.y + height > window.innerHeight) height = window.innerHeight - w.y;

        this.windows.next(this.windows.getValue().map(window => {
            if (window.id === id) {
                return {
                    ...window,
                    width,
                    height,
                }
            }
            return window;
        }));

        this.storeWindowData();
    }

    public closeWindow(id: string) {
        this.windows.next(this.windows.getValue().map(window => {
            if (window.id === id) {
                return {
                    ...window,
                    hidden: true,
                }
            }
            return window;
        }));

        this.storeWindowData();
    }

    public openWindow(id: string) {
        this.windows.next(this.windows.getValue().map(window => {
            if (window.id === id) {
                return {
                    ...window,
                    hidden: false,
                }
            }
            return window;
        }));

        this.selectWindow(id);

        this.storeWindowData();
    }

    public toggleWindow(id: string) {
        const window = this.windows.getValue().find(window => window.id === id);
        if (!window) {
            this.addWindow({
                id,
                x: 50,
                y: 50,
                width: 400,
                height: 200,
                title: capitalize(id),
            });
            return;
        }

        if (window.hidden) {
            this.openWindow(id);
        } else {
            this.closeWindow(id);
        }
    }

    private async storeWindowData() {
        const windows = this.windows.getValue();
        const activeWindow = this.activeWindow.getValue();
        const windowOrder = this.windowOrder.getValue();

        const data = {
            windows,
            activeWindow,
            windowOrder,
        };

        return configService.writeConfigFile(JSON.stringify(data));
    }
}

export const windowsStore = new WindowsStore();