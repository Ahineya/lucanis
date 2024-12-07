import {Topics} from "./topics.tsx";
import {Lines} from "./lines.tsx";
import {EditArea} from "./edit-area/edit-area.tsx";

export const Editor = () => {
    return (
        <div className="flex gap-2 grow overflow-hidden">
            <Topics/>
            <div className="flex flex-col gap-2 h-full overflow-hidden grow">
                <Lines/>
                <EditArea/>
            </div>
        </div>
    )
}
