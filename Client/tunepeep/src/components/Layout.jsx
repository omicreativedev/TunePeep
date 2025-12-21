import { Outlet } from "react-router-dom";

/*This file provides a basic layout wrapper for the application's pages. It sets up the main content structure where all child route components will be rendered.*/

const Layout = () => {
	return (
		<main>
			<Outlet />
		</main>
	);
};
export default Layout;
