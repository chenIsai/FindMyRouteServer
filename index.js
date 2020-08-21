const express = require("express");
const userRouter = require("./app/routes/userRouter");
const savedRoutesRouter = require("./app/routes/savedRoutesRouter");
const PORT = process.env.PORT || 5000;

const app = express();
app.use('/api/users', userRouter);
app.use('/api/routes', savedRoutesRouter);

app.listen(PORT);
