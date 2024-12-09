import PoissonDiskSampling from "poisson-disk-sampling";
import Delaunator from "delaunator";
import {findMST, Point} from "./mst.ts";
import {randomService} from "./random.service.ts";
import {generatorService} from "./generator.service.ts";
import {Character, chargenService} from "./chargen.service.ts";
import {allRaces} from "../lib/name-generator";
import {loadStore} from "../stores/load.store.ts";
import {findBridgesAndArticulationPoints, findEdgeCutsOfSizeTwo} from "../lib/graph/graph.ts";
import {dialogueService} from "./dialogue.service.ts";
import {dialogueStore} from "../stores/dialogue.store.ts";
import {journalService} from "./journal.service.ts";

export type GameMapLayout = {
    points: Point[] // Point is export type Point = { x: number; y: number };
    edges: number[][];
    bridges: number[][];
    ap: number[];
}

function findEdge(edges: number[][], from: number, to: number): number {
    return edges.findIndex(([a, b]) => (a === from && b === to) || (a === to && b === from));
}

function edgeLength(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function p2p(p: [x: number, y: number]): Point {
    return {x: p[0], y: p[1]};
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

type MapData = {
    layout: GameMapLayout;
    size: [number, number];
}

export type OverworldMap = {
    pointsData: MapPointData[];
} & MapData;

export type GameMap = {
    name: string;
    pointsData: MapPointData[];
    characters: Character[][]; // Characters in each point
} & MapData;

export type MapPointData = {
    type: string;
    name: string;
    description: string;
}

export type GameWorld = {
    overworld: OverworldMap;
    maps: GameMap[];
}

const TOTAL_MAPS = 5;

class WorldgenService {
    public async generateWorld(): Promise<GameWorld> {
        loadStore.pushLoadState('Generating world...');
        console.log('Generating world...');

        console.log('Generating overworld...');
        loadStore.pushLoadState('Generating overworld...');

        const overworld = await this.generateOverworldMap();

        console.log("Generated overworld", overworld);

        console.log('Generating maps...');
        loadStore.pushLoadState('Generating maps...');

        const TOTAL_MAPS = 5;//overworld.layout.points.length;

        // TODO: Connect with overworld map
        const names = new Set<string>();
        const characterNames = new Set<string>();
        const maps: GameMap[] = [];
        for (let i = 0; i < TOTAL_MAPS; i++) {
            const pointNames = new Set<string>();
            const map = await this.generateMap(names, pointNames, characterNames);
            maps.push(map);

            overworld.pointsData[i].name = map.name;

            console.log(`Generated map ${i + 1}/${TOTAL_MAPS}`, map);
            loadStore.pushLoadState(`Generated map ${i + 1}/${TOTAL_MAPS}`);
        }

        const charCount = maps.reduce((acc, map) => acc + map.characters.length, 0);

        loadStore.pushLoadState('Resolving NPCs in dialogues...');
        const npcMap = dialogueService.resolveNpcs(maps);
        loadStore.pushLoadState('Resolving NPCs in journal records...');
        journalService.resolveNpcs(maps, npcMap);
        dialogueStore.fillTopics();

        console.log('World generated!');
        console.log(`Generated ${maps.length} maps with total ${charCount} characters`);

        return {
            maps,
            overworld
        };
    }

    public async generateOverworldMap(): Promise<OverworldMap> {
        const layout = this.generateMapLayout({
            shape: [1000, 1000],
            minDistance: 70,
            maxDistance: 120,
            tries: 50
        });


        const pointTypes = this.generateOverworldMapPointTypes(layout.points.length);

        const pointsData = [];

        for (let i = 0; i < layout.points.length; i++) {
            let pointData = await this.generateOverworldMapPointData(pointTypes[i]);
            pointsData.push(pointData);
        }

        return {
            layout,
            pointsData,
            size: [1000, 1000]
        }
    }

    public async generateMap(names: Set<string>, pointNames: Set<string>, characterNames: Set<string>): Promise<GameMap> {
        let name = await this.generateMapLocationName();
        while (names.has(name)) {
            name = await this.generateMapLocationName();
        }

        names.add(name);

        const layout = this.generateMapLayout();

        const pointTypes = this.generateMapPointTypes(layout.points.length);

        const pointsData = [];

        for (let i = 0; i < layout.points.length; i++) {
            let pointData = await this.generateMapPointData(pointTypes[i]);
            while (pointNames.has(pointData.name)) {
                pointData = await this.generateMapPointData(pointTypes[i]);
            }
            pointNames.add(pointData.name);
            pointsData.push(pointData);
        }

        // For each point, generate 2-7 characters
        const characters = [];
        for (let i = 0; i < layout.points.length; i++) {
            const count = Math.floor(randomService.random() * 6) + 2;
            const pointCharacters = [];

            for (let j = 0; j < count; j++) {
                const gender = <'male' | 'female'>randomService.pick(['male', 'female']);
                const race = randomService.pick(allRaces.sorted());
                const character = await chargenService.generateCharacter(race, gender, characterNames);
                pointCharacters.push(character);
            }

            characters.push(pointCharacters);
        }

        return {
            layout,
            name,
            size: [500, 500],
            pointsData,
            characters
        }
    }

    generateOverworldMapPointTypes(count: number): string[] {
        // Let's try another, less random approach

        const types = [
            {item: 'town', 'min': 5, 'max': 10},
            {item: 'city', 'min': 3, 'max': 6},
            {item: 'village', 'min': 10, 'max': 20},
            {item: 'camp', 'min': 10, 'max': 20},
            {item: 'fort', 'min': 1, 'max': 3},
            {item: 'castle', 'min': 1, 'max': 3},
            {item: 'tower', 'min': 5, 'max': 10},
            {item: 'monastery', 'min': 1, 'max': 3},
            {item: 'temple', 'min': 4, 'max': 10},
        ]; // The rest will be:

        const rest = ['ruins', 'dungeon', 'cave', 'forest', 'mountain', 'lake'];

        const typeCount = {};

        for (const tpe of types) {
            typeCount[tpe.item] = 0;
        }

        for (const tpe of rest) {
            typeCount[tpe] = 0;
        }

        const result = [];

        for (let i = 0; i < types.length; i++) {
            const tpe = types[i];
            const count = Math.floor(randomService.random() * (tpe.max - tpe.min + 1)) + tpe.min;
            for (let j = 0; j < count; j++) {
                result.push(tpe.item);
                typeCount[tpe.item]++;
            }
        }

        const resultLength = result.length;

        for (let i = 0; i <= count - resultLength; i++) {
            const tpe = randomService.pick(rest);
            result.push(tpe);
            typeCount[tpe]++;
        }

        // Shuffle
        for (let i = 0; i < result.length; i++) {
            const j = Math.floor(randomService.random() * result.length);
            const temp = result[i];
            result[i] = result[j];
            result[j] = temp;
        }

        return result;
    }

    generateMapPointTypes(count: number): string[] {
        // Let's try another, less random approach

        const types = [
            {item: 'gate', min: 1, max: 1},
            {item: 'shop', 'min': 1, 'max': 3},
            {item: 'inn', 'min': 1, 'max': 1},
            {item: 'tavern', 'min': 0, 'max': 1},
            {item: 'blacksmith', 'min': 0, 'max': 1},
            {item: 'temple', 'min': 0, 'max': 1},
            {item: 'library', 'min': 0, 'max': 1},
            {item: 'guild', 'min': 0, 'max': 2},
            {item: 'academy', 'min': 0, 'max': 1},
            {item: 'barracks', 'min': 0, 'max': 1},
        ]; // The rest will be houses

        const typeCount = {};

        for (const tpe of types) {
            typeCount[tpe.item] = 0;
        }

        typeCount['house'] = 0;

        const result = [];

        for (let i = 0; i < types.length; i++) {
            const tpe = types[i];
            const count = Math.floor(randomService.random() * (tpe.max - tpe.min + 1)) + tpe.min;
            for (let j = 0; j < count; j++) {
                result.push(tpe.item);
                typeCount[tpe.item]++;
            }
        }

        const resultLength = result.length;

        for (let i = 0; i <= count - resultLength; i++) {
            result.push('house');
            typeCount['house']++;
        }

        // Shuffle
        // for (let i = 0; i < result.length; i++) {
        //     const j = Math.floor(randomService.random() * result.length);
        //     const temp = result[i];
        //     result[i] = result[j];
        //     result[j] = temp;
        // }

        return result;
    }

    public async generateMapLocationName(): Promise<string> {
        // Town and city names
        return await generatorService.generate('location-name');
    }

    public async generateMapPointData(type: string): Promise<MapPointData> {
        // Map point is a location within a single map. Single map represents a single settlement or a location.
        // First we want to determine the type of the location.

        // Now we want to generate a name for the location.
        let name = '';

        switch (type) {
            case 'gate':
                name = `The ${capitalize(randomService.pick(['north', 'south', 'east', 'west', 'front', 'back', 'side', 'inner', 'outer', 'upper', 'lower', 'left', 'right', 'top', 'bottom', 'center', 'middle', 'edge', 'corner', 'end', 'beginning', 'start', 'finish', 'gate', 'door', 'portal', 'entry', 'exit', 'passage', 'path', 'way', 'road', 'street', 'alley', 'lane', 'avenue', 'boulevard', 'drive', 'court', 'plaza', 'square', 'circle', 'ring', 'loop', 'curve', 'bend', 'turn', 'twist', 'spiral', 'coil', 'whirl', 'swirl', 'vortex', 'whirlpool', 'maw', 'mouth', 'throat', 'gullet', 'esophagus', 'stomach', 'belly', 'gut', 'intestine', 'bowel', 'bladder', 'anus', 'rectum', 'buttock', 'hip', 'waist', 'back', 'chest', 'neck', 'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'tongue', 'tooth', 'lip', 'jaw', 'chin', 'cheek', 'brow', 'forehead', 'hair', 'beard', 'mustache', 'ear', 'nose', 'eye', 'face', 'head', 'neck', 'shoulder', 'arm', 'elbow', 'wrist', 'hand', 'finger', 'thumb', 'leg', 'knee', 'ankle', 'foot', 'toe', 'heel', 'back', 'chest', 'belly', 'waist', 'hip', 'buttock', 'thigh', 'calf', 'heel', 'sole', 'toe', 'nail', 'heart', 'liver', 'lung', 'kidney', 'spleen', 'stomach', 'intestine', 'bowel', 'bladder', 'gall', 'brain', 'mind']))} Gate`;
                break;
            case 'shop':
                name = `The ${capitalize(randomService.pick(['general', 'magic', 'armor', 'weapon', 'food', 'clothing', 'jewelry', 'potions', 'scrolls']))} Shop`;
                break;
            case 'inn':
                name = `The ${capitalize(randomService.pick(['sleeping', 'resting', 'waking', 'dreaming', 'drunken', 'dancing', 'singing', 'laughing', 'crying', 'silent', 'loud', 'quiet', 'noisy', 'happy', 'sad', 'angry', 'calm', 'peaceful', 'troubled', 'troublesome', 'troubleless']))} ${capitalize(randomService.pick(['inn', 'tavern', 'hostel', 'lodge', 'rest', 'sleep', 'dream', 'night', 'day', 'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'storm', 'wind', 'weather', 'season', 'spring', 'summer', 'autumn', 'fall', 'winter', 'cold', 'hot', 'warm', 'cool', 'freezing', 'burning', 'icy', 'frozen', 'melted', 'melt', 'water', 'fire', 'earth', 'air', 'element', 'spirit', 'ghost', 'phantom', 'shade', 'shadow', 'light', 'dark', 'bright', 'dim', 'dull', 'shining', 'glowing', 'sparkling', 'twinkling', 'flickering', 'flaming', 'burning', 'smoking', 'steaming', 'boiling', 'freezing', 'chilling', 'cooling', 'warming', 'heating', 'melting', 'solid', 'liquid', 'gas', 'plasma', 'energy', 'matter', 'substance', 'material', 'metal', 'wood', 'stone', 'rock', 'earth', 'dirt', 'sand', 'clay', 'mud', 'dust', 'ash', 'bone', 'flesh', 'blood', 'skin', 'hair', 'fur', 'feather', 'scale', 'shell', 'horn', 'claw', 'fang', 'tooth', 'tongue', 'mouth', 'nose', 'ear', 'eye', 'face', 'head', 'neck', 'shoulder', 'arm', 'elbow', 'wrist', 'hand', 'finger', 'thumb', 'leg', 'knee', 'ankle', 'foot', 'toe', 'heel', 'back', 'chest', 'belly', 'waist', 'hip', 'buttock', 'thigh', 'calf', 'heel', 'sole', 'toe', 'nail', 'heart', 'liver', 'lung', 'kidney', 'spleen', 'stomach', 'intestine', 'bowel', 'bladder', 'gall', 'brain', 'mind']))}`;
                break;
            case 'tavern':
                name = `The ${capitalize(randomService.pick(['drunken', 'dancing', 'singing', 'laughing', 'crying', 'silent', 'loud', 'quiet', 'noisy', 'happy', 'sad', 'angry', 'calm', 'peaceful', 'troubled', 'troublesome', 'troubleless']))} ${capitalize(randomService.pick(['inn', 'tavern', 'hostel', 'lodge', 'rest', 'sleep', 'dream', 'night', 'day', 'sun', 'moon', 'star', 'sky', 'cloud', 'rain', 'storm', 'wind', 'weather', 'season', 'spring', 'summer', 'autumn', 'fall', 'winter', 'cold', 'hot', 'warm', 'cool', 'freezing', 'burning', 'icy', 'frozen', 'melted', 'melt', 'water', 'fire', 'earth', 'air', 'element', 'spirit', 'ghost', 'phantom', 'shade', 'shadow', 'light', 'dark', 'bright', 'dim', 'dull', 'shining', 'glowing', 'sparkling', 'twinkling', 'flickering', 'flaming', 'burning', 'smoking', 'steaming', 'boiling', 'freezing', 'chilling', 'cooling', 'warming', 'heating', 'melting', 'solid', 'liquid', 'gas', 'plasma', 'energy', 'matter', 'substance', 'material', 'metal', 'wood', 'stone', 'rock', 'earth', 'dirt', 'sand', 'clay', 'mud', 'dust', 'ash', 'bone', 'flesh', 'blood', 'skin', 'hair', 'fur', 'feather', 'scale', 'shell', 'horn', 'claw', 'fang', 'tooth', 'tongue', 'mouth', 'nose', 'ear', 'eye', 'face', 'head', 'neck', 'shoulder', 'arm', 'elbow', 'wrist', 'hand', 'finger', 'thumb', 'leg', 'knee', 'ankle', 'foot', 'toe', 'heel', 'back', 'chest', 'belly', 'waist']))}`;
                break;
            case 'blacksmith':
                name = `The ${capitalize(randomService.pick(['forge', 'anvil', 'hammer', 'tongs', 'bellows', 'grindstone', 'whetstone', 'quenching', 'tempering', 'hardening', 'softening', 'sharpening', 'shaping', 'molding', 'casting', 'smelting', 'forging', 'welding', 'soldering', 'riveting']))}`;
                break;
            case 'temple':
                name = `The ${capitalize(randomService.pick(['divine', 'holy', 'sacred', 'blessed', 'cursed', 'profane', 'unholy', 'dark', 'light', 'good', 'evil', 'lawful', 'chaotic', 'neutral', 'elemental']))} ${capitalize(randomService.pick(['shrine', 'altar', 'sanctuary', 'chapel', 'church', 'cathedral', 'abbey', 'monastery', 'priory', 'convent', 'cloister', 'hermitage', 'oratory', 'tabernacle', 'temple', 'synagogue', 'mosque']))}`;
                break;
            case 'library':
                name = `The ${capitalize(randomService.pick(['book', 'scroll', 'tome', 'volume', 'codex', 'manuscript', 'parchment', 'paper', 'ink', 'quill', 'pen']))} ${capitalize(randomService.pick(['library', 'archive', 'scriptorium', 'study', 'scripture', 'codicil', 'folio', 'papyrus', 'vellum', 'parchment', 'paper', 'ink', 'quill', 'pen']))}`;
                break;
            case 'guild':
                name = `The ${capitalize(randomService.pick(['craft', 'trade', 'merchant', 'artisan', 'artisanal']))} ${capitalize(randomService.pick(['guild', 'union', 'association', 'society', 'brotherhood', 'sisterhood', 'fellowship', 'confraternity', 'congregation', 'conclave', 'council', 'college', 'academy', 'institute', 'consortium', 'syndicate', 'corporation', 'company', 'corps', 'order', 'fraternity', 'sorority', 'league', 'alliance', 'coalition', 'confederation', 'federation', 'confederacy', 'fellowship', 'partnership', 'cooperation', 'collaboration', 'coordination', 'association', 'organization', 'society', 'club', 'group', 'team', 'band', 'crew', 'gang', 'mob', 'syndicate', 'cartel', 'mafia', 'ring', 'network', 'system', 'structure', 'hierarchy', 'order', 'regiment', 'troop', 'squad', 'platoon', 'company', 'battalion', 'regiment', 'brigade', 'division', 'corps', 'army', 'force', 'militia', 'guard', 'watch', 'patrol', 'police', 'rangers', 'scouts', 'hunters', 'warriors', 'soldiers', 'fighters', 'combatants', 'warriors', 'knights', 'paladins', 'templars', 'clerics', 'priests', 'monks', 'nuns', 'druids', 'shamans', 'wizards', 'sorcerers', 'mages', 'magicians', 'warlocks', 'witches', 'sages', 'seers', 'oracles']))}`;
                break;
            case 'academy':
                name = `The ${capitalize(randomService.pick(['magic', 'arcane', 'divine', 'mystic', 'occult', 'esoteric', 'secret', 'hidden', 'forbidden', 'lost', 'ancient', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['academy', 'school', 'college', 'university', 'institute', 'institution', 'center', 'sanctuary', 'haven', 'refuge', 'shelter', 'asylum', 'retreat', 'hideaway', 'hideout', 'lair', 'den', 'nest', 'burrow', 'warren', 'hole', 'cave', 'tunnel', 'passage', 'corridor', 'hall', 'chamber', 'room', 'cell', 'closet', 'cabinet', 'drawer', 'box', 'chest', 'trunk', 'bag', 'sack', 'pouch', 'purse', 'wallet', 'pocket', 'sleeve', 'cuff', 'collar', 'neck', 'throat', 'mouth', 'nose', 'ear', 'eye', 'face', 'head', 'hair', 'beard', 'mustache', 'brow', 'cheek', 'chin', 'jaw', 'neck', 'shoulder', 'arm', 'elbow', 'wrist', 'hand', 'finger', 'thumb', 'leg', 'knee', 'ankle', 'foot', 'toe', 'heel', 'back', 'chest', 'belly', 'waist', 'hip', 'buttock', 'thigh', 'calf', 'heel', 'sole', 'toe', 'nail', 'heart', 'liver', 'lung', 'kidney', 'spleen', 'stomach', 'intestine', 'bowel', 'bladder', 'gall', 'brain', 'mind']))}`;
                break;
            case 'barracks':
                name = `The ${capitalize(randomService.pick(['guard', 'watch', 'patrol', 'police', 'rangers', 'scouts', 'hunters', 'warriors', 'soldiers', 'fighters', 'combatants', 'warriors', 'knights', 'paladins', 'templars', 'clerics', 'priests', 'monks', 'nuns', 'druids', 'shamans', 'wizards', 'sorcerers', 'mages', 'magicians', 'warlocks', 'witches', 'sages', 'seers', 'oracles']))} ${capitalize(randomService.pick(['barracks', 'armory', 'arsenal', 'fortress', 'castle', 'keep', 'hold', 'gate', 'tower', 'wall', 'rampart', 'moat', 'ditch', 'trench', 'palisade', 'stockade', 'fence', 'barrier', 'barricade', 'blockade', 'embankment', 'mound', 'hill', 'mount', 'peak', 'summit', 'valley', 'dale', 'glen', 'grove', 'wood', 'forest', 'jungle', 'swamp', 'marsh', 'fen', 'bog', 'moor', 'heath', 'field', 'plain', 'meadow', 'prairie', 'steppe', 'desert', 'waste', 'land', 'isle', 'island', 'key', 'reef', 'sand', 'bar', 'bank', 'lagoon', 'lake', 'river', 'stream', 'brook', 'creek', 'spring', 'well', 'pool', 'pond', 'delta', 'estuary', 'strait', 'sound', 'channel', 'gulf', 'sea', 'ocean', 'abyss', 'chasm', 'canyon', 'gorge', 'pass', 'gap', 'notch', 'cleft', 'crack', 'crevice', 'fissure', 'rift', 'fault']))}`;
                break;
            case 'house':
                name = await generatorService.generate('house');
                break;
            default:
                // debugger;
                throw new Error(`Invalid point type: ${type}`);
                name = 'Unknown';
        }

        // Now we want to generate a description for the location.
        let description = 'To be written...';

        return {
            type,
            name,
            description
        };
    }

    public generateOverworldMapPointData = async (type: string): Promise<MapPointData> => {
        // Overworld map point is a location within the overworld map. Overworld map represents a single region.
        // First we want to determine the type of the location.

        // Now we want to generate a name for the location.
        let name = '';

        switch (type) {
            case 'town':
                name = `The ${capitalize(randomService.pick(['small', 'medium', 'large', 'great', 'grand', 'mighty', 'ancient', 'new', 'old', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['town', 'city', 'village', 'hamlet', 'settlement', 'colony', 'outpost', 'fort', 'castle', 'tower', 'monastery', 'temple']))}`;
                break;
            case 'city':
                name = `The ${capitalize(randomService.pick(['small', 'medium', 'large', 'great', 'grand', 'mighty', 'ancient', 'new', 'old', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['town', 'city', 'village', 'hamlet', 'settlement', 'colony', 'outpost', 'fort', 'castle', 'tower', 'monastery', 'temple']))}`;
                break;
            case 'village':
                name = `The ${capitalize(randomService.pick(['small', 'medium', 'large', 'great', 'grand', 'mighty', 'ancient', 'new', 'old', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['town', 'city', 'village', 'hamlet', 'settlement', 'colony', 'outpost', 'fort', 'castle', 'tower', 'monastery', 'temple']))}`;
                break;
            case 'camp':
                name = `The ${capitalize(randomService.pick(['small', 'medium', 'large', 'great', 'grand', 'mighty', 'ancient', 'new', 'old', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['camp', 'fort', 'castle', 'tower', 'monastery', 'temple']))}`;
                break;
            case 'fort':
                name = `The ${capitalize(randomService.pick(['small', 'medium', 'large', 'great', 'grand', 'mighty', 'ancient', 'new', 'old', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['camp', 'fort', 'castle', 'tower', 'monastery', 'temple']))}`;
                break;
            case 'castle':
                name = `The ${capitalize(randomService.pick(['small', 'medium', 'large', 'great', 'grand', 'mighty', 'ancient', 'new', 'old', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['camp', 'fort', 'castle', 'tower', 'monastery', 'temple']))}`;
                break;
            case 'tower':
                name = `The ${capitalize(randomService.pick(['small', 'medium', 'large', 'great', 'grand', 'mighty', 'ancient', 'new', 'old', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['camp', 'fort', 'castle', 'tower', 'monastery', 'temple']))}`;
                break;
            case 'monastery':
                name = `The ${capitalize(randomService.pick(['small', 'medium', 'large', 'great', 'grand', 'mighty', 'ancient', 'new', 'old', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['camp', 'fort', 'castle', 'tower', 'monastery', 'temple']))}`;
                break;
            case 'temple':
                name = `The ${capitalize(randomService.pick(['small', 'medium', 'large', 'great', 'grand', 'mighty', 'ancient', 'new', 'old', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} ${capitalize(randomService.pick(['camp', 'fort', 'castle', 'tower', 'monastery', 'temple']))}`;
                break;
            case 'ruins':
                name = `The ${capitalize(randomService.pick(['ancient', 'old', 'new', 'modern', 'contemporary', 'future', 'past', 'present', 'timeless', 'eternal', 'immortal', 'undying', 'everlasting', 'eternal', 'infinite', 'boundless', 'limitless', 'endless', 'timeless', 'spaceless', 'dimensionless', 'void', 'abyss', 'chaos', 'order', 'law', 'balance', 'harmony', 'discord', 'disorder', 'entropy', 'creation', 'destruction', 'life', 'death', 'rebirth', 'resurrection']))} Ruins`;
                break;
            case 'dungeon':
                name = `The ${capitalize(randomService.pick(['dark', 'light', 'good', 'evil', 'lawful', 'chaotic', 'neutral', 'elemental', 'divine', 'holy', 'sacred', 'blessed', 'cursed', 'profane', 'unholy']))} Dungeon`;
                break;
            case 'cave':
                name = `The ${capitalize(randomService.pick(['dark', 'light', 'good', 'evil', 'lawful', 'chaotic', 'neutral', 'elemental', 'divine', 'holy', 'sacred', 'blessed', 'cursed', 'profane', 'unholy']))} Cave`;
                break;
            case 'forest':
                name = `The ${capitalize(randomService.pick(['dark', 'light', 'good', 'evil', 'lawful', 'chaotic', 'neutral', 'elemental', 'divine', 'holy', 'sacred', 'blessed', 'cursed', 'profane', 'unholy']))} Forest`;
                break;
            case 'mountain':
                name = `The ${capitalize(randomService.pick(['dark', 'light', 'good', 'evil', 'lawful', 'chaotic', 'neutral', 'elemental', 'divine', 'holy', 'sacred', 'blessed', 'cursed', 'profane', 'unholy']))} Mountain`;
                break;
            case 'lake':
                name = `The ${capitalize(randomService.pick(['dark', 'light', 'good', 'evil', 'lawful', 'chaotic', 'neutral', 'elemental', 'divine', 'holy', 'sacred', 'blessed', 'cursed', 'profane', 'unholy']))} Lake`;
                break;

            default:
                // debugger;
                throw new Error(`Invalid point type: ${type}`);
                name = 'Unknown';
        }

        // Now we want to generate a description for the location.

        let description = 'To be written...';

        return {
            type,
            name,
            description
        };
    }

    public generateMapLayout(settings: {
        shape: [number, number],
        minDistance: number,
        maxDistance: number,
        tries: number
    } = {
        shape: [500, 500],
        minDistance: 70,
        maxDistance: 120,
        tries: 30
    }): GameMapLayout {
        const map = new PoissonDiskSampling(settings, () => randomService.random());

        let points = map.fill();

        points = points.filter(p => randomService.random() < 0.7);

        const d = Delaunator.from(points, p => p[0], p => p[1]);

        const edgesSet = new Set();
        const allEdges = [];
        for (let e = 0; e < d.triangles.length; e += 3) {
            const t = [d.triangles[e], d.triangles[e + 1], d.triangles[e + 2]].sort();

            allEdges.push([t[0], t[1]]);
            allEdges.push([t[1], t[2]]);
            allEdges.push([t[0], t[2]]);

            if (edgesSet.has(`${t[0]}-${t[1]}`) || edgesSet.has(`${t[1]}-${t[0]}`)) {
                continue;
            }

            if (edgesSet.has(`${t[1]}-${t[2]}`) || edgesSet.has(`${t[2]}-${t[1]}`)) {
                continue;
            }

            if (edgesSet.has(`${t[0]}-${t[2]}`) || edgesSet.has(`${t[2]}-${t[0]}`)) {
                continue;
            }

            edgesSet.add(`${t[0]}-${t[1]}`);
            edgesSet.add(`${t[1]}-${t[2]}`);
            edgesSet.add(`${t[0]}-${t[2]}`);
        }


        const mst = findMST(points.map(([x, y]) => ({x, y})), allEdges);

        // Let's return some edges back
        let newEdges = mst.map(e => [e.from, e.to]);
        const newPoints = points.map(p2p);

        for (const edge of allEdges) {
            if (findEdge(newEdges, edge[0], edge[1]) === -1 && edgeLength(newPoints[edge[0]], newPoints[edge[1]]) < 120) {
                newEdges.push(edge);
            }
        }

        const {bridges, articulationPoints} = findBridgesAndArticulationPoints(newPoints.length, newEdges);

        return {
            points,
            edges: newEdges,
            bridges,
            ap: articulationPoints
        } as GameMapLayout;
    }
}

export const worldgenService = new WorldgenService();