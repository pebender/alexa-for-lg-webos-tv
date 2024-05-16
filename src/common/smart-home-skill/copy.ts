import * as CommonError from "../error";

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
    originalArray.forEach((item): void => {
      if (item !== undefined) {
        copy.push(copyElement(item));
      }
    });
    return copy;
  }

  if (original instanceof Object) {
    const originalObject = original as Record<string, copyElementType>;
    const copy: Record<string, copyElementType> = {};
    Object.keys(originalObject).forEach((property): void => {
      if (originalObject[property] !== undefined) {
        copy[property] = copyElement(originalObject[property]);
      }
    });
    return copy;
  }

  throw CommonError.create({
    message: "'original' contains an object that cannot be copied.",
  });
}
