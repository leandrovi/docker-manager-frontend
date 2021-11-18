import axios from "axios";

const baseURL = "http://localhost:3333";

export const api = axios.create({ baseURL });