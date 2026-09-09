import axiosClient from "./axiosClient";

/** Fetch the currently authenticated user's profile. */
export function getCurrentUser() {
  return axiosClient.get("/users/me").then((res) => res.data);
}
