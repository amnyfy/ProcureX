import axiosClient from "./axiosClient";

export function createBid(payload) {
  return axiosClient.post("/bids/", payload).then((res) => res.data);
}

export function listBids() {
  return axiosClient.get("/bids/").then((res) => res.data);
}

export function getBid(bidId) {
  return axiosClient.get(`/bids/${bidId}`).then((res) => res.data);
}

export function updateBidStatus(bidId, status) {
  return axiosClient
    .patch(`/bids/${bidId}/status`, { status })
    .then((res) => res.data);
}

export function deleteBid(bidId) {
  return axiosClient.delete(`/bids/${bidId}`).then((res) => res.data);
}
