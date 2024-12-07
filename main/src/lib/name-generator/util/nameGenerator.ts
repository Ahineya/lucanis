import {
    angel,
    cavePerson,
    darkelf,
    demon,
    dragon,
    drow,
    dwarf,
    elf,
    fairy,
    gnome,
    goblin,
    halfdemon,
    halfling,
    highelf,
    highfairy,
    human,
    ogre,
    orc,
} from "./speciesGenerator";

const racesWithGender = [
    // "cavePerson",
    "dwarf",
    // "halfling",
    // "gnome",
    "elf",
    "highelf",
    // "fairy",
    // "highfairy",
    "darkelf",
    // "drow",
    "halfdemon",
    // "dragon",
    // "angel"
] as const;
const otherRaces = [
    // "demon",
    "human",
    "goblin",
    // "ogre",
    "orc"
] as const;

export type RaceWithGenderType = typeof racesWithGender[number];
export type RaceWithoutGenderType = typeof otherRaces[number];
export type RaceType = RaceWithGenderType | RaceWithoutGenderType;

type Sorted = () => string[];
type GenerateName = (race: string, options?: {
    gender?: "male" | "female";
    allowMultipleNames?: boolean;
},) => string | Error;
export const allRaces: { sorted: Sorted; racesWithGender: string[]; otherRaces: string[]; } = {
    otherRaces,
    racesWithGender,
    sorted: () => racesWithGender.concat(otherRaces).sort(),
};
export const generateName: GenerateName = (race, options = {}) => {
    const {gender, allowMultipleNames} = options;
    if (racesWithGender.includes(race) && gender !== undefined) {
        switch (race) {
            case "angel":
                return angel(gender);
            case "cavePerson":
                return cavePerson(gender);
            case "darkelf":
                return darkelf(gender);
            case "dragon":
                return dragon(gender);
            case "drow":
                return drow(gender);
            case "dwarf":
                return dwarf(gender);
            case "elf":
                return elf(gender);
            case "fairy":
                return fairy(gender);
            case "gnome":
                return gnome(gender);
            case "halfdemon":
                return halfdemon(gender);
            case "halfling":
                return halfling(gender);
            case "highelf":
                return highelf(gender);
            case "highfairy":
                return highfairy(gender);
            default:
                break;
        }
    }
    switch (race) {
        case "demon":
            return demon();
        case "goblin":
            return goblin();
        case "human":
            return human(allowMultipleNames);
        case "ogre":
            return ogre();
        case "orc":
            return orc();
        default:
            break;
    }
    return new Error("Must provide a gender!");
};