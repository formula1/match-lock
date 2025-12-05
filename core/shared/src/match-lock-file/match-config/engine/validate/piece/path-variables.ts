
export function validatePathVariables(variables: Array<string>){
  if(new Set(variables).size !== variables.length){
    throw new Error(`Duplicate path variables`);
  }
  for(const variable of variables){
    validatePathVariableName(variable);
  }
}

const INVALID_PATH_VARIABLE_CHARS = /[^a-zA-Z0-9_]/;
export function validatePathVariableName(variable: string){
  if(variable.length === 0){
    throw new Error(`Path variable is empty`);
  }
  if(variable.length > 64){
    throw new Error(`Path variable ${variable} is too long`);
  }
  const match = variable.match(INVALID_PATH_VARIABLE_CHARS)
  if(match){
    throw new Error(`Path variable ${variable} contains invalid character: "${match[0]}"`);
  }
}
