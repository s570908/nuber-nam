import passport from "passport";
import { Strategy as FaceBookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../entities/User";
import { createJWT } from "./JWT";
import dotenv from "dotenv";
dotenv.config();

passport.use(
	new FaceBookStrategy(
		{
			clientID: process.env.FACEBOOK_ID || "",
			clientSecret: process.env.FACEBOOK_SECRET || "",
			callbackURL: "/api/auth/facebook/callback",
			profileFields: ["id", "displayName", "photos", "email"]
		},
		async (_: any, __: any, profile: { id: any; displayName: any; photos: any; }, done: (arg0: null, arg1: User, arg2: string) => any) => {
			const existedUser = await User.findOne({ fbId: profile.id });
			if (existedUser) {
				const token = await createJWT(existedUser.id);
				return done(null, existedUser, token);
			}
			const newUser = await User.create({
				fbId: profile.id,
				firstName: profile.displayName,
				profilePhoto: profile.photos![0].value
			}).save();
			const token = await createJWT(newUser.id);
			return done(null, newUser, token);
		}
	)
);

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			callbackURL: "/api/auth/google/callback",
			scope: ["profile", "email"]
		},
		async (_: any, __: any, profile: { id: any; name: any; photos: any; emails: any; }, cb: (arg0: undefined, arg1: User, arg2: string) => any) => {
            console.log("GoogleStrategy entered. profile", profile);
            const existedUser = await User.findOne({ googleId: profile.id });
			if (existedUser) {
				const token = await createJWT(existedUser.id);
				return cb(undefined, existedUser, token);
			}
			const newUser = await User.create({
				googleId: profile.id,
				firstName: profile.name!.givenName,
				lastName: profile.name!.familyName,
				profilePhoto: profile.photos![0].value,
				email: profile.emails![0].value,
				verifiedEmail: true
			}).save();
			const token = await createJWT(newUser.id);
			return cb(undefined, newUser, token);
		}
	)
);

export default passport;
