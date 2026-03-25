import app from "./app";

const PORT = Number(process.env.PORT || process.env.SERVER_PORT || 7000);

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
