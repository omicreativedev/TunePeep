import axios from "axios";

/* This file configures an Axios HTTP client instance for making authenticated API requests.*/

const API_BASE_URL = "http://localhost:8080";

// Reference: https://axios-http.com/docs/instance

const axiosPrivate = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // important for HTTP-only cookies
});

export default axiosPrivate;
