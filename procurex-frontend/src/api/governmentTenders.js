import axiosClient from "./axiosClient";

export function listGovernmentTenders(params = {}) {
  return axiosClient
    .get("/government-tenders/", { params })
    .then((res) => res.data);
}

export function getGovernmentTender(id) {
  return axiosClient
    .get(`/government-tenders/${id}`)
    .then((res) => res.data);
}

export function syncGovernmentTenders(source = "CPPP") {
  return axiosClient
    .post(`/government-tenders/sync?source=${source}`)
    .then((res) => res.data);
}

export function getSyncStatus(source = "CPPP") {
  return axiosClient
    .get(`/government-tenders/sync/status?source=${source}`)
    .then((res) => res.data);
}

export function addToMyOpportunities(tenderId) {
  return axiosClient
    .post(`/government-tenders/${tenderId}/add-to-my-opportunities`)
    .then((res) => res.data);
}
