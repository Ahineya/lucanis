import "./App.css";
import {WindowManager} from "./components/window-manager.tsx";
// import {TitleBar} from "./components/titlebar.tsx";
import {useStoreSubscribe} from "./lib/store-subject/use-store-subscribe.hook.ts";
import {loadStore} from "./stores/load.store.ts";
import {lastOption} from "./lib/option.lib.ts";
import {invoke} from "@tauri-apps/api/core";

invoke('my_custom_command', { value: 'Hello, Async!' }).then((v) =>
    console.log('Completed!', v)
)

function App() {
    const games = useStoreSubscribe(loadStore.loadGames);
    const loadedGame = useStoreSubscribe(loadStore.loadedGame);
    const loadingState = useStoreSubscribe(loadStore.loadState);

    const isLoaded = loadingState.includes("loaded");

    return (
        <main className="bg-bg text-primary h-full relative flex items-center justify-center font-main">
            {
                loadedGame && isLoaded && <WindowManager/>
            }
            {
                loadedGame && !isLoaded && (
                    <div>
                        <h1>Loading...</h1>
                        {
                            lastOption(loadingState).unwrapOr("Loading...")
                        }
                    </div>
                )
            }
            {
                !loadedGame && (
                    <div>
                        <button
                            className="bg-primary text-bg px-2 hover:bg-amber-400"
                            onClick={() => loadStore.newGame()}
                        >
                            New Game
                        </button>
                        {
                            games && (
                                <div>
                                    <h1>Load Game</h1>
                                    <ul>
                                        {
                                            games?.map((game, index) => (
                                                <li key={index} onClick={() => loadStore.loadGame(game.name)}>{game.name}</li>
                                            ))
                                        }
                                    </ul>
                                </div>
                            )
                        }
                    </div>
                )
            }
        </main>
    );
}

export default App;
