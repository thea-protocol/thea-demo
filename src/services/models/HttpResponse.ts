export default interface httpResponseIn<T = any> {
  result: T;
  error: string;
  errorMessage: string;
}
