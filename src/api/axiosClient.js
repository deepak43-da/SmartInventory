
import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://api.example.com"
});

export default axiosClient;
