import { useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosConfig";
import logo from "../../assets/logo.png";
import useAuth from "../../hooks/useAuth";

/* This file provides a login form that authenticates users with email and password,handles form submission to the backend API and redirects users to the page intended.*/

const Login = () => {
	//
	const { setAuth } = useAuth();
	//const [auth, setAuth] = useState("");
	const authContext = useAuth();
	console.log("Auth context:", authContext); // debug

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	// If pathname is null, go to the home
	const from = location.state?.from?.pathname || "/";

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await axiosClient.post("/login", { email, password });

			// log what's going on
			console.log(response.data);

			// handle exception if one occurs
			if (response.data.error) {
				setError(response.data.error);
				return;
			}

			// log what's going on
			console.log(response.data);

			// set auth globally
			setAuth(response.data);

			// localStorage.setItem("user", JSON.stringify(response.data));

			// Handle successful login (store token, redirect to recommended)
			navigate(from, { replace: true });

			// Once logged in, go to the home page
			// navigate("/");
			//
		} catch (err) {
			console.error(err);
			setError("Invalid email or password");
		} finally {
			setLoading(false);
		}
	};
	return (
		<Container className="login-container d-flex align-items-center justify-content-center min-vh-100">
			<div
				className="login-card shadow p-4 rounded bg-white"
				style={{ maxWidth: 400, width: "100%" }}
			>
				<div className="text-center mb-4">
					<img src={logo} alt="Logo" width={60} className="mb-2" />
					<h2 className="fw-bold">Sign In</h2>
					<p className="text-muted">Login to your account.</p>
				</div>
				{error && <div className="alert alert-danger py-2">{error}</div>}
				<Form onSubmit={handleSubmit}>
					<Form.Group controlId="formBasicEmail" className="mb-3">
						<Form.Label>Email address</Form.Label>
						<Form.Control
							type="email"
							placeholder="Enter email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
							autoFocus
						/>
					</Form.Group>

					<Form.Group controlId="formBasicPassword" className="mb-3">
						<Form.Label>Password</Form.Label>
						<Form.Control
							type="password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</Form.Group>

					<Button
						variant="primary"
						type="submit"
						className="w-100 mb-2"
						disabled={loading}
						style={{ fontWeight: 600, letterSpacing: 1 }}
					>
						{loading ? (
							<>
								<span
									className="spinner-border spinner-border-sm me-2"
									role="status"
									aria-hidden="true"
								></span>
								Logging in...
							</>
						) : (
							"Login"
						)}
					</Button>
				</Form>
				<div className="text-center mt-3">
					<span className="text-muted">Don't have an account? </span>
					<Link to="/register" className="fw-semibold">
						Register
					</Link>
				</div>
			</div>
		</Container>
	);
};
export default Login;
