import { useMutation } from "@apollo/react-hooks";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { USER_LOG_IN } from "../../SharedQueries.local";
import {
	ValidatePhoneVerification,
	ValidatePhoneVerificationVariables
} from "../../types/api";
import { forceHistory } from "../../utils/forceHistory";
import { useInput } from "../../utils/hooks";
import Routes from "../routes";
import VerifyPhonePresenter from "./VerifyPhonePresenter";
import { VALIDATE_PHONE_VERIFICATION } from "./VerifyPhoneQueries";

interface IProps extends RouteComponentProps<
    any,
    any,
    { phoneNumber?: string}
> { }

const VerifyPhoneContainer: React.FC<IProps> = ({ history, location }) => {
	if (!location.state || !location.state.phoneNumber) {
		history.push(Routes.PHONE_LOGIN);
	}
    
    const phoneNumber=location.state.phoneNumber!;

	const [code, setCode] = useInput("");

	const [userLogInMutation] = useMutation(USER_LOG_IN);
	const [validateMutation, { loading }] = useMutation<
		ValidatePhoneVerification,
		ValidatePhoneVerificationVariables
	>(VALIDATE_PHONE_VERIFICATION, {
		onCompleted: ({ ValidatePhoneVerification: { res, error, token } }) => {
			if (res) {
				if (token) {
					toast.success("verified");
					userLogInMutation({ variables: { token } });
					forceHistory.push(Routes.NUBER);
				} else {
					toast.success("verified, but should sign up first");
					history.push({
						pathname: Routes.SIGN_UP,
						state: { phoneNumber }
					});
				}
			} else {
				toast.error(error);
			}
		},
		variables: {
			key: code,
			phoneNumber
		}
	});

	return (
		<VerifyPhonePresenter
			value={code}
			onChange={setCode}
			submitFn={validateMutation}
			loading={loading}
		/>
	);
};

export default VerifyPhoneContainer;
