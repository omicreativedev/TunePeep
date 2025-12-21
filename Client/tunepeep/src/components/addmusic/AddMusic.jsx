import { faArrowLeft, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

/*This file provides an admin-only form for adding new music entries.*/

const AddMusic = () => {
	const navigate = useNavigate();
	const { auth } = useAuth();
	const axiosPrivate = useAxiosPrivate();

	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [genresList, setGenresList] = useState([]);

	const [formData, setFormData] = useState({
		music_id: "",
		title: "",
		album_img: "",
		youtube_id: "",
		genre: [],
	});

	// Redirect if not logged in or not admin
	useEffect(() => {
		if (!auth) {
			navigate("/login");
			return;
		}

		if (auth.role !== "ADMIN") {
			navigate("/unauthorized");
			return;
		}
	}, [auth, navigate]);

	// Fetch genres list
	useEffect(() => {
		if (!auth || auth.role !== "ADMIN") return;

		let isMounted = true;
		const controller = new AbortController();

		const fetchGenres = async () => {
			setLoading(true);
			try {
				const response = await axiosPrivate.get("/genres", {
					signal: controller.signal,
				});
				if (isMounted) {
					setGenresList(response.data || []);
				}
			} catch (err) {
				if (isMounted && err.name !== "AbortError") {
					console.error("Error fetching genres:", err);
					setError("Failed to load genres");
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchGenres();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [auth]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleGenreChange = (e) => {
		const options = Array.from(e.target.selectedOptions);
		const selectedIds = options.map((opt) => Number(opt.value));
		setFormData((prev) => ({
			...prev,
			genre: selectedIds,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");
		setSuccess("");

		try {
			// Prepare data for API. Convert genre IDs to genre objects
			const submitData = {
				music_id: formData.music_id,
				title: formData.title,
				album_img: formData.album_img,
				youtube_id: formData.youtube_id,
				genre: formData.genre.map((genreId) => {
					const genre = genresList.find((g) => g.genre_id === genreId);
					return {
						genre_id: genreId,
						genre_name: genre?.genre_name || `Genre ${genreId}`,
					};
				}),
			};

			// Call the backend POST endpoint
			const response = await axiosPrivate.post("/addmusic", submitData);

			setSuccess("Music added successfully!");

			// Reset form
			setFormData({
				music_id: "",
				title: "",
				album_img: "",
				youtube_id: "",
				genre: [],
			});

			// Optional: Redirect after success
			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (err) {
			setError(err.response?.data?.error || "Failed to add music");
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	};

	if (!auth || auth.role !== "ADMIN") {
		return null;
	}

	if (loading) {
		return (
			<div className="container py-5 text-center">
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Loading...</span>
				</Spinner>
			</div>
		);
	}

	return (
		<div className="container py-5">
			<h2 className="text-center mb-4">Add New Music</h2>

			<Card className="shadow">
				<Card.Body>
					<Button
						variant="outline-secondary"
						onClick={() => navigate(-1)}
						className="mb-4"
					>
						<FontAwesomeIcon icon={faArrowLeft} className="me-2" />
						Go Back
					</Button>

					{error && <Alert variant="danger">{error}</Alert>}
					{success && <Alert variant="success">{success}</Alert>}

					<Form onSubmit={handleSubmit}>
						{/* Music ID (Spotify ID) */}
						<Form.Group className="mb-3">
							<Form.Label>Spotify Music ID *</Form.Label>
							<Form.Control
								type="text"
								name="music_id"
								value={formData.music_id}
								onChange={handleChange}
								required
								placeholder="Spotify album ID"
							/>
							<Form.Text className="text-muted">
								Example: 3ZGUBwDiY5HPOcWv4SBPQg
							</Form.Text>
						</Form.Group>

						{/* Title */}
						<Form.Group className="mb-3">
							<Form.Label>Title *</Form.Label>
							<Form.Control
								type="text"
								name="title"
								value={formData.title}
								onChange={handleChange}
								required
								placeholder="Album title"
							/>
						</Form.Group>

						{/* Album Image URL */}
						<Form.Group className="mb-3">
							<Form.Label>Album Image URL *</Form.Label>
							<Form.Control
								type="url"
								name="album_img"
								value={formData.album_img}
								onChange={handleChange}
								required
								placeholder="https://raw.githubusercontent.com/omicreativedev/TunePeep/refs/heads/main/covers_2k/filename.png"
							/>
							<Form.Text className="text-muted">
								Example:
								https://raw.githubusercontent.com/omicreativedev/TunePeep/refs/heads/main/covers_2k/example.png
							</Form.Text>
						</Form.Group>

						{/* YouTube ID */}
						<Form.Group className="mb-3">
							<Form.Label>YouTube ID *</Form.Label>
							<Form.Control
								type="text"
								name="youtube_id"
								value={formData.youtube_id}
								onChange={handleChange}
								required
								placeholder="YouTube video ID"
							/>
							<Form.Text className="text-muted">
								The ID after "v=" in YouTube URL. Example: v=ycWOWpC_fBE
							</Form.Text>
						</Form.Group>

						{/* Genres - Multi-select */}
						<Form.Group className="mb-3">
							<Form.Label>Genres *</Form.Label>
							<Form.Select
								multiple
								value={formData.genre.map((g) => String(g))}
								onChange={handleGenreChange}
								size="5"
								required
							>
								{genresList.map((genre) => (
									<option
										key={genre.genre_id}
										value={genre.genre_id}
										label={genre.genre_name}
									>
										{genre.genre_name}
									</option>
								))}
							</Form.Select>
							<Form.Text className="text-muted">
								Hold Ctrl (Windows) or Cmd (Mac) to select multiple genres.
							</Form.Text>
						</Form.Group>

						{/* Submit Button */}
						<div className="d-flex justify-content-end gap-2 mt-4">
							<Button
								variant="secondary"
								onClick={() => navigate(-1)}
								disabled={submitting}
							>
								Cancel
							</Button>
							<Button variant="success" type="submit" disabled={submitting}>
								<FontAwesomeIcon icon={faPlus} className="me-2" />
								{submitting ? "Adding..." : "Add Music"}
							</Button>
						</div>
					</Form>
				</Card.Body>
			</Card>
		</div>
	);
};

export default AddMusic;
