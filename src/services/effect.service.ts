import {JournalRecord, journalStore} from "../stores/journal.store.ts";
import {combine, List, match} from "../lib/option.lib.ts";

export type EffectDSL = {
    effect: string; // stack-based DSL
}

export type ConditionDSL = {
    condition: string; // stack-based DSL
}

const keywords = [
    "set_journal_stage"
] as const;

type Keyword = typeof keywords[number];

class EffectService {
    public executeEffect({effect}: EffectDSL) {
        const steps = effect.split(" ");
        const stack: List<number | string> = new List();

        for (const step of steps) {
            match(step, {
                "set_journal_stage": () => {
                    const stage = stack.pop();
                    const id = stack.pop();

                    combine([id, stage]).fold(([id, stage]) => {
                        if (!journalStore.hasRecordStage(id as string, stage as number)) {
                            journalStore.addRecord({id, stage} as JournalRecord);
                        }
                    }, () => {
                        throw new Error("Not enough arguments for set_journal_stage");
                    });
                },
                "_": () => {
                    if (!isNaN(Number(step))) {
                        stack.push(Number(step));
                    } else {
                        stack.push(step);
                    }
                },
            });
        }
    }

    public executeCondition({condition}: ConditionDSL) {
        const steps = condition.split(" ");
        const stack: List<number | string | boolean> = new List();

        for (const step of steps) {
            match(step, {
                "is_journal_stage": () => {
                    const stage = stack.pop();
                    const id = stack.pop();

                    combine([id, stage]).fold(([id, stage]) => {
                        stack.push(journalStore.hasRecordStage(id as string, stage as number));
                    }, () => {
                        throw new Error("Not enough arguments for set_journal_stage");
                    });
                },
                "get_journal_stage": () => {
                    const id = stack.pop();

                    combine([id]).fold(([id]) => {
                        stack.push(journalStore.getRecordStage(id as string).map(r => r.stage).unwrapOr(0));
                    }, () => {
                        throw new Error("Not enough arguments for get_journal_stage");
                    });
                },
                "swp": () => {
                    const a = stack.pop();
                    const b = stack.pop();

                    combine([a, b]).fold(([a, b]) => {
                        stack.push(a);
                        stack.push(b);
                    }, () => {
                        throw new Error("Not enough arguments for swp");
                    });
                },
                "=": () => {
                    const a = stack.pop();
                    const b = stack.pop();

                    combine([a, b]).fold(([a, b]) => {
                        stack.push(a === b);
                    }, () => {
                        throw new Error("Not enough arguments for =");
                    });
                },
                "<": () => {
                    const a = stack.pop();
                    const b = stack.pop();

                    combine([a, b]).fold(([a, b]) => {
                        stack.push(b < a);
                    }, () => {
                        throw new Error("Not enough arguments for <");
                    });
                },
                ">": () => {
                    const a = stack.pop();
                    const b = stack.pop();

                    combine([a, b]).fold(([a, b]) => {
                        stack.push(b > a);
                    }, () => {
                        throw new Error("Not enough arguments for >");
                    });
                },
                "and": () => {
                    const a = stack.pop();
                    const b = stack.pop();

                    combine([a, b]).fold(([a, b]) => {
                        stack.push(a && b);
                    }, () => {
                        throw new Error("Not enough arguments for and");
                    });
                },
                "dup": () => {
                    const a = stack.pop();
                    a.fold((v) => {
                        stack.push(v);
                        stack.push(v);
                    }, () => {
                        throw new Error("Not enough arguments for dup");
                    });
                },
                "between": () => {
                    const c = stack.pop();
                    const b = stack.pop();
                    const a = stack.pop();

                    combine([a, b, c]).fold(([a, b, c]) => {
                        stack.push(b <= a && a <= c);
                    }, () => {
                        throw new Error("Not enough arguments for between");
                    });
                },
                "_": () => {
                    if (!isNaN(Number(step))) {
                        stack.push(Number(step));
                    } else {
                        stack.push(step);
                    }
                },
            });

            console.log(JSON.stringify(stack, null, 2));
        }

        return stack.pop();
    }
}

export const effectService = new EffectService();