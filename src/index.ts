import express from "express";
import morgan from "morgan"
import cors from "cors"
import compression from "compression"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import routes from "./routes";
import { GlobalError } from "../types/errorTypes";

import fs from "fs";
import path from "path";

// production
// const accessLogStream = fs.createWriteStream(
//   path.join(__dirname, "access.log"),
//   { flags: "a" }
// );

// app.use(morgan("combined", { stream: accessLogStream }));

const app = express()

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors(
    {
        origin: 'https://workscout-ui.vercel.app',
        // origin: 'http://localhost:3000',
        credentials: true, // if you're using cookies
}
));
app.use(compression());
app.use(cookieParser());
app.use(morgan('dev'))


// routes

app.use('/api/v1', routes)



// // catch all routes that are not specified in the routes folder
// app.all("*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     // create an error object
//     const error: GlobalError = new Error(`cant find ${req.originalUrl} on the server`)
//     error.status = "fail"
//     error.statusCode = 404

//     return next(error)
// })




app.listen(8000, () => {
    console.log(`Server is running on port 8000`)
})




