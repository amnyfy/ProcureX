import axiosClient from "./axiosClient";

export function listCompanies() {
  return axiosClient.get("/companies/").then((res) => res.data);
}

export function getCompany(companyId) {
  return axiosClient.get(`/companies/${companyId}`).then((res) => res.data);
}

/**
 * Assumed request body:
 * { name, registration_number, industry, address, website }
 * Only `name` is treated as strictly required by the UI; the rest are
 * optional and only sent if provided.
 */
export function createCompany(payload) {
  return axiosClient.post("/companies/", payload).then((res) => res.data);
}

export function updateCompany(companyId, payload) {
  return axiosClient
    .put(`/companies/${companyId}`, payload)
    .then((res) => res.data);
}

export function deleteCompany(companyId) {
  return axiosClient.delete(`/companies/${companyId}`).then((res) => res.data);
}
