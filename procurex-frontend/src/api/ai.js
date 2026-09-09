import axiosClient from "./axiosClient";

export function analyzeTender(tenderId) {
  return axiosClient
    .post(`/ai/analyze/${tenderId}`)
    .then((res) => res.data);
}

export function askCopilot(tenderId, question, conversationHistory = []) {
  return axiosClient
    .post(`/ai/copilot/${tenderId}`, {
      question,
      conversation_history: conversationHistory,
    })
    .then((res) => res.data);
}
