
export class LuaError extends Error {
  constructor(message: string, public gasUsed: number){
    super(message);
  }
}
