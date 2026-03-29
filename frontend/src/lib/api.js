const DEFAULT_API_BASE_URL = "http://localhost:8000";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { detail: text } : null;
}

export async function apiRequest(
  path,
  { method = "GET", body, token, headers = {}, signal } = {},
) {
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    const message =
      (data && typeof data === "object" && "detail" in data && data.detail) ||
      `Request failed with status ${response.status}`;
    throw new ApiError(String(message), response.status, data);
  }

  return data;
}

