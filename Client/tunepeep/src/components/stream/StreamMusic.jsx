import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import "./StreamMusic.css";

/*This file handles music streaming by embedding YouTube videos. It takes a YouTube ID from the URL and plays the corresponding video using the ReactPlayer component with controls.*/

const StreamMusic = () => {
	let params = useParams();
	let key = params.yt_id;

	return (
		<div className="react-player-container">
			{key != null ? (
				<ReactPlayer
					controls="true"
					playing={true}
					url={`https://www.youtube.com/watch?v=${key}`}
					width="100%"
					height="100%"
				/>
			) : null}
		</div>
	);
};

export default StreamMusic;
