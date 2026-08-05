import express from "express";
import fs from "fs";
import path from "path";
const PORT=3000
const app = express();
app.use(express.static("."));
app.use("/icons", express.static("../../fileicons"));

app.get("/api/icons", (req, res) => {
    const files = fs
        .readdirSync("../../fileicons")
        .filter(file => file.endsWith(".svg"));

    res.json(files);
});

app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`)
});