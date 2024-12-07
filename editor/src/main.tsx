import {Dialogue} from "./components/tools/dialogue/dialogue.tsx";

declare var document;
declare var window;
import {StrictMode, useEffect} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {BrowserRouter, Outlet, Route, Routes} from "react-router";
import {Home} from "./components/home.tsx";

type Props = {
    to: string;
}

function Redirect(props) {
    useEffect(() => {
        window.location.pathname = props.to;
    }, [props.to]);
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<Home />} />
                    <Route path="tools" element={<Outlet/>}>
                        <Route index element={<Redirect to={"/"}/>}/>
                        <Route path="dialogue" element={<Dialogue/>}/>
                    </Route>
                    <Route path="*" element={<Redirect to={"/"}/> }/>
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>
)
