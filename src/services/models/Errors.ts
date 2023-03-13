export interface ErrorMessage {
  error: string;
  errorMessage?: string;
}

export default interface Errors extends Array<ErrorMessage> {}
