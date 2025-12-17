
export function checkConfigVersion(value: unknown){
  if(typeof value !== "object") return null;
  if(value === null) return null;
  if(Array.isArray(value)) return null;
  if(!("rosterlockVersion" in value)) return null;
  if(typeof value.rosterlockVersion !== "number") return null;
  return value.rosterlockVersion;
}
