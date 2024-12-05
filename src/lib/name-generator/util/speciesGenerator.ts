import {names} from "./names";
import {randomService} from "../../../services/random.service.ts";

const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);
const sample = (arr: any[]): any => arr[Math.floor(randomService.random() * arr.length)];
const endsWith = (str: string, search: string): boolean => str.slice(-search.length) === search;

type Size = "small" | "medium" | "large";
type Gender = "male" | "female";
type RaceNameFromGender = (gender: Gender) => string;
const dieRoll = (dieSize: number = 10): number => Math.floor(randomService.random() * dieSize) + 1;
const isVowel = (letter: string): boolean => ["a", "e", "i", "o", "u"].includes(letter);
const vileAndCrude = (size: Size): string => {
    const nameArr = names.vileAndCrude[size];
    return capitalize(sample(nameArr)) + sample(nameArr);
};
const genderSuffixesKey = (gender: Gender) => `${gender}Suffixes`;
export const goblin = (): string => vileAndCrude("small");
export const orc = (): string => vileAndCrude("medium");
export const ogre = (): string => vileAndCrude("large");
export const cavePerson: RaceNameFromGender = (gender) => {
    const nameArr = names.primitive;
    let name = capitalize(sample(nameArr.names));
    const roll = dieRoll(10);
    if (gender === "male") {
        if (roll > 3) {
            name = `${name}-${capitalize(sample(nameArr.names))}`;
        }
        if (roll > 8) {
            name = `${name}-${capitalize(sample(nameArr.names))}`;
        }
    } else if (gender === "female") {
        if (roll > 5) {
            name = `${name}-${capitalize(sample(nameArr.names))}`;
        }
        name = `${name}-${capitalize(sample(nameArr.suffixes))}`;
    }
    return name;
};
export const dwarf: RaceNameFromGender = (gender) => {
    const nameArr = names.doughty;
    let name = capitalize(sample(nameArr.syllables));
    const roll = dieRoll(10);
    if (gender === "male") {
        if (roll > 7) {
            name = `${name}${isVowel(name.slice(-1)) ? "r" : "i"}`;
        } else {
            name = `${name}${sample(nameArr.maleSuffixes)}`;
        }
    } else if (gender === "female") {
        if (roll > 7) {
            name = `${name}${isVowel(name.slice(-1)) ? "ra" : "a"}`;
        } else {
            name = `${name}${sample(nameArr.femaleSuffixes)}`;
        }
    }
    return name;
};
export const halfling: RaceNameFromGender = (gender) => {
    const nameArr = names.homely;
    let name = capitalize(sample(nameArr.syllables));
    const roll = dieRoll(10);
    if (nameArr[genderSuffixesKey(gender)]) {
        name = `${name}${sample(nameArr[genderSuffixesKey(gender)])}`;
    }
    if (roll > 6) {
        name = `${name} ${sample(names.familyName.english)}`;
    }
    return name;
};
export const gnome: RaceNameFromGender = (gender) => {
    let name = capitalize(sample(names.doughty.syllables));
    const roll = dieRoll(10);
    if (names.homely[genderSuffixesKey(gender)]) {
        name = `${name}${sample(names.homely[genderSuffixesKey(gender)])}`;
    }
    if (roll > 6) {
        name = `${name} ${sample(names.familyName.scottish)}`;
    }
    return name;
};
export const elf: RaceNameFromGender = (gender) => {
    const nameArr = names.fairAndNoble;
    let name = `${capitalize(sample(nameArr.elfPrefixes))}${sample(nameArr.middle,)}`;
    if (nameArr[genderSuffixesKey(gender)]) {
        name = `${name}${sample(nameArr[genderSuffixesKey(gender)])}`;
    }
    return name;
};
export const highelf: RaceNameFromGender = (gender) => {
    const nameArr = names.fairAndNoble;
    let name = `${capitalize(sample(nameArr.alternativeElfPrefixes))}${sample(nameArr.middle,)}`;
    if (nameArr[genderSuffixesKey(gender)]) {
        name = `${name}${sample(nameArr[genderSuffixesKey(gender)])}`;
    }
    return name;
};
export const fairy: RaceNameFromGender = (gender) => {
    const nameArr = names.fairy;
    let name = capitalize(sample(nameArr.prefixes));
    if (nameArr[genderSuffixesKey(gender)]) {
        name = `${name}${sample(nameArr[genderSuffixesKey(gender)])}`;
    }
    return name;
};
export const highfairy: RaceNameFromGender = (gender) => {
    const nameArr = names.alternateFairy;
    let name = capitalize(sample(nameArr.prefixes));
    if (nameArr[genderSuffixesKey(gender)]) {
        name = `${name}${sample(nameArr[genderSuffixesKey(gender)])}`;
    }
    return name;
};
export const darkelf: RaceNameFromGender = (gender) => {
    const nameArr = names.elegantEvil;
    let name = capitalize(sample(nameArr.prefixesDarkElves));
    const roll = dieRoll(10);
    if (roll > 2) {
        name = `${name}${sample(nameArr.middle)}`;
    }
    if (nameArr[genderSuffixesKey(gender)]) {
        name = `${name}${sample(nameArr[genderSuffixesKey(gender)])}`;
    }
    return name;
};
export const drow: RaceNameFromGender = (gender) => {
    const nameArr = names.elegantEvil;
    let name = capitalize(sample(nameArr.prefixesAlternateDarkElves));
    const roll = dieRoll(10);
    if (roll > 2) {
        name = `${name}${sample(nameArr.middle)}`;
    }
    if (nameArr[genderSuffixesKey(gender)]) {
        name = `${name}${sample(nameArr[genderSuffixesKey(gender)])}`;
    }
    return name;
};
export const halfdemon: RaceNameFromGender = (gender) => {
    const nameArr = names.malevolent;
    let name = capitalize(sample(nameArr.prefixes));
    if (nameArr[genderSuffixesKey(gender)]) {
        name = `${name}${sample(nameArr[genderSuffixesKey(gender)])}`;
    }
    return name;
};
export const demon = (): string => {
    const keys = Object.keys(names.infernal);
    const roll = dieRoll(3) - 1;
    const roll2 = dieRoll(2) - 1;
    const chosen = keys[roll];
    const chosen2 = keys.filter((x) => x !== chosen)[roll2];
    return `${capitalize(sample(names.infernal[chosen]))}${sample(names.infernal[chosen2],)}`;
};
export const dragon: RaceNameFromGender = (gender) => {
    const nameArr = names.draconic;
    const name = capitalize(sample(nameArr.prefixes));
    let suffix = sample(nameArr.suffixes);
    if (gender === "female") {
        if (suffix === "bazius") {
            suffix = "bazia";
        } else if (endsWith(suffix, "os")) {
            suffix += "sa";
        } else {
            suffix = "is";
        }
    }
    return name + suffix;
};
export const angel: RaceNameFromGender = (gender) => {
    const nameArr = names.empyreal;
    const roll = dieRoll(12);
    let name = capitalize(sample(nameArr.prefixes));
    if (roll === 1) {
        if (gender === "female") {
            const aIndex = name.lastIndexOf("a");
            name = name.substr(0, aIndex) + "e" + name.substr(aIndex + 1);
        }
        name = `${capitalize(sample(nameArr.titles))}${name}`;
    } else {
        if (nameArr[genderSuffixesKey(gender)]) {
            name = `${name}${sample(nameArr[genderSuffixesKey(gender)])}`;
        }
    }
    return name;
};
export const human = (allowMultipleNames?: boolean): string => {
    const roll = dieRoll(20);
    if (roll < 3) {
        return sample(names.human.one);
    }
    if (roll < 12) {
        return sample(names.human.two);
    }
    if (roll < 17) {
        return sample(names.human.three);
    }
    if (roll === 17) {
        return sample(names.human.more);
    }
    if (roll === 18 && allowMultipleNames) {
        return `${sample(names.human.one)} ${sample(names.human.two)}`;
    }
    if (roll === 19 && allowMultipleNames) {
        return `${sample(names.human.two)} ${sample(names.human.one)}`;
    }
    if (roll === 20 && allowMultipleNames) {
        const keys = Object.keys(names.human);
        return `${sample(names.human[sample(keys)])} ${sample(names.human[sample(keys)],)}`;
    }
    return sample(names.human[sample(Object.keys(names.human))]);
};