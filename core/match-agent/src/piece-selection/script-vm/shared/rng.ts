
import { UserId } from '@match-lock/shared';
import { createHmac } from 'node:crypto';

const MAX_BI = BigInt('0xFFFFFFFFFFFFFFFF');
// const PRECISION_NUM = 1_000_000_000;
// const PRECISION_BI = 1_000_000_000n;
const PRECISION_BI = 2n ** 53n;
const PRECISION_NUM = Number(PRECISION_BI);

export function createRandomNumberGenerator(seeds: Record<UserId, string>){
  const seed = (
    Object.keys(seeds).sort()
    .map(key => seeds[key])
    .join("")
  )

  let counter = 0;

  function randomBytes(): Buffer {
    const hmac = createHmac('sha256', seed);
    hmac.update(Buffer.from(counter.toString()));
    counter++;
    return hmac.digest();
  }


  return function randomFloat(): number {
    // Take first 8 bytes and turn into a float between 0 and 1
    const bytes = randomBytes();
    const num = bytes.readBigUInt64BE(0);
    const scaled = (num * PRECISION_BI) / MAX_BI;
    return Number(scaled) / PRECISION_NUM;
  }
}

/*
// These functions won't be used as the gas they cost can't be tracked
  function randomInt(randomFloat: ()=>number, min: number, max: number): number {
    return Math.floor(randomFloat() * (max - min + 1)) + min;
  }

  function randomShuffle<T>(randomFloat: ()=>number, array: Array<T>): Array<T> {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = randomInt(randomFloat, 0, i);
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }
*/
