import express from 'express';
import cors from 'cors';
import loginRoute from './routes/loginRoute.js';
import audioRoute from './routes/audioRoute.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/login", loginRoute);
app.use("/audio", audioRoute);

app.get("/", (req, res) => {
    res.json("Response from the server");
});

app.listen(PORT, () => {
     console.log(`Server connected on port ${PORT}`);
});
