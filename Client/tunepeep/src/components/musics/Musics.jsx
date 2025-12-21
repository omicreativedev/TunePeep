import Music from "../music/Music";

/* This file displays a grid of music cards by mapping through an array of music data. It outpits individual Music components (Music.jsx) for each item and shows a message when no music is available. */

const Musics = ({ musics, updateMusicReview, message }) => {
	return (
		<div className="container mt-4">
			<div className="row">
				{musics && musics.length > 0 ? (
					musics.map((music) => (
						<Music
							key={music._id}
							updateMusicReview={updateMusicReview}
							music={music}
						/>
					))
				) : (
					<h2>{message}</h2>
				)}
			</div>
		</div>
	);
};
export default Musics;
