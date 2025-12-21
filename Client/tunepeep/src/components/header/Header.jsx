import { useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import useAuth from "../../hooks/useAuth";

/*This file creates the navigation header that changes based on the user's authentication.*/

// Edit: handleLogout = {handleLogout}
const Header = ({ handleLogout }) => {
	//{handleLogout}
	const navigate = useNavigate();
	const { auth } = useAuth();

	return (
		<Navbar
			bg="dark"
			variant="dark"
			expand="lg"
			stick="top"
			className="shadow-sm"
		>
			<Container>
				<Navbar.Brand>
					<img
						alt=""
						src={logo}
						width="30"
						height="30"
						className="d-inline-block align-top me-2"
					/>
					TunePeep
				</Navbar.Brand>

				<Navbar.Toggle aria-controls="main-navbar-nav" />
				<Navbar.Collapse>
					<Nav className="me-auto">
						<Nav.Link as={NavLink} to="/">
							Home
						</Nav.Link>

						<Nav.Link as={NavLink} to="/recommended">
							Recommended
						</Nav.Link>
					</Nav>

					<Nav className="ms-auto align-items-center">
						{auth ? (
							<>
								<span className="me-3 text-light">
									Welcome, <strong>{auth.first_name}</strong>
								</span>

								<Button
									variant="outline-light"
									size="sm"
									onClick={handleLogout}
								>
									Logout
								</Button>

								{/* Admin-only Add Music button */}
								{auth.role === "ADMIN" && (
									<Button
										variant="success"
										size="sm"
										className="ms-2"
										onClick={() => navigate("/addmusic")}
									>
										+ Add Music
									</Button>
								)}
							</>
						) : (
							<>
								<Button
									variant="outline-info"
									size="sm"
									className="me-2"
									onClick={() => navigate("/login")}
								>
									Login
								</Button>
								<Button
									variant="info"
									size="sm"
									onClick={() => navigate("/register")}
								>
									Register
								</Button>
							</>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};
export default Header;
