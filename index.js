const express = require("express");
const router = require("./app/routes/userRouter");
const PORT = process.env.PORT || 5000;

const app = express();
app.use('/api', router);

app.listen(PORT);
