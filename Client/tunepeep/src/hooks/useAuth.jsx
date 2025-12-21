import { useContext } from "react";
import AuthContext from "../context/AuthProvider";

/*This file is a React hook that provides access to the authentication context as a wrapper around the useContext hook. */

const useAuth = () => {
	return useContext(AuthContext);
};

export default useAuth;
