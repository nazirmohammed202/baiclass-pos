import axios from "axios";

async function createServerApi() {
  return axios.create({
    baseURL: process.env.API_URL,
  });
}

const api = await createServerApi();

export default api;
