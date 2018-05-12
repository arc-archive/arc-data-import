/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   transformers/postman-transformer.js
 *   transformers/postman-transformer.js
 *   transformers/postman-transformer.js
 *   transformers/postman-transformer.js
 *   transformers/postman-transformer.js
 */

/**
 * Base class for all Postman transformers
 */
declare class PostmanTransformer {

  /**
   * Computes body value for Postman's v1 body definition.
   *
   * @param item Postam v1 model.
   * @returns Body value
   */
  computeBodyOld(item: object|null): String|null;

  /**
   * Computes body as a FormData data model.
   * This function sets `multipart` property on the item.
   *
   * @param item Postam v1 model.
   * @returns Body value. Always empty string.
   */
  _computeFormDataBody(item: object|null): String|null;

  /**
   * Computes body as a URL encoded data model.
   *
   * @param item Postam v1 model.
   * @returns Body value.
   */
  _computeUrlEncodedBody(item: object|null): String|null;

  /**
   * Parse input string as a payload param key or value.
   *
   * @param input An input to parse.
   * @returns Trimmed string
   */
  _paramValue(input: String|null): String|null;

  /**
   * Computes ARC simple model from Postam simple params model.
   * The ondly difference is to use of `name` instead of `key`.
   *
   * @param array Postman params model.
   * @returns ARC params model.
   */
  computeSimpleModel(array: Array<object|null>|null): Array<object|null>|null;

  /**
   * Replacer function for regex replace to be used to replace variables
   * notation to ARC's
   *
   * @returns Value to be replaced in the string.
   */
  _variablesReplacerFunction(match: String|null, value: String|null): String|null;

  /**
   * Replaces any occurence of {{STRING}} with ARC's variables syntax.
   *
   * @param str A string value to check for variables.
   * @returns The same string with ARC's variables syntax
   */
  ensureVariablesSyntax(str: String|null): String|null;
  ensureVarsRecursevily(obj: any): any;
}

/**
 * Base class for all Postman transformers
 */
declare class PostmanTransformer {

  /**
   * Computes body value for Postman's v1 body definition.
   *
   * @param item Postam v1 model.
   * @returns Body value
   */
  computeBodyOld(item: object|null): String|null;

  /**
   * Computes body as a FormData data model.
   * This function sets `multipart` property on the item.
   *
   * @param item Postam v1 model.
   * @returns Body value. Always empty string.
   */
  _computeFormDataBody(item: object|null): String|null;

  /**
   * Computes body as a URL encoded data model.
   *
   * @param item Postam v1 model.
   * @returns Body value.
   */
  _computeUrlEncodedBody(item: object|null): String|null;

  /**
   * Parse input string as a payload param key or value.
   *
   * @param input An input to parse.
   * @returns Trimmed string
   */
  _paramValue(input: String|null): String|null;

  /**
   * Computes ARC simple model from Postam simple params model.
   * The ondly difference is to use of `name` instead of `key`.
   *
   * @param array Postman params model.
   * @returns ARC params model.
   */
  computeSimpleModel(array: Array<object|null>|null): Array<object|null>|null;

  /**
   * Replacer function for regex replace to be used to replace variables
   * notation to ARC's
   *
   * @returns Value to be replaced in the string.
   */
  _variablesReplacerFunction(match: String|null, value: String|null): String|null;

  /**
   * Replaces any occurence of {{STRING}} with ARC's variables syntax.
   *
   * @param str A string value to check for variables.
   * @returns The same string with ARC's variables syntax
   */
  ensureVariablesSyntax(str: String|null): String|null;
  ensureVarsRecursevily(obj: any): any;
}

/**
 * Base class for all Postman transformers
 */
declare class PostmanTransformer {

  /**
   * Computes body value for Postman's v1 body definition.
   *
   * @param item Postam v1 model.
   * @returns Body value
   */
  computeBodyOld(item: object|null): String|null;

  /**
   * Computes body as a FormData data model.
   * This function sets `multipart` property on the item.
   *
   * @param item Postam v1 model.
   * @returns Body value. Always empty string.
   */
  _computeFormDataBody(item: object|null): String|null;

  /**
   * Computes body as a URL encoded data model.
   *
   * @param item Postam v1 model.
   * @returns Body value.
   */
  _computeUrlEncodedBody(item: object|null): String|null;

