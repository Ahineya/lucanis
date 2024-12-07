import {StoreSubject} from "../lib/store-subject/store-subject.ts";
import {configService} from "../services/config.service.ts";
import {windowsStore} from "./windows.store.ts";
import {gameStore} from "./game.store.ts";

export type LoadGame = {
    name: string;
}

class LoadStore {
    public loadGames = new StoreSubject<LoadGame[] | null>(null);
    public loadedGame = new StoreSubject<LoadGame | null>(null);
    public loadState = new StoreSubject<string[]>([]);

    constructor() {
        configService.readFile("games.json").then((data) => {
            if (data) {
                this.loadGames.next(JSON.parse(data));
            }
        });
    }

    public async loadGame(name: string) {
        const games = this.loadGames.getValue();

        if (!games) return;

        const game = games.find((g) => g.name === name);

        if (!game) return;

        this.loadedGame.next(game);
    }

    public pushLoadState(state: string) {
        this.loadState.next([...this.loadState.getValue(), state]);
    }

    public async newGame() {
        this.loadState.next([]);
        this.loadedGame.next(null);
        this.loadedGame.next({name: "Ahineya"});
        await gameStore.newGame();
        this.pushLoadState("loaded");
    }
}

export const loadStore = new LoadStore();