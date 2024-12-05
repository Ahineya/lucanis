import {dialogueStore, TDialogueLine} from "../../stores/dialogue.store.ts";
import {AhoCorasickMatch, stringSearch} from "../../lib/string-search/string-search.ts";
import {FC, useMemo} from "react";
import {Character} from "../../services/chargen.service.ts";
import {option} from "../../lib/option.lib.ts";

function filterOverlappingMatches(matches: AhoCorasickMatch[]): AhoCorasickMatch[] {
    // Sort matches by start index and then by end index in descending order
    matches.sort((a, b) => {
        if (a.start !== b.start) return a.start - b.start;
        return b.end - a.end; // Longer matches come first if starts are equal
    });

    const filtered: AhoCorasickMatch[] = [];
    let prevMatch: AhoCorasickMatch | null = null;

    for (const match of matches) {
        if (
            prevMatch &&
            match.start >= prevMatch.start &&
            match.end <= prevMatch.end
        ) {
            // Current match is fully contained within the previous match
            continue; // Skip it
        } else {
            filtered.push(match);
            prevMatch = match;
        }
    }

    return filtered;
}

function splitStringWithMatches(
    s: string,
    matches: AhoCorasickMatch[]
): { text: string; match?: AhoCorasickMatch }[] {
    const result: { text: string; match?: AhoCorasickMatch }[] = [];
    let currentPosition = 0;

    // First, filter out overlapping matches
    const filteredMatches = filterOverlappingMatches(matches);

    // Now, proceed with splitting using the filtered matches
    for (const match of filteredMatches) {
        // Add non-matching text before the current match
        if (match.start > currentPosition) {
            result.push({
                text: s.substring(currentPosition, match.start),
            });
        }

        // Add the matching text with the match object
        result.push({
            text: s.substring(match.start, match.end + 1), // 'end' is inclusive
            match: match,
        });

        // Update the current position
        currentPosition = match.end + 1;
    }

    // Add any remaining text after the last match
    if (currentPosition < s.length) {
        result.push({
            text: s.substring(currentPosition),
        });
    }

    return result;
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