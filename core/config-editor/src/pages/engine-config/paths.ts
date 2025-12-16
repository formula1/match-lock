
export const EngineConfigPaths = {
  root: "/engine-config",
  new: "/engine-config/new",
  edit: "/engine-config/:enginePath",
  test: "/engine-config/:enginePath/test",
}

export const ENGINECONFIG_ID = {
  pieceId: (pieceName: string) => `engine-piece-${pieceName}`,
  assetId: (assetName: string) => `engine-piece-asset-${assetName}`,
}
