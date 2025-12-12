
const VARIABLE_VALUE_CHARSET = 'a-zA-Z0-9_\\- '; // alphanumeric, underscore, hyphen, space
const VARIABLE_VALUE_MIN_LENGTH = 1;
const VARIABLE_VALUE_MAX_LENGTH = 64;

// For glob validation, we'll use a character class
const VARIABLE_GLOB_PATTERN = `[${VARIABLE_VALUE_CHARSET}]+`;

export function validatePathVariablesInGlob(
  glob: string, pathVariables: Array<string>
){
  const pathVariableRegex = /<([a-zA-Z0-9_\\-]+)>/g;
  let match: RegExpExecArray | null;
  while((match = pathVariableRegex.exec(glob)) !== null){
    const variable = match[1];
    if(!pathVariables.includes(variable)){
      throw new Error(`Glob ${glob} uses undefined path variable ${variable}`);
    }
  }
}

export function replacePathVariablesWithGlob(
  glob: string
){
  return glob.replaceAll(
    /<([a-zA-Z0-9_\\-]+)>/g,
    `[${VARIABLE_GLOB_PATTERN}]{${VARIABLE_VALUE_MIN_LENGTH},${VARIABLE_VALUE_MAX_LENGTH}}` 
  );
}
