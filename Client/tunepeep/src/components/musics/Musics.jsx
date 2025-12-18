import Music from "../music/Music";

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
