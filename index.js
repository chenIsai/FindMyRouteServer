const express = require("express");
const router = require("./app/routes/userRouter");

const app = express();
app.use('/api', router);

app.listen(3000);
