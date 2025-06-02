
let ID_COUNTER = 0;
export function uniqueId(){
  return [
    padString(Date.now().toString(36), 8),
    padString((ID_COUNTER++).toString(36), 8),
    padString(Math.random().toString(36).substring(2, 10), 8),
  ].join("-");
}

export function padString(str: string, length: number, padChar: string = "0"){
  if(str.length >= length) return str.slice(0, length);
  return padChar.repeat(length - str.length) + str;
}
