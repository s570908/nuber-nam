import { gql } from "apollo-boost";

export const REPORT_MOVEMENT = gql`
	mutation ReportMovement($lastLat: Float!, $lastLng: Float!) {
		ReportMovement(lastLat: $lastLat, lastLng: $lastLng) {
			ok
			error
		}
	}
`;
