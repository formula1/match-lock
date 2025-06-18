import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router";
import { HomePage } from "./pages/home";
import { EngineRoute } from "./pages/engine-config";

export function Router(){
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      {EngineRoute}
    </Routes>
  </BrowserRouter>
}
