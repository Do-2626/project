// utils/api-client.ts

export type ApiErrorDetail = {
  path: (string | number)[];
  message: string;
};

export class ApiError extends Error {
  status: number;
  errorType: string;
  details?: ApiErrorDetail[];

  constructor(message: string, status: number, errorType: string, details?: ApiErrorDetail[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorType = errorType;
    this.details = details;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: "SERVER_ERROR", message: "An unexpected error occurred" };
    }

    throw new ApiError(
      errorData.message || "Request failed",
      response.status,
      errorData.error || "SERVER_ERROR",
      errorData.details
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

export const apiClient = {
  async get<T>(url: string, params?: Record<string, string | number | null | undefined>): Promise<T> {
    const queryString = params
      ? "?" + new URLSearchParams(
        Object.entries(params)
          .filter(([_, v]) => v != null)
          .map(([k, v]) => [k, String(v)])
      ).toString()
      : "";

    const response = await fetch(url + queryString, {
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(response);
  },

  async post<T>(url: string, body: any): Promise<T> {
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async patch<T>(url: string, body: any): Promise<T> {
    const response = await fetch(url, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  async delete(url: string): Promise<void> {
    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await handleResponse<void>(response);
  },
};
