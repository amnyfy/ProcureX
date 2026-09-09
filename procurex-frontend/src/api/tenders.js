import axiosClient from "./axiosClient";

export function listTenders() {
  return axiosClient.get("/tenders/").then((res) => res.data);
}

export function getTender(tenderId) {
  return axiosClient.get(`/tenders/${tenderId}`).then((res) => res.data);
}

/**
 * Assumed request body, based on the fields requested in the UI spec:
 * {
 *   title, reference_number, organization, description, category,
 *   location, estimated_value, deadline, status, company_id
 * }
 */
export function createTender(payload) {
  return axiosClient.post("/tenders/", payload).then((res) => res.data);
}

export function updateTender(tenderId, payload) {
  return axiosClient
    .put(`/tenders/${tenderId}`, payload)
    .then((res) => res.data);
}

export function deleteTender(tenderId) {
  return axiosClient.delete(`/tenders/${tenderId}`).then((res) => res.data);
}
