import {Character} from "../../services/chargen.service.ts";
import {FC} from "react";
import {useStoreSubscribe} from "../../lib/store-subject/use-store-subscribe.hook.ts";
import {gameStore} from "../../stores/game.store.ts";
import {none, some} from "../../lib/option.lib.ts";

type Props = {
    character: Character;
}

export const CharacterName: FC<Props> = ({character}) => {
    const selectedAction = useStoreSubscribe(gameStore.selectedAction);

    const execute = (e) => {
        e.stopPropagation();
        gameStore.createNarrativeEvent(character);
    }

    return selectedAction.map(action => (<button className="underline decoration-dotted underline-offset-2 text-cyan-200"
                                                 onMouseDown={execute}>{character.name}</button>)).unwrapOr(<>{character.name}</>);
}
