
import { Readable } from "node:stream";
import { ResolvableStream } from "./types";
import fetch, { Response } from "node-fetch-commonjs";

export const httpStream: ResolvableStream<{ type: "http", url: string }> = async (config)=>{
  const url = new URL(config.url);
  const filename = url.pathname.split("/").pop();
  if(!filename){
    throw new Error("URL has no filename");
  }
  const response = await fetch(config.url);
  if(!response.ok){
    throw new HTTPError(response);
  }
  if(!response.body){
    throw new Error("Response has no body");
  }
  return {
    filename: filename,
    stream: response.body as Readable,
  };
}

class HTTPError extends Error {
  public url: string;
  public statusCode: number;
  constructor(public response: Response){
    super("Failed To Fetch");
    this.url = response.url;
    this.statusCode = response.status;
  }
}
