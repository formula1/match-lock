
import { WINDOW } from "../../../../globals/window";
export function OpenFile({ onSelect }: { onSelect: (file: string) => void }){
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

      onSelect(filePath);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }}
  >Open File...</button>
}
