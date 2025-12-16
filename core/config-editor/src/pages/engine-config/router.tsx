import { Route } from "react-router";
import { EngineConfigPaths } from "./paths";

import { EngineOutlet } from "./Outlet";

import { EngineRoot } from "./Root";
import { NewEngineConfig } from "./New";
import { EditEngineConfig } from "./Item/Edit";
import { EngineTest } from "./Item/Test";
import { relative } from "../../utils/router";

const { root: ROOT, new: NEW, edit: EDIT, test: TEST } = EngineConfigPaths;

export const EngineRoute = (
  <Route path={relative("/", ROOT)} element={<EngineOutlet />}>
    <Route index element={<EngineRoot />} />
    <Route path={relative(ROOT, NEW)} element={<NewEngineConfig />} />
    <Route path={relative(ROOT, EDIT)} element={<EditEngineConfig />} />
    <Route path={relative(ROOT, TEST)} element={<EngineTest />} />
  </Route>
)