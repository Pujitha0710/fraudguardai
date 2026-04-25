import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictTransaction = async (data) => {
  const response = await api.post("/predict", data);
  return response.data;
};

export default api;