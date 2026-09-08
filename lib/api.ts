export function createResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: any
) {
  return Response.json({
    success,
    data,
    message,
    error,
  });
}
