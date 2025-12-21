import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "./spinner/Spinner";

/* This file protects pages so only logged-in users can see them. It checks if a user is logged in, shows a loading spinner while checking, and sends the user to the login page if not signed in. */

const RequiredAuth = () => {
	const { auth, loading } = useAuth();
	const location = useLocation();

	if (loading) {
		return <Spinner />;
	}

	return auth ? (
		<Outlet />
	) : (
		<Navigate to="/login" state={{ from: location }} replace />
	);
};
export default RequiredAuth;
