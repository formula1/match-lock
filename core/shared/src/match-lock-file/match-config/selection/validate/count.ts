
export function validateCount(count: number | [number, number]){
  if(!Array.isArray(count)){
    if(count < 0){
      throw new Error(`Count ${count} is negative`);
    }
    return;
  }
  const [min, max] = count;
  if(min < 0){
    throw new Error(`Count ${min} is negative`);
  }
  if(max < min){
    throw new Error(`Count ${max} is less than ${min}`);
  }
}
