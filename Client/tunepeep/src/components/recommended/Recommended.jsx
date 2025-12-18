import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Musics from "../musics/Musics";
// import Spinner from '../spinner/Spinner';

const Recommended = () => {
	const [musics, setMusics] = useState([]);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState();
	const axiosPrivate = useAxiosPrivate();

	// call endpoint for users recommended
	useEffect(() => {
		const fetchRecommendedMusics = async () => {
			setLoading(true);
			setMessage("");

			try {
				const response = await axiosPrivate.get("/recommendedmusic");
				setMusics(response.data);
			} catch (error) {
				console.error("Error fetching recommended music:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchRecommendedMusics();
	}, []);

	return (
		<>
			{loading ? (
				//<Spinner/>
				<h2>Loading...</h2>
			) : (
				<Musics musics={musics} message={message} />
			)}
		</>
	);
};
export default Recommended;
