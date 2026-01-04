import { Route } from "react-router";
import { RosterConfigPaths } from "./paths";

import { RosterOutlet } from "./Outlet";

import { EngineRoot } from "./Root";
import { NewRosterConfig } from "./New";
import { EditEngineConfig } from "./Item/Edit";
import { EngineTest } from "./Item/Test";
import { relative } from "../../utils/router";

const { root: ROOT, new: NEW, edit: EDIT, test: TEST } = RosterConfigPaths;

export const EngineRoute = (
  <Route path={relative("/", ROOT)} element={<RosterOutlet />}>
    <Route index element={<EngineRoot />} />
    <Route path={relative(ROOT, NEW)} element={<NewRosterConfig />} />
    <Route path={relative(ROOT, EDIT)} element={<EditEngineConfig />} />
    <Route path={relative(ROOT, TEST)} element={<EngineTest />} />
  </Route>
)