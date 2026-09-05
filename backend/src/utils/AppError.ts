// A custom error we throw on purpose from our services/controllers
// (e.g. "email already taken"). The error middleware knows how to read
// statusCode + code from this and turn it into the right HTTP response.
export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(statusCode: number, message: string, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // true = expected error, not a bug
  }
}
