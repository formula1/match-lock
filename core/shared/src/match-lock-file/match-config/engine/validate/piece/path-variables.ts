
export function validatePathVariables(variables: Array<string>){
  if(new Set(variables).size !== variables.length){
    throw new Error(`Duplicate path variables`);
  }
  for(const variable of variables){
    validatePathVariable(variable);
  }
}

const INVALID_PATH_VARIABLE_CHARS = /[^a-zA-Z0-9_]/;
export function validatePathVariable(variable: string){
  if(variable.length === 0){
    throw new Error(`Path variable is empty`);
  }
  const match = variable.match(INVALID_PATH_VARIABLE_CHARS)
  if(match){
    throw new Error(`Path variable ${variable} contains invalid character: "${match[0]}"`);
  }
}
