import { faCirclePlay } from "@fortawesome/free-solid-svg-icons/faCirclePlay";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import "./Music.css";

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
						<p className="card-text mb-2">{music.music_id}</p>
					</div>
					{music.ranking?.ranking_name && (
						<span
							className="badge bg-success m-3 p-2"
							style={{ fontSize: "1rem" }}
						>
							{music.ranking.ranking_name}
						</span>
					)}
					{updateMusicReview && (
						<Button
							variant="outline-success"
							onClick={(e) => {
								e.preventDefault();
								updateMusicReview(music.music_id);
							}}
							className="m-3"
						>
							Review
						</Button>
					)}
				</div>
			</Link>
		</div>
	);
};
export default Music;
