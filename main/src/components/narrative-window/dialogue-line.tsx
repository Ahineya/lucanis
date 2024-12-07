import {dialogueStore, TDialogueLine} from "../../stores/dialogue.store.ts";
import {AhoCorasickMatch, stringSearch} from "../../lib/string-search/string-search.ts";
import {FC, useMemo} from "react";
import {Character} from "../../services/chargen.service.ts";
import {option} from "../../lib/option.lib.ts";

function isWordBoundary(char: string | undefined): boolean {
    if (char === undefined) return true;
    return !/\w/.test(char);
}

function filterFullWordMatches(s: string, matches: AhoCorasickMatch[]): AhoCorasickMatch[] {
    return matches.filter(match => {
        const beforeChar = match.start > 0 ? s[match.start - 1] : undefined;
        const afterChar = match.end + 1 < s.length ? s[match.end + 1] : undefined;
        return isWordBoundary(beforeChar) && isWordBoundary(afterChar);
    });
}

function splitStringWithMatches(
    s: string,
    matches: AhoCorasickMatch[]
): { text: string; match?: AhoCorasickMatch }[] {
    const result: { text: string; match?: AhoCorasickMatch }[] = [];
    let currentPosition = 0;

    const filteredMatches = filterOverlappingMatches(matches);

    const wordBoundaryMatches = filterFullWordMatches(s, filteredMatches);

    for (const match of wordBoundaryMatches) {
        if (match.start > currentPosition) {
            result.push({
                text: s.substring(currentPosition, match.start),
            });
        }

        result.push({
            text: s.substring(match.start, match.end + 1),
            match: match,
        });

        currentPosition = match.end + 1;
    }

    if (currentPosition < s.length) {
        result.push({
            text: s.substring(currentPosition),
        });
    }

    return result;
}

function filterOverlappingMatches(matches: AhoCorasickMatch[]): AhoCorasickMatch[] {
    matches.sort((a, b) => {
        if (a.start !== b.start) return a.start - b.start;
        return b.end - a.end;
    });

    const filtered: AhoCorasickMatch[] = [];
    let prevMatch: AhoCorasickMatch | null = null;

    for (const match of matches) {
        if (
            prevMatch &&
            match.start >= prevMatch.start &&
            match.end <= prevMatch.end
        ) {
            // Skip this match, it's contained in the previous
        } else {
            filtered.push(match);
            prevMatch = match;
        }
    }

    return filtered;
}

type Props = {
    line: TDialogueLine;
    subject: Character;
    isCurrentDialogue: boolean;
}

export const DialogueLine: FC<Props> = ({line, subject, isCurrentDialogue}) => {
    const splitText = useMemo(() => {
        if (!isCurrentDialogue) {
            return [{text: line.text}] as { text: string; match?: AhoCorasickMatch }[];
        }

        const s = stringSearch.search(line.text);
        return splitStringWithMatches(line.text, s);
    }, [line, isCurrentDialogue]);

    return (
        <p>{line.subject.name}: {
            splitText.map((part, index) =>
                option(part.match)
                    .fold(
                        match => (
                            <button
                                key={index}
                                className="text-cyan-300 underline underline-offset-2"
                                onClick={() => dialogueStore.advanceCurrentDialogue(match.topic)}
                            >
                                {part.text}
                            </button>),
                        () => <span key={index}>{part.text}</span>
                    )
            )
        }</p>
    )
}