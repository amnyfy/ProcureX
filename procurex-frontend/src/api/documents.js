import axiosClient from "./axiosClient";

export function uploadDocument(tenderId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient
    .post(`/documents/upload/${tenderId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((res) => res.data);
}
