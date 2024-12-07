import AhoCorasick from "ahocorasick";
import {dialogueService} from "../../services/dialogue.service.ts";

export type AhoCorasickMatch = {
    start: number,
    end: number,
    topic: string
}

class StringSearch {
    private ac: AhoCorasick;

    constructor() {

    }

    public search(text: string): AhoCorasickMatch[] {
        if (!this.ac) {
            this.ac = dialogueService.getTopicsAhoCorasick();
        }

        const res: [number, string[]][] = this.ac.search(text);

        // Let's transform the result into a sane format
        return res.map(([index, topics]) => {
            const topic = topics[0];
            const start = index - topic.length + 1;
            const end = index;

            return {
                start,
                end,
                topic
            }
        });

    }
}

export const stringSearch = new StringSearch();
