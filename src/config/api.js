// In development the app talks to the backend on the same computer that served the page (port 8080),
// so it also works when opened from a phone at http://<your-computer-ip>:5173. Set VITE_DEV_API_URL to change it.
// Production builds use VITE_API_BASE_URL, or the hosted API.
export const API_BASE_URL = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_API_URL || `${window.location.protocol}//${window.location.hostname}:8080`
  : import.meta.env.VITE_API_BASE_URL || "https://api.sales.rw";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REFRESH_TOKEN: `${API_BASE_URL}/api/auth/refresh-token`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  ME: `${API_BASE_URL}/api/me`,
};

export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

// Default headers
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// API Helper function
export const apiCall = async (urlOrOptions = {}, additionalOptions = {}) => {
  // Handle different calling patterns:
  // 1. apiCall({url: 'endpoint', method: 'POST', body: data})
  // 2. apiCall('endpoint', {method: 'POST', body: data})
  // 3. apiCall('endpoint') - legacy string format

  let endpoint, options;

  if (typeof urlOrOptions === "string") {
    // Pattern 2 & 3: First parameter is URL string
    endpoint = urlOrOptions;
    options = additionalOptions;
  } else {
    // Pattern 1: Single object with url property
    endpoint = urlOrOptions.url;
    options = urlOrOptions;
  }

  // Build headers: always accept JSON; only set Content-Type if a body is provided
  const headersObj = {
    ...(options.headers || {}),
  };
  if (!headersObj["Accept"]) {
    headersObj["Accept"] = "application/json";
  }
  const config = {
    method: options.method || HTTP_METHODS.GET,
    headers: headersObj,
  };

  // Add body if provided
  if (options.body) {
    config.body = options.body;
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    if (!config.headers["Content-Type"] && !isFormData) {
      config.headers["Content-Type"] = "application/json";
    }
  }

  // Add any other options (excluding url, method, headers, body to avoid conflicts)
  const { url, method, headers, body, ...otherOptions } = options;
  Object.assign(config, otherOptions);

  // Add auth token if available - check both possible keys
  // Prefer accessToken (new) over token (legacy) to avoid using a stale token
  const accessToken = localStorage.getItem("accessToken");
  const legacyToken = localStorage.getItem("token");
  const token = accessToken || legacyToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Always log API requests/responses for debugging
  const shouldLog = true;
  if (shouldLog) {
    console.log("========== API CALL DEBUG START ==========");
    console.log("Endpoint URL:", endpoint);
    console.log("Request Method:", config.method);
    console.log("Request Headers:", JSON.stringify(config.headers, null, 2));
    console.log("Request Body:", config.body);
    console.log("Request Body Type:", typeof config.body);
    console.log(
      "Request Body Length:",
      config.body ? config.body.length : "N/A"
    );
    console.log("Auth Token Present:", !!token);
    console.log(
      "Auth Token Source:",
      accessToken ? "accessToken" : legacyToken ? "token" : "none"
    );
    console.log(
      "Auth Token (first 20 chars):",
      token ? token.substring(0, 20) + "..." : "None"
    );
    console.log("Full Config Object:", JSON.stringify(config, null, 2));
    console.log("Timestamp:", new Date().toISOString());
  }

  shouldLog && console.log("Making fetch request...");
  try {
    const startTime = Date.now();
    const response = await fetch(endpoint, config);
    const endTime = Date.now();

    shouldLog && console.log("========== RESPONSE RECEIVED ==========");
    shouldLog && console.log("Response Status:", response.status);
    shouldLog && console.log("Response Status Text:", response.statusText);
    shouldLog && console.log("Response OK:", response.ok);
    shouldLog && console.log("Response Time (ms):", endTime - startTime);
    shouldLog &&
      console.log(
        "Response Headers:",
        Object.fromEntries(response.headers.entries())
      );
    shouldLog && console.log("Response URL:", response.url);
    shouldLog && console.log("Response Type:", response.type);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorDetails = null;

      shouldLog &&
        console.log("========== ERROR RESPONSE PROCESSING ==========");
      shouldLog && console.error("Response not OK. Status:", response.status);
      shouldLog && console.error("Status Text:", response.statusText);

      try {
        const responseClone = response.clone();
        try {
          const errorData = await responseClone.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData;
          shouldLog && console.error("Server Error Details (JSON):", errorData);
          shouldLog &&
            console.error(
              "Server Error Details (stringified):",
              JSON.stringify(errorData, null, 2)
            );
        } catch (e) {
          // If response is not JSON, try to get text from the same clone
          try {
            const errorText = await response.text();
            shouldLog && console.error("Server Error Text:", errorText);

            // Check if it's an HTML error page
            if (errorText.includes("<!DOCTYPE") || errorText.includes("<html>")) {
              errorMessage =
                "Server returned HTML error page instead of JSON. This usually indicates a server configuration issue or the endpoint doesn't exist.";
            } else {
              errorMessage = errorText || response.statusText || errorMessage;
            }
          } catch (textError) {
            shouldLog &&
              console.error("Could not parse error response text:", textError);
            errorMessage = response.statusText || errorMessage;
          }
        }
      } catch (cloneError) {
        shouldLog && console.error("Could not clone response:", cloneError);
      }

      // Log additional debugging info
      shouldLog && console.error("Response Status:", response.status);
      shouldLog &&
        console.error(
          "Response Headers:",
          Object.fromEntries(response.headers.entries())
        );
      shouldLog && console.error("Request URL:", endpoint);
      shouldLog && console.error("Request Method:", config.method);
      shouldLog && console.error("Request Headers:", config.headers);

      const enhancedError = new Error(errorMessage);
      enhancedError.status = response.status;
      enhancedError.details = errorDetails;
      throw enhancedError;
    }

    // Handle empty success (e.g., DELETE 204 No Content)
    if (response.status === 204) {
      shouldLog && console.log("No Content (204) - treating as successful with null body");
      shouldLog && console.log("========== API CALL SUCCESS ==========");
      return null;
    }

    // Check if response is actually JSON before parsing
    const contentType = response.headers.get("content-type");
    shouldLog && console.log("Response Content-Type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      shouldLog && console.log("========== NON-JSON RESPONSE ==========");
      const responseText = await response.text();
      shouldLog &&
        console.log(
          "Response Text (first 500 chars):",
          responseText.substring(0, 500)
        );

      if (
        responseText.includes("<!DOCTYPE") ||
        responseText.includes("<html>")
      ) {
        throw new Error(
          "Server returned HTML instead of JSON. This usually indicates the API endpoint doesn't exist or there's a server configuration issue."
        );
      }
      // If there's no body (common on DELETE), treat as success
      if ((config.method || "GET").toUpperCase() === "DELETE") {
        shouldLog && console.log("DELETE with no body - treating as success");
        shouldLog && console.log("========== API CALL SUCCESS ==========");
        return null;
      }

      // Try to parse as JSON anyway in case content-type header is missing
      try {
        const parsedData = JSON.parse(responseText);
        shouldLog &&
          console.log(
            "Successfully parsed as JSON despite missing content-type"
          );
        shouldLog && console.log("========== API CALL SUCCESS ==========");
        return parsedData;
      } catch (e) {
        // If truly empty, still succeed
        if (!responseText || responseText.trim().length === 0) {
          shouldLog && console.log("Empty body with no content-type - treating as success");
          shouldLog && console.log("========== API CALL SUCCESS ==========");
          return null;
        }
        throw new Error(`Expected JSON response but got: ${responseText.substring(0, 200)}...`);
      }
    }

    const responseData = await response.json();
    shouldLog && console.log("========== SUCCESSFUL RESPONSE DATA ==========");
    shouldLog && console.log("Response Data Type:", typeof responseData);
    shouldLog &&
      console.log(
        "Response Data (stringified):",
        JSON.stringify(responseData, null, 2)
      );
    shouldLog && console.log("========== API CALL SUCCESS ==========");

    return responseData;
  } catch (error) {
    shouldLog && console.error("========== API CALL ERROR ==========");
    shouldLog && console.error("API Error Type:", error.constructor.name);
    shouldLog && console.error("API Error Message:", error.message);
    shouldLog && console.error("API Error Stack:", error.stack);
    shouldLog && console.error("Network Error Details:", error);
    shouldLog && console.error("========== API CALL ERROR END ==========");
    throw error;
  }
};

export default API_ENDPOINTS;
