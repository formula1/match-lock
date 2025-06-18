import { useNavigate } from "react-router";
import { EngineConfigPaths } from "../paths";
import { replaceParams } from "../../../utils/router";
import { WINDOW } from "../../../globals/window";

export function OpenFile(){
  const navigate = useNavigate();

  return <button
    onClick={async () => {
    try {
      const result = await WINDOW.showOpenDialog({
        title: 'Open Engine Config',
        properties: ['openFile'],
        filters: [
          { name: 'Config Files', extensions: ['json', 'yaml', 'yml'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });

      if(result.canceled) return;
      if(result.filePaths.length === 0) return;

      const filePath = result.filePaths[0];

      // Navigate to edit page or handle the file
      console.log('Opened file:', filePath);
      navigate(
        replaceParams(EngineConfigPaths.edit, { enginePath: encodeURIComponent(filePath) })
      )
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }}
  >Open File...</button>

}
