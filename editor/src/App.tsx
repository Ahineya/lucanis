import {Link, NavLink, Outlet} from "react-router";
import clsx from "clsx";

function App() {
  return (
      <div className="flex flex-col overflow-hidden h-full">
          <div className="flex w-full gap-2">
              <ul>
                  <li><NavLink
                      className={({ isActive, isPending }) => clsx("underline underline-offset-2 text-amber-950", {
                          "font-bold": isActive,
                      })}
                      to="/tools/dialogue"
                  >Dialogue Tool</NavLink></li>
              </ul>
          </div>
          <Outlet/>
      </div>
  )
}

export default App
