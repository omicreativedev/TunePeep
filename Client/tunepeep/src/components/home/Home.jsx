import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosConfig";
import Musics from "../musics/Musics";
import Spinner from "../spinner/Spinner";

const Home = ({ updateMusicReview }) => {
	const [musics, setMusics] = useState([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState();

	useEffect(() => {
		const fetchMusics = async () => {
			setLoading(true);
			setMessage("");
			try {
				const response = await axiosClient.get("/musics");
				setMusics(response.data);
				if (response.data.length === 0) {
					setMessage("There are currently no albums available");
				}
			} catch (error) {
				console.error("Error fetching albums:", error);
				setMessage("Error fetching albums");
			} finally {
				setLoading(false);
			}
		};
		fetchMusics();
	}, []);

	return (
		<>
			{loading ? (
				<Spinner />
			) : (
				<Musics
					musics={musics}
					updateMusicReview={updateMusicReview}
					message={message}
				/>
			)}
		</>
	);
};

export default Home;
