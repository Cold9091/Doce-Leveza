import type { SessionOptions, IronSession, IronSessionData } from "iron-session";
import "express";

export const sessionOptions: SessionOptions = {
    password: process.env.SESSION_PASSWORD || "complex_password_at_least_32_characters_long_and_secure",
    cookieName: "doce_leveza_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict",
    },
};

declare module "iron-session" {
    interface IronSessionData {
        userId?: number;
        adminId?: number;
    }
}

declare module "express-serve-static-core" {
    interface Request {
        session: IronSession<IronSessionData>;
    }
}
