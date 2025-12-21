/* This file displays a loading spinner that centers itself on the page. It spins while content is loading or authentication is being verified. */

const Spinner = () => {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "60vh",
			}}
		>
			<span
				className="spinner-border"
				role="status"
				aria-hidden="true"
				style={{ width: "5rem", height: "5rem", fontSize: "2rem" }}
			></span>
		</div>
	);
};

export default Spinner;
