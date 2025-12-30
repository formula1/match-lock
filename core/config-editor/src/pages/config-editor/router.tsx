import { Outlet, Route } from "react-router";
import { RosterLockConfigPaths } from "./paths";

import {
  NewConfigOutlet, NewConfigRoot,
  NewEngineConfig, NewEngineTest,
  NewRosterConfig
} from "./NewConfig";
import {
  FileConfigOutlet, FileConfigRoot,
  FileEngineConfig, FileEngineTest,
  FileRosterConfig
} from "./FileConfig";
import { relative } from "../../utils/router";

const { newRoot, newEngine, newEngineTest, newRoster, newSelection } = RosterLockConfigPaths;
const { fileRoot, fileEngine, fileEngineTest, fileRoster, fileSelection } = RosterLockConfigPaths;

export const NewConfigEditorRoute = (
  <Route path={relative("/", newRoot)} element={<NewConfigOutlet />}>
    <Route index element={<NewConfigRoot />} />
    <Route path={relative(newRoot, newEngine)} element={<NewEngineConfig />} />
    <Route path={relative(newRoot, newEngineTest)} element={<NewEngineTest />} />
    <Route path={relative(newRoot, newRoster)} element={<NewRosterConfig />} />
  </Route>
);

export const FileConfigEditorRoute = (
  <Route path={relative("/", fileRoot)} element={<FileConfigOutlet />}>
    <Route index element={<FileConfigRoot />} />
    <Route path={relative(fileRoot, fileEngine)} element={<FileEngineConfig />} />
    <Route path={relative(fileRoot, fileEngineTest)} element={<FileEngineTest />} />
    <Route path={relative(fileRoot, fileRoster)} element={<FileRosterConfig />} />
  </Route>
)
