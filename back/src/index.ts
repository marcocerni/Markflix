import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";
import * as cors from "cors";
import routes from "./routes";
import config from "./config/config";

//Connects to the Database -> then starts the express

(async () => {
    try {
        const connection = await createConnection();
        // Create a new express application instance
        const app = express();

        // Call midlewares
        app.use(cors());
        app.use(helmet());
        app.use(bodyParser.json({limit: '50mb'}));
        app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 1000000}));
        // app.use(multipart());

        //Set all routes from routes folder
        app.use("/", routes);

        app.listen(config.port, () => {
            console.log(`Server started on port ${config.port}!`);
        });
    } catch (error) {
        console.log(error)
    }
})();
