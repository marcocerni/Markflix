import {Router, Request, Response} from "express";
import auth from "./auth";
import user from "./user";
import sachet from "./sachet";

const routes = Router();

routes.use("/auth", auth);
routes.use("/user", user);
routes.use("/sachet", sachet);

export default routes;
