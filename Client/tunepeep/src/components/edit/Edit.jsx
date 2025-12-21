import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

/* This file provides an admin-only form for editing music entries. It includes a delete option with removal warning and handles form submission to update music data through protected API endpoints. */

const Edit = () => {
	const { music_id } = useParams();
	const navigate = useNavigate();
	const { auth } = useAuth();
	const axiosPrivate = useAxiosPrivate();

	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
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

	// Fetch data
	useEffect(() => {
		if (!music_id || !auth || auth.role !== "ADMIN") return;

		let isMounted = true;
		const controller = new AbortController();

		const fetchData = async () => {
			setLoading(true);
			setError("");
			try {
				// Fetch music data
				const musicResponse = await axiosPrivate.get(`/music/${music_id}`, {
					signal: controller.signal,
				});

				// Fetch genres list
				const genresResponse = await axiosPrivate.get("/genres", {
					signal: controller.signal,
				});

				if (isMounted) {
					const musicData = musicResponse.data;
					setGenresList(genresResponse.data || []);

					// Get current genre IDs as array of numbers
					const currentGenreIds = musicData.genre?.map((g) => g.genre_id) || [];

					setFormData({
						music_id: musicData.music_id || "",
						title: musicData.title || "",
						album_img: musicData.album_img || "",
						youtube_id: musicData.youtube_id || "",
						genre: currentGenreIds,
					});
					setLoading(false);
				}
			} catch (err) {
				if (isMounted && err.name !== "AbortError") {
					setError("Failed to load data");
					console.error(err);
					setLoading(false);
				}
			}
		};

		fetchData();

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [music_id]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Same genre selection as Register screen
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
			// Prepare data for API - convert genre IDs to full genre objects
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

			// Call the backend PATCH endpoint
			await axiosPrivate.patch(`/edit/${music_id}`, submitData);

			setSuccess("Music updated successfully!");

			// Optional: Redirect after success
			setTimeout(() => {
				navigate(`/review/${music_id}`);
			}, 2000);
		} catch (err) {
			setError(err.response?.data?.error || "Failed to update music");
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async () => {
		setDeleting(true);
		setError("");
		try {
			await axiosPrivate.delete(`/delete/${music_id}`);
			setSuccess("Music deleted successfully! Redirecting...");

			// Redirect to home page after deletion
			setTimeout(() => {
				navigate("/");
			}, 2000);
		} catch (err) {
			setError(err.response?.data?.error || "Failed to delete music");
			console.error(err);
			setDeleting(false);
			setShowDeleteModal(false);
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
		<>
			{/* Delete Confirmation Modal */}
			<Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Confirm Deletion</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Are you sure you want to delete <strong>"{formData.title}"</strong>?
					<br />
					<small className="text-muted">
						This action cannot be undone. The music will be permanently removed
						from the database.
					</small>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={() => setShowDeleteModal(false)}
						disabled={deleting}
					>
						Cancel
					</Button>
					<Button variant="danger" onClick={handleDelete} disabled={deleting}>
						{deleting ? "Deleting..." : "Yes, Delete"}
					</Button>
				</Modal.Footer>
			</Modal>

			<div className="container py-5">
				<h2 className="text-center mb-4">Edit Music Entry</h2>

				<Card className="shadow">
					<Card.Body>
						<Button
							variant="outline-secondary"
							onClick={() => navigate(`/review/${music_id}`)}
							className="mb-4"
						>
							<FontAwesomeIcon icon={faArrowLeft} className="me-2" />
							Back to Review
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
									placeholder="https://example.com/image.jpg"
								/>
								<Form.Text className="text-muted">
									Should be from:
									https://raw.githubusercontent.com/omicreativedev/TunePeep/refs/heads/main/covers_2k/
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
									The ID after "v=" in YouTube URL. Example: c_m1EO_vRWw
								</Form.Text>
							</Form.Group>

							{/* Genres - Multi-select (same as Register) */}
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

							{/* Buttons */}
							<div className="d-flex justify-content-between align-items-center mt-4">
								{/* Delete Button - Left side */}
								<Button
									variant="outline-danger"
									onClick={() => setShowDeleteModal(true)}
									disabled={submitting || deleting}
								>
									<FontAwesomeIcon icon={faTrash} className="me-2" />
									Delete Music
								</Button>

								{/* Cancel/Update Buttons - Right side */}
								<div className="d-flex gap-2">
									<Button
										variant="secondary"
										onClick={() => navigate(`/review/${music_id}`)}
										disabled={submitting || deleting}
									>
										Cancel
									</Button>
									<Button
										variant="primary"
										type="submit"
										disabled={submitting || deleting}
									>
										{submitting ? "Updating..." : "Update Music"}
									</Button>
								</div>
							</div>
						</Form>
					</Card.Body>
				</Card>
			</div>
		</>
	);
};

export default Edit;
