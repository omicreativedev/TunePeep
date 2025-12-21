import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import axiosClient from "./api/axiosConfig";
import "./App.css";
import AddMusic from "./components/addmusic/AddMusic";
import Edit from "./components/edit/Edit";
import { default as Header } from "./components/header/Header";
import { default as Home } from "./components/home/Home";
import { default as Layout } from "./components/Layout";
import { default as Login } from "./components/login/Login";
import { default as Recommended } from "./components/recommended/Recommended";
import { default as Register } from "./components/register/Register";
import { default as RequiredAuth } from "./components/RequiredAuth";
import { default as Review } from "./components/review/Review";
import StreamMovie from "./components/stream/StreamMusic";
import { AuthProvider } from "./context/AuthProvider";
import useAuth from "./hooks/useAuth";

/* This file is the main component for the React client. It has authentication-based route protection using RequiredAuth, manages user logout functionality and provides navigation between features. */

function App() {
	const navigate = useNavigate();
	const { auth, setAuth } = useAuth();

	// Navigate to the review page for more information
	const updateMusicReview = (music_id) => {
		navigate(`/review/${music_id}`);
	};

	// Logs user out by calling the API and clearing state
	const handleLogout = async () => {
		try {
			// Send logout request to the server with user ID
			const response = await axiosClient.post("/logout", {
				user_id: auth.user_id,
			});
			console.log(response.data);
			setAuth(null);
			console.log("User Logged out");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};

	return (
		<>
			<Header handleLogout={handleLogout} />

			<Routes path="/" element={<Layout />}>
				{/* Public routes - accessible to all users */}
				<Route
					path="/"
					element={<Home updateMusicReview={updateMusicReview} />}
				></Route>
				<Route path="/register" element={<Register />}></Route>
				<Route path="/login" element={<Login />}></Route>

				{/* Protected routes wrapped in RequiredAuth */}
				<Route element={<RequiredAuth />}>
					<Route path="/recommended" element={<Recommended />}></Route>
					<Route path="/review/:music_id" element={<Review />}></Route>
					<Route path="/stream/:yt_id" element={<StreamMovie />}></Route>
					<Route path="/edit/:music_id" element={<Edit />}></Route>
					<Route path="/addmusic" element={<AddMusic />}></Route>
				</Route>
			</Routes>
		</>
	);
}

export default App;
