import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router";

import { GlobalOutlet } from "./GlobalOutlet";
import { HomePage } from "../pages/home";
import { EngineRoute } from "../pages/engine-config";

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<GlobalOutlet />} >
        <Route index element={<HomePage />} />
        {EngineRoute}
      </Route>
    </Routes>
  </BrowserRouter>
}
