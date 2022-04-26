type copyElementType = boolean | number | string | object | null | undefined;

export function copyElement(original: copyElementType): copyElementType {
  if (
    typeof original === "undefined" ||
    original === null ||
    typeof original !== "object"
  ) {
    return original;
  }

  if (Array.isArray(original)) {
    const originalArray = original as copyElementType[];
    const copy: copyElementType[] = [];
    originalArray.forEach((item): void => {
      if (typeof item !== "undefined") {
        copy.push(copyElement(item));
      }
    });
    return copy;
  }

  if (original instanceof Object) {
    const originalObject = original as { [x: string]: copyElementType };
    const copy: {
      [x: string]: copyElementType;
    } = {};
    Object.keys(originalObject).forEach((property): void => {
      if (typeof originalObject[property] !== "undefined") {
        copy[property] = copyElement(originalObject[property]);
      }
    });
    return copy;
  }

  throw new Error("'original' contains an object that cannot be copied.");
}
