//import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();

import Twilio from "twilio";

const twilioClient = Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

export const sendVerificationSMS = (to: string, key: string) => {
	sendSMS(to, `Your verification code is : ${key}`);
};

export const sendSMS = (to: string, body: string) => {
	return twilioClient.messages.create({
		body,
		to,
		from: process.env.TWILIO_PHONE
	});
};
