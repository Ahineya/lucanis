import {StoreSubject} from "../lib/store-subject/store-subject.ts";
import {GameMap, OverworldMap, worldgenService} from "../services/worldgen.service.ts";
import {none, Option, some} from "../lib/option.lib.ts";
import {Character} from "../services/chargen.service.ts";
import {dialogueStore} from "./dialogue.store.ts";

type PlayerPosition = {
    mapIndex: number;
    pointIndex: number;
    x: number;
    y: number;
}

export type GameAction = "talk";

class GameStore {
    private world = null;

    private overworldPos = 0;

    public currentMap = new StoreSubject<Option<GameMap>>(none());
    public overworldMap = new StoreSubject<Option<OverworldMap>>(none());
    public position = new StoreSubject<PlayerPosition>({mapIndex: 0, pointIndex: 0, x: 0, y: 0});

    public selectedAction = new StoreSubject<Option<GameAction>>(none());
    public activeAction = new StoreSubject<Option<GameAction>>(none());
    public actionSubject = new StoreSubject<Option<any>>(none());

    public narrativeEvents = new StoreSubject<any[]>([]);

    public async newGame() {
        // const {points, edges} = worldgenService.generateMap();
        // this.currentMap.next({points, edges} as GameMap);
        const world = await worldgenService.generateWorld();
        this.overworldMap.next(some(world.overworld));
        const [x, y] = world.overworld.layout.points[0];

        this.position.next({mapIndex: 0, pointIndex: 0, x, y});

        this.world = world;
    }

    public setAction(mbAction: Option<GameAction>) {
        this.selectedAction.next(mbAction);
    }

    public setActiveAction(mbAction: Option<GameAction>) {
        this.activeAction.next(mbAction);
    }

    public setActionSubject(mbAction: Option<any>) {
        this.actionSubject.next(mbAction);
    }

    public pushNarrativeEvent(event: any) {
        this.narrativeEvents.next([...this.narrativeEvents.getValue(), event]);
    }

    public clearNarrativeEvents() {
        this.narrativeEvents.next([]);
    }

    public createNarrativeEvent(character: Character) {
        const action = this.selectedAction.getValue().unwrap();

        if (action === "talk") {
            const id = dialogueStore.startDialogue(character);
            this.narrativeEvents.next([...this.narrativeEvents.getValue(), {type: "talk", id}]);
        }

        this.setAction(none());
    }

    public enterLocation() {
        this.overworldPos = this.position.getValue().pointIndex;
        // const mapIndex = this.position.getValue().mapIndex;
        this.currentMap.next(some(this.world.maps[this.overworldPos]));
        const [x, y] = this.world.maps[this.overworldPos].layout.points[0];
        this.position.next({mapIndex: this.overworldPos, pointIndex: 0, x, y});
        this.pushNarrativeEvent({type: "enter", mapName: this.world.maps[this.overworldPos].name});
        dialogueStore.endDialogue();
    }

    public exitLocation() {
        const cm = this.currentMap.getValue();
        if (cm.isNone()) return;

        const mapName = cm.unwrap().name;

        const mapIndex = this.position.getValue().mapIndex;

        const [x, y] = this.world.overworld.layout.points[this.overworldPos];
        this.position.next({mapIndex, pointIndex: this.overworldPos, x, y});

        this.currentMap.next(none());
        this.pushNarrativeEvent({type: "exit", mapName});
        dialogueStore.endDialogue();
    }
}

export const gameStore = new GameStore();