import { API_BASE_URL } from "../config/api";

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const tokens = {
  get access() {
    return localStorage.getItem("accessToken");
  },
  get refresh() {
    return localStorage.getItem("refreshToken");
  },
};

export const clearSession = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

let refreshing = null;

async function refreshAccessToken() {
  if (!tokens.refresh) return false;
  if (!refreshing) {
    refreshing = fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tokens.refresh}` },
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        localStorage.setItem("accessToken", data.access_token);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

function toQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function send(method, path, { params, body, blob } = {}, retried = false) {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}${toQuery(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection.", 0);
  }

  if (res.status === 401 && !retried && tokens.access) {
    if (await refreshAccessToken()) return send(method, path, { params, body, blob }, true);
    clearSession();
    window.location.assign("/auth/login");
    throw new ApiError("Your session has ended. Please sign in again.", 401);
  }

  if (!res.ok) {
    let message = "Something went wrong. Please try again.";
    let fields;
    try {
      const data = await res.json();
      message = data.message || message;
      fields = data.fields;
    } catch {
      /* no body */
    }
    throw new ApiError(message, res.status, fields);
  }
  if (blob) return res.blob();
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (path, params) => send("GET", path, { params }),
  post: (path, body) => send("POST", path, { body: body ?? {} }),
  put: (path, body) => send("PUT", path, { body: body ?? {} }),
  /** Downloads a file (for example an Excel report) and saves it. */
  download: async (path, params, filename) => {
    const blob = await send("GET", path, { params, blob: true });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
