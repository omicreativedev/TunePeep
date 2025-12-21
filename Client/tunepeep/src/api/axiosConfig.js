import axios from "axios";

/* This file configures an Axios HTTP client instance for making API requests to the backend server. */

const apiUrl = import.meta.env.VITE_API_BASE_URL;

export default axios.create({
	baseURL: apiUrl,
	headers: { "Content-Type": "application/json" },
	withCredentials: true, // HTTP-only cookies
});
