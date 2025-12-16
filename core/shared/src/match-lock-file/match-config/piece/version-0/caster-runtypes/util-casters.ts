import {
  String as CastString,
  Number as CastNumber,
  Boolean as CastBoolean,
  Union as CastUnion,
  Literal as CastLiteral,
} from "runtypes";

export type DateTime = string;
export function validateDateTime(value: string){
  if(!Date.parse(value)) throw new Error(`${value} is not a valid date`);
}
export const DateTimeCaster = CastString.withConstraint(value => {
  try {
    validateDateTime(value);
    return true;
  }catch(e){
    return (e as Error).message;
  }
});

export type SemVer = string;
export function validateSemver(value: string){
  // 1. split on dots
  const parts = value.split(".");
  if (parts.length !== 3) {
    throw new Error("SemVer must have three numeric parts separated by `.`");
  }

  for (const part of parts) {
    // 2. non‑empty
    if (part.length === 0) {
      throw new Error("SemVer parts may not be empty");
    }
    // 3. no leading zero (except “0” itself)
    if (part.length > 1 && part[0] === "0") {
      throw new Error(`Invalid leading zero in part “${part}”`);
    }
    // 4. all digits
    if (!/^[0-9]+$/.test(part)) {
      throw new Error(`Non-numeric SemVer part: “${part}”`);
    }
  }
}
export const SemVerCaster = CastString.withConstraint((value) => {
  try {
    validateSemver(value);
    return true;
  }catch(e){
    return (e as Error).message;
  }
});;

export type Sha256 = string;
export function validateSha256(value: string){
  // Must be exactly 64 hex chars (0–9, a–f, case‑insensitive)
  if (!/^[0-9a-f]{64}$/i.test(value)) {
    throw new Error(`${value} is not a valid SHA-256 (64-char hex)`);
  }
}
export const Sha256Caster = CastString.withConstraint(value => {
  try {
    validateSha256(value);
    return true;
  }catch(e){
    return (e as Error).message;
  }
});


/*
export async function createSHA256Hash(data: string){
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
*/

export type URLType = string;
export function validateURL(value: string){
  if(!URL.canParse(value)) throw new Error(`${value} is not a valid URL`);
}
export const URLTypeCaster = CastString.withConstraint(value => {
  try {
    validateURL(value);
    return true;
  }catch(e){
    return (e as Error).message;
  }
});


import parseMagnet from "magnet-uri";
export type MagnetUri = string;
export function validateMagnetURI(value: string){
  try {
    const parsed = parseMagnet(value);
    if(!parsed.infoHash) throw new Error("Magnet URI parsed but missing infoHash");
  } catch (err: any) {
    throw new Error(`Invalid Magnet URI: ${err.message}`);
  }
}
export const MagnetURICaster = CastString.withConstraint(value => {
  try {
    validateMagnetURI(value);
    return true;
  } catch (e) {
    return (e as Error).message;
  }
});

export type Count = number;
export const CountCaster = CastNumber.withConstraint(value => {
  if(value < 0) return `${value} is not a valid count`;
  return true;
});


export type PublicKey = string;
export type SignedContent = string;


export type FilePath = string;
export function parseFilePath(filepath: string){
  if(filepath.length === 0){
    throw new Error("Filepath is empty");
  }
  if(filepath[0] !== "/"){
    throw new Error("Filepath expected to start with \"/\"");
  }
  const dirParts = filepath.split("/");
  const file = dirParts.pop();
  if(!file){
    throw new Error("Filepath expected to end with a file");
  }
  const fileParts = file.split(".")
  const extension = fileParts.pop();
  if(!extension){
    throw new Error("Filepath expected to end with a file extension");
  }
  return {
    dir: dirParts.join("/"),
    filename: fileParts.join("."),
    extension,
  };
}

export const JSONPrimitiveCaster = CastUnion(
  CastString,
  CastNumber,
  CastBoolean,
  CastLiteral(null),
);
