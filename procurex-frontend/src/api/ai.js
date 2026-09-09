import axiosClient from "./axiosClient";

export function analyzeTender(tenderId) {
  return axiosClient
    .post(`/ai/analyze/${tenderId}`)
    .then((res) => res.data);
}
