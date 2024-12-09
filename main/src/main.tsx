import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {randomService} from "./services/random.service.ts";
import 'react-tooltip/dist/react-tooltip.css';
import {generatorService} from "./services/generator.service.ts";
import {dialogueService} from "./services/dialogue.service.ts";
import {dialogueStore} from "./stores/dialogue.store.ts";
import {journalService} from "./services/journal.service.ts";

// randomService.seed("test");
randomService.seed("moons-of-madness");
await generatorService.cacheGenerators()
await dialogueService.buildDialogueCache();
await journalService.buildJournalCache();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
);