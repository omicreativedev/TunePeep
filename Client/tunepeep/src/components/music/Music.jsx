import { faStar as faStarEmpty } from "@fortawesome/free-regular-svg-icons/faStar"; // ADDED
import { faCirclePlay } from "@fortawesome/free-solid-svg-icons/faCirclePlay";
import { faStar } from "@fortawesome/free-solid-svg-icons/faStar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import "./Music.css";

/* This file creates an individual music card that displays album art, title, and star ratings. It includes a play button overlay and an information button that goes to the  review page when clicked. */

// Helper function to render stars based on ranking
const renderRankingStars = (rankingValue) => {
	if (rankingValue === 999) {
		return <span className="text-muted">Not Yet Rated</span>;
	}

	// Map ranking values to number of stars
	const starCount = 6 - rankingValue;

	return (
		<div className="star-rating">
			{[...Array(5)].map((_, index) => (
				<FontAwesomeIcon
					key={index}
					icon={index < starCount ? faStar : faStarEmpty}
					className={index < starCount ? "text-warning" : "text-secondary"}
					style={{ marginRight: "2px" }}
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

const Music = ({ music, updateMusicReview }) => {
	return (
		<div className="col-md-4 mb-4" key={music._id}>
			<Link
				to={`/stream/${music.youtube_id}`}
				style={{ textDecoration: "none", color: "inherit" }}
			>
				<div className="card h-100 shadow-sm music-card">
					<div style={{ position: "relative" }}>
						<img
							src={music.album_img}
							alt={music.title}
							className="card-img-top"
							style={{
								objectFit: "contain",
								height: "250px",
								width: "100%",
							}}
						/>
						<span className="play-icon-overlay">
							<FontAwesomeIcon icon={faCirclePlay} />
						</span>
					</div>
					<div className="card-body d-flex flex-column">
						<h5 className="card-title">{music.title}</h5>
						{/* <p className="card-text mb-2">{music.music_id}</p> */}
					</div>

					{/* {music.ranking?.ranking_name && (
						<span
							className="badge bg-success m-3 p-2"
							style={{ fontSize: "1rem" }}
						>
							{music.ranking.ranking_name}
						</span>
					)} */}

					{/* Replace the badge with star rating */}
					<div className="m-3 p-2">
						{music.ranking?.ranking_value ? (
							renderRankingStars(music.ranking.ranking_value)
						) : (
							<span className="text-muted">No Rating</span>
						)}
					</div>

					{updateMusicReview && (
						<Button
							variant="outline-success"
							onClick={(e) => {
								e.preventDefault();
								updateMusicReview(music.music_id);
							}}
							className="m-3"
						>
							Information
						</Button>
					)}
				</div>
			</Link>
		</div>
	);
};
export default Music;
