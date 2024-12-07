import {resolveResource} from "@tauri-apps/api/path";
import {readTextFile} from "@tauri-apps/plugin-fs";
import {nameByRace} from "../lib/name-generator";

export type Attribute = { // 10 basic attributes
    name: string;
    value: number;
}

export type Skill = {
    name: string;
    value: number;
}

export type Race = {
    name: string;
    baseAttributes: Attribute[];
    baseSkills: Skill[];
}

export type Character = {
    id: string;
    name: string;
    race: Race;
    gender: "male" | "female";
    attributes: Attribute[];
    skills: Skill[];
}

class ChargenService {
    async generateCharacter(race: string, gender: "male" | "female", characterNames: Set<string>): Promise<Character> {
        const resourcePath = await resolveResource(`generators/chargen/${race}.json`);
        const raceData = JSON.parse(await readTextFile(resourcePath));
        const attributes = this.generateAttributes(raceData.baseAttributes);
        const skills = this.generateSkills(raceData.baseSkills);
        const id = this.generateId(race);

        let name = "";
        do {
            name = this.generateName(race, gender);
        } while (characterNames.has(name));

        return {
            id,
            name,
            race: raceData,
            gender,
            attributes,
            skills
        };
    }

    /*
      "baseAttributes": {
    "strength": 10,
    "dexterity": 10,
    "constitution": 10,
    "intelligence": 10,
    "wisdom": 10,
    "charisma": 20,
    "luck": 20
  },
  "baseSkills": {
    "acrobatics": 0,
    "alchemy": 0,
    "arcana": 0,
    "athletics": 0,
    "deception": 0,
    "history": 0,
    "insight": 0,
    "intimidation": 0,
    "investigation": 0,
    "lockpicking": 0,
    "medicine": 0,
    "nature": 0,
    "perception": 0,
    "persuasion": 0,
    "religion": 0,
    "sleightOfHand": 0,
    "stealth": 0,
    "survival": 0,
    "thievery": 0
  }
     */

    generateAttributes(baseAttributes: {[key: string]: number}): Attribute[] {
        return Object.entries(baseAttributes).map(([name, value]) => {
            return {
                name,
                value
            };
        });
    }

    generateSkills(baseSkills: {[key: string]: number}): Skill[] {
        return Object.entries(baseSkills).map(([name, value]) => {
            return {
                name,
                value
            };
        });
    }

    generateId(race: string): string {
        return race + "_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    generateName(race: string, gender: "male" | "female"): string {
        const nameOrError = nameByRace(race, {gender, allowMultipleNames: true});

        if (nameOrError instanceof Error) {
            return "Nameless";
        } else {
            return nameOrError;
        }
    }
}

export const chargenService = new ChargenService();