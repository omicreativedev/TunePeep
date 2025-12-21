import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Musics from "../musics/Musics";
import Spinner from "../spinner/Spinner";

/*This file gets and displays music recommendations for logged-in users. It calls a protected API endpoint to get suggested music based on the user's preferences and passes the results to a shared music display component.*/

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
		<>{loading ? <Spinner /> : <Musics musics={musics} message={message} />}</>
	);
};
export default Recommended;
