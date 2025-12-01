import {
  String as CastString,
  Number as CastNumber,
  Boolean as CastBoolean,
  Union as CastUnion,
  Literal as CastLiteral,
} from "runtypes";

export type DateTime = string;
export const DateTimeCaster = CastString.withConstraint(value => {
  if(!Date.parse(value)) return `${value} is not a valid date`;
  return true;
});

export type SemVer = string;
export const SemVerCaster = CastString.withConstraint((value) => {
  // 1. split on dots
  const parts = value.split(".");
  if (parts.length !== 3) {
    return "SemVer must have three numeric parts separated by `.`";
  }

  for (const part of parts) {
    // 2. non‑empty
    if (part.length === 0) {
      return "SemVer parts may not be empty";
    }
    // 3. no leading zero (except “0” itself)
    if (part.length > 1 && part[0] === "0") {
      return `Invalid leading zero in part “${part}”`;
    }
    // 4. all digits
    if (!/^[0-9]+$/.test(part)) {
      return `Non-numeric SemVer part: “${part}”`;
    }
  }

  return true;  // passes
});;

export type Sha256 = string;
export const Sha256Caster = CastString.withConstraint(value => {
  // Must be exactly 64 hex chars (0–9, a–f, case‑insensitive)
  if (!/^[0-9a-f]{64}$/i.test(value)) {
    return `${value} is not a valid SHA-256 (64-char hex)`;
  }
  return true;
});

import { createHash } from "node:crypto";
export async function createSHA256Hash(data: string){
  return createHash("sha256")
  .update(data, "utf8")
  .digest("hex");
}

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
export const URLTypeCaster = CastString.withConstraint(value => {
  if(!URL.canParse(value)) return `${value} is not a valid URL`;
  return true;
});

import parseMagnet from "magnet-uri";

export type MagnetUri = string;
export const MagnetURICaster = CastString.withConstraint(value => {
  try {
    const parsed = parseMagnet(value);

    // ensure we got at least an infoHash back
    if(!parsed.infoHash) return "Magnet URI parsed but missing infoHash";

    return true;
  } catch (err: any) {
    return `Invalid Magnet URI: ${err.message}`;
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
