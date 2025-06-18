
export function resolveUrl(before: string, after: string){
  const bUrl = new URL(before, "http://localhost.dev");
  const aUrl = new URL(after, bUrl.href);

  return aUrl.pathname + aUrl.search + aUrl.hash;
}

export function relative(owner: string, subpath: string){
  if(owner.slice(-1) !== "/") owner = owner + "/";
  const index = subpath.indexOf(owner);
  if(index > 0) throw new Error(`subpath ${subpath} is not owned by ${owner}`);
  if(index === -1) throw new Error(`subpath ${subpath} is not owned by ${owner}`);
  return subpath.slice(owner.length);
}

export function matchesPath(urlPath: string, path: string){
  urlPath = urlPath + (urlPath.slice(-1) === "/" ? "" : "/");
  path = path + (path.slice(-1) === "/" ? "" : "/");
  return urlPath === path;
}

export function replaceParams(pathname: string, params: Record<string, undefined | string>){
  if(!pathname) throw new Error("Path is required");
  if(!params || Object.keys(params).length === 0){
    throw new Error("replaceParams not necessary with no params");
  }
  const endsWithSlash = pathname.at(-1) === "/";
  if(!endsWithSlash) pathname += "/";

  let replaced = pathname;
  for(const [key, value] of Object.entries(params)){
    if(!key) throw new Error("key should never be empty");
    replaced = replaced.replaceAll(`/:${key}/`, `/${value}/`);
  }

  if(!endsWithSlash) replaced = replaced.slice(0, -1);

  return replaced;
}
