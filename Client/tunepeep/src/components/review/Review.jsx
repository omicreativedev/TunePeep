import { faCirclePlay } from "@fortawesome/free-solid-svg-icons/faCirclePlay";
import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { faMusic } from "@fortawesome/free-solid-svg-icons/faMusic";
import { faStar } from "@fortawesome/free-solid-svg-icons/faStar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, Card, Form, ListGroup } from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Spinner from "../spinner/Spinner";

/* This file displays a music information and review page. */

// Helper function for star display
const renderRankingStars = (rankingValue) => {
	if (!rankingValue || rankingValue === 999) {
		return <span className="text-muted">Not Yet Rated</span>;
	}

	const starCount = 6 - rankingValue;

	return (
		<div className="star-rating">
			{[...Array(5)].map((_, index) => (
				<FontAwesomeIcon
					key={index}
					icon={faStar}
					className={index < starCount ? "text-warning" : "text-secondary"}
					style={{
						marginRight: "2px",
						opacity: index < starCount ? 1 : 0.3,
					}}
				/>
			))}
			<span className="ms-2 small text-muted">
				(
				{rankingValue === 1
					? "Excellent"
					: rankingValue === 2
					? "Good"
					: rankingValue === 3
					? "Okay"
					: rankingValue === 4
					? "Bad"
					: "Terrible"}
				)
			</span>
		</div>
	);
};

const Review = () => {
	const [music, setMusic] = useState(null);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const revText = useRef();
	const { music_id } = useParams();
	const { auth } = useAuth();
	const axiosPrivate = useAxiosPrivate();

	useEffect(() => {
		let isMounted = true;
		const controller = new AbortController();

		const fetchMusic = async () => {
			setLoading(true);
			try {
				const response = await axiosPrivate.get(`/music/${music_id}`, {
					signal: controller.signal,
				});
				if (isMounted) {
					setMusic(response.data);
				}
			} catch (error) {
				if (error.name !== "AbortError" && isMounted) {
					console.error("Error fetching music:", error);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		// Only fetch if music_id exists and it hasnt loaded yet
		if (music_id && !music) {
			fetchMusic();
		}

		return () => {
			isMounted = false;
			controller.abort();
		};
	}, [music_id]); // REMOVED axiosPrivate from dependencies

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!revText.current?.value.trim()) return;

		setSubmitting(true);
		try {
			const response = await axiosPrivate.patch(`/updatereview/${music_id}`, {
				admin_review: revText.current.value,
			});

			setMusic((prevMusic) => ({
				...prevMusic,
				admin_review: response.data?.admin_review ?? prevMusic.admin_review,
				ranking: {
					...prevMusic.ranking,
					ranking_name:
						response.data?.ranking_name ?? prevMusic.ranking?.ranking_name,
				},
			}));
		} catch (err) {
			console.error("Error updating review:", err);
			if (err.response?.status === 401) {
				localStorage.removeItem("user");
			}
		} finally {
			setSubmitting(false);
		}
	};

	// Don't render anything if no music data
	if (loading || !music) {
		return <Spinner />;
	}

	return (
		<div className="container py-5">
			<h2 className="text-center mb-4"></h2>

			{/* Music Card Section - Top */}
			<div className="row justify-content-center mb-4">
				<div className="col-12 col-lg-8">
					<Card className="shadow">
						<div className="row g-0">
							{/* Album Image */}
							<div className="col-md-4">
								<div className="p-3 d-flex align-items-center justify-content-center h-100">
									<img
										src={
											music.album_img ||
											"https://raw.githubusercontent.com/omicreativedev/TunePeep/refs/heads/main/covers_2k/no_cover.png"
										}
										alt={music.title || "Album"}
										className="img-fluid"
										style={{
											objectFit: "contain",
											width: "250px",
											height: "250px",
										}}
									/>
								</div>
							</div>

							<div className="col-md-8">
								<Card.Body className="h-100 d-flex flex-column">
									<Card.Title className="mb-3">
										{music.title || "Untitled"}
									</Card.Title>

									<ListGroup variant="flush" className="mb-3">
										<ListGroup.Item className="d-flex align-items-center">
											<strong className="me-2">Music ID:</strong>
											<a
												href={`https://open.spotify.com/album/${music.music_id}`}
												target="_blank"
												rel="noopener noreferrer"
												className="text-decoration-none"
											>
												<FontAwesomeIcon
													icon={faMusic}
													className="text-success me-2"
												/>
												<code className="text-dark">
													{music.music_id || "N/A"}
												</code>
											</a>
										</ListGroup.Item>
										<ListGroup.Item>
											<strong>YouTube ID:</strong>{" "}
											<code className="text-dark">
												{music.youtube_id || "N/A"}
											</code>
										</ListGroup.Item>
										<ListGroup.Item>
											<strong>Current Rating:</strong>
											<div className="mt-2">
												{renderRankingStars(music.ranking?.ranking_value)}
											</div>
										</ListGroup.Item>
										<ListGroup.Item>
											<strong>Genres:</strong>
											<div className="mt-2">
												{music.genre?.length > 0 ? (
													<div className="d-flex flex-wrap gap-2">
														{music.genre.map((g, index) => (
															<Badge
																key={index}
																bg="dark"
																className="px-3 py-2"
															>
																{g.genre_name}
															</Badge>
														))}
													</div>
												) : (
													<span className="text-muted">No genres listed</span>
												)}
											</div>
										</ListGroup.Item>
									</ListGroup>

									<div className="mt-auto d-flex gap-2">
										<Button
											as={Link}
											to={`/stream/${music.youtube_id}`}
											variant="outline-primary"
											className="d-flex align-items-center"
										>
											<FontAwesomeIcon icon={faCirclePlay} className="me-2" />
											Listen
										</Button>
										{auth?.role === "ADMIN" && (
											<Button
												as={Link}
												to={`/edit/${music_id}`}
												variant="outline-secondary"
												className="d-flex align-items-center"
											>
												<FontAwesomeIcon icon={faEdit} className="me-2" />
												Edit Music Entry
											</Button>
										)}
									</div>
								</Card.Body>
							</div>
						</div>
					</Card>
				</div>
			</div>

			{/* Review Form Section */}
			<div className="row justify-content-center">
				<div className="col-12 col-lg-8">
					<Card className="shadow">
						<Card.Body>
							<Card.Title>Review</Card.Title>

							{auth?.role === "ADMIN" ? (
								<Form onSubmit={handleSubmit}>
									<Form.Group className="mb-3" controlId="adminReviewTextarea">
										<Form.Label></Form.Label>
										<Form.Control
											ref={revText}
											required
											as="textarea"
											rows={8}
											defaultValue={music?.admin_review || ""}
											placeholder="Write your review here..."
											style={{ resize: "vertical" }}
											disabled={submitting}
										/>
										{/* <Form.Text className="text-muted">
											Submit a new review to update the ranking.
										</Form.Text> */}
									</Form.Group>
									<div className="d-flex justify-content-between align-items-center">
										<div className="text-muted small">
											{/* Music ID: <code>{music_id}</code> */}
										</div>
										<Button
											variant="success"
											type="submit"
											size="lg"
											disabled={submitting}
										>
											{submitting ? "Updating..." : "Update Review"}
										</Button>
									</div>
								</Form>
							) : (
								<div className="text-left">
									{music.admin_review && (
										<>
											<p className="mb-0">{music.admin_review}</p>
										</>
									)}
								</div>
							)}
						</Card.Body>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Review;
