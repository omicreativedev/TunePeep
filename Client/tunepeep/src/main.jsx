import "bootstrap/dist/css/bootstrap.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthProvider.jsx";
import "./index.css";

/* This file is the main entry on the Client side and the React root, sets up BrowserRouter for navigation, and wraps the application with an AuthProvider for state management. */

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/*" element={<App />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	</StrictMode>
);
