import { GeneralCommonError } from "../general-common-error";

export type copyElementType =
  | boolean
  | number
  | string
  | object
  | null
  | undefined;

export function copyElement(original: copyElementType): copyElementType {
  if (
    original === undefined ||
    original === null ||
    typeof original !== "object"
  ) {
    return original;
  }

  if (Array.isArray(original)) {
    const originalArray = original as copyElementType[];
    const copy: copyElementType[] = [];
    for (const item of originalArray) {
      if (item !== undefined) {
        copy.push(copyElement(item));
      }
    }
    return copy;
  }

  if (original instanceof Object) {
    const originalObject = original as Record<string, copyElementType>;
    const copy: Record<string, copyElementType> = {};
    for (const property of Object.keys(originalObject)) {
      if (originalObject[property] !== undefined) {
        copy[property] = copyElement(originalObject[property]);
      }
    }
    return copy;
  }

  throw new GeneralCommonError({
    message: "'original' contains an object that cannot be copied.",
  });
}
