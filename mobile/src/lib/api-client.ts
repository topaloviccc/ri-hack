// TODO(hack): only ApiError exists until there is a backend; the request function (base URL from
// EXPO_PUBLIC_API_URL, auth header, timeout) lands with the first real endpoint. See BACKLOG.md.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
