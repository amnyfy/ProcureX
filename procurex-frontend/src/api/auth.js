import axiosClient from "./axiosClient";

/**
 * Register a new user.
 * Assumed request body (matches the fields requested in the UI spec):
 * { full_name, email, password, role }
 */
export function registerUser(payload) {
  return axiosClient.post("/auth/register", payload).then((res) => res.data);
}

/**
 * Log in and receive a JWT bearer token.
 * Response shape: { access_token, token_type }
 */
export function loginUser({ email, password }) {
  return axiosClient
    .post("/auth/login", { email, password })
    .then((res) => res.data);
}
