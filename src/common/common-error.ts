/**
 * The class from which all errors are derived. Deriving all errors from this
 * class ensures that all errors will have an error code (`code`) and will be
 * understood where a `Error` class or a `NodeJS.ErrnoException` interface is
 * expected. Making `code` an abstract string enables each derived error
 * subclass to enumerate the `code` values it supports by declaring `code` to be
 * of a string literal type that enumerates the supported values supported
 * codes.
 */
export abstract class CommonError
  extends Error
  implements NodeJS.ErrnoException
{
  public abstract code: string;

  protected constructor(options: {
    code?: string;
    message?: string;
    cause?: unknown;
  }) {
    const message = options.message ?? "";
    super(message, { cause: options.cause });
    this.name = "CommonError";
  }
}
