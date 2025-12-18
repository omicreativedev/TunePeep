import "bootstrap/dist/css/bootstrap.min.css";
//import { useState } from "react";
//import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import axiosClient from "./api/axiosConfig";
import "./App.css";
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

function App() {
	const navigate = useNavigate();
	const { auth, setAuth } = useAuth();

	const updateMusicReview = (music_id) => {
		navigate(`/review/${music_id}`);
	};

	// Edit
	// Start Logout Functionality

	const handleLogout = async () => {
		try {
			const response = await axiosClient.post("/logout", {
				user_id: auth.user_id,
			});
			console.log(response.data);
			setAuth(null);
			// localStorage.removeItem("user");
			console.log("User Logged out");
		} catch (error) {
			console.error("Error logging out:", error);
		}
	};
	//---- End Logout Functionality

	return (
		<>
			{/* <AuthProvider>*/}
			<Header handleLogout={handleLogout} />
			<Routes path="/" element={<Layout />}>
				<Route
					path="/"
					element={<Home updateMusicReview={updateMusicReview} />}
				></Route>
				<Route path="/register" element={<Register />}></Route>
				<Route path="/login" element={<Login />}></Route>
				<Route element={<RequiredAuth />}>
					<Route path="/recommended" element={<Recommended />}></Route>
					<Route path="/review/:music_id" element={<Review />}></Route>
					<Route path="/stream/:yt_id" element={<StreamMovie />}></Route>
				</Route>
			</Routes>
			{/*</AuthProvider>*/}
		</>
	);
}

export default App;
