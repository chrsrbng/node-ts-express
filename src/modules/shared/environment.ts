import dotenv from "dotenv";

dotenv.config();

export const APP_VERSION = process.env.npm_package_version || "";

export const NODE_ENV = process.env.NODE_ENV || "development";
export const APP = process.env.APP || "development";
export const PORT = process.env.PORT || 3000;