  /**
   * Parse input string as a payload param key or value.
   *
   * @param input An input to parse.
   * @returns Trimmed string
   */
  _paramValue(input: String|null): String|null;

  /**
   * Computes ARC simple model from Postam simple params model.
   * The ondly difference is to use of `name` instead of `key`.
   *
   * @param array Postman params model.
   * @returns ARC params model.
   */
  computeSimpleModel(array: Array<object|null>|null): Array<object|null>|null;

  /**
   * Replacer function for regex replace to be used to replace variables
   * notation to ARC's
   *
   * @returns Value to be replaced in the string.
   */
  _variablesReplacerFunction(match: String|null, value: String|null): String|null;

  /**
   * Replaces any occurence of {{STRING}} with ARC's variables syntax.
   *
   * @param str A string value to check for variables.
   * @returns The same string with ARC's variables syntax
   */
  ensureVariablesSyntax(str: String|null): String|null;
  ensureVarsRecursevily(obj: any): any;
}

/**
 * Base class for all Postman transformers
 */
declare class PostmanTransformer {

  /**
   * Computes body value for Postman's v1 body definition.
   *
   * @param item Postam v1 model.
   * @returns Body value
   */
  computeBodyOld(item: object|null): String|null;

  /**
   * Computes body as a FormData data model.
   * This function sets `multipart` property on the item.
   *
   * @param item Postam v1 model.
   * @returns Body value. Always empty string.
   */
  _computeFormDataBody(item: object|null): String|null;

  /**
   * Computes body as a URL encoded data model.
   *
   * @param item Postam v1 model.
   * @returns Body value.
   */
  _computeUrlEncodedBody(item: object|null): String|null;

  /**
   * Parse input string as a payload param key or value.
   *
   * @param input An input to parse.
   * @returns Trimmed string
   */
  _paramValue(input: String|null): String|null;

  /**
   * Computes ARC simple model from Postam simple params model.
   * The ondly difference is to use of `name` instead of `key`.
   *
   * @param array Postman params model.
   * @returns ARC params model.
   */
  computeSimpleModel(array: Array<object|null>|null): Array<object|null>|null;

  /**
   * Replacer function for regex replace to be used to replace variables
   * notation to ARC's
   *
   * @returns Value to be replaced in the string.
   */
  _variablesReplacerFunction(match: String|null, value: String|null): String|null;

  /**
   * Replaces any occurence of {{STRING}} with ARC's variables syntax.
   *
   * @param str A string value to check for variables.
   * @returns The same string with ARC's variables syntax
   */
  ensureVariablesSyntax(str: String|null): String|null;
  ensureVarsRecursevily(obj: any): any;
}

/**
 * Base class for all Postman transformers
 */
declare class PostmanTransformer {

  /**
   * Computes body value for Postman's v1 body definition.
   *
   * @param item Postam v1 model.
   * @returns Body value
   */
  computeBodyOld(item: object|null): String|null;

  /**
   * Computes body as a FormData data model.
   * This function sets `multipart` property on the item.
   *
   * @param item Postam v1 model.
   * @returns Body value. Always empty string.
   */
  _computeFormDataBody(item: object|null): String|null;

  /**
   * Computes body as a URL encoded data model.
   *
   * @param item Postam v1 model.
   * @returns Body value.
   */
  _computeUrlEncodedBody(item: object|null): String|null;

  /**
   * Parse input string as a payload param key or value.
   *
   * @param input An input to parse.
   * @returns Trimmed string
   */
  _paramValue(input: String|null): String|null;

  /**
   * Computes ARC simple model from Postam simple params model.
   * The ondly difference is to use of `name` instead of `key`.
   *
   * @param array Postman params model.
   * @returns ARC params model.
   */
  computeSimpleModel(array: Array<object|null>|null): Array<object|null>|null;

  /**
   * Replacer function for regex replace to be used to replace variables
   * notation to ARC's
   *
   * @returns Value to be replaced in the string.
   */
  _variablesReplacerFunction(match: String|null, value: String|null): String|null;

  /**
   * Replaces any occurence of {{STRING}} with ARC's variables syntax.
   *
   * @param str A string value to check for variables.
   * @returns The same string with ARC's variables syntax
   */
  ensureVariablesSyntax(str: String|null): String|null;
  ensureVarsRecursevily(obj: any): any;
}