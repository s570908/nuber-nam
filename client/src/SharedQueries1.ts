import { gql } from "apollo-boost";

export const GET_CURRENT_USER = gql`
	query GetCurrentUser {
		GetMyProfile {
			ok
			error
			user {
				id
				firstName
				lastName
				fullName
				isDriving
				email
				verifiedEmail
				lastName
				phoneNumber
				verifiedPhoneNumber
				profilePhoto
				//currentRideId
				createAt
			}
		}
	}
`;

export const UPDATE_RIDE = gql`
	mutation UpdateRideStatus($rideId: Int!, $status: StatusOptions!) {
		UpdateRideStatus(rideId: $rideId, status: $status) {
			ok
			error
		}
	}
`;

export const REQUEST_EMAIL_VERIFICATION = gql`
	mutation EmailVerification {
		RequestEmailVerification {
			ok
			error
		}
	}
`;
