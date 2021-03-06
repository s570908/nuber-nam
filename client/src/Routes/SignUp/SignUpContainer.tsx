import { useMutation } from "@apollo/react-hooks";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { REQUEST_EMAIL_VERIFICATION } from "../../SharedQueries";
import { USER_LOG_IN } from "../../SharedQueries.local";
import { EmailSignUp, EmailSignUpVariables } from "../../types/api";
import { forceHistory } from "../../utils/forceHistory";
import { useInput } from "../../utils/hooks";
import Routes from "../routes";
import SignUpPresenter from "./SignUpPresenter";
import { EMAIL_SIGN_UP } from "./SignUpQueries";

interface IProps extends RouteComponentProps<
    any,
    any,
    { phoneNumber?: string}
> { }


const SignUpContainer: React.FC<IProps> = ({ history, location }) => {
    if (!location.state || !location.state.phoneNumber) {
        history.push(Routes.HOME);
    }

    const [firstName, setFirstName] = useInput("");
    const [lastName, setLastName] = useInput("");
    const [email, setEmail] = useInput("");
    const [password, setPassword] = useInput("");
    const [passwordConfirm, setPasswordConfirm] = useInput("");
    
    const phoneNumber=location.state.phoneNumber!;

    const [userLogInMutation] = useMutation(USER_LOG_IN);
    const [signUpMutation, { loading }] = useMutation<
        EmailSignUp,
        EmailSignUpVariables
    >(EMAIL_SIGN_UP, {
        onCompleted: async ({ EmailSignUp: { res, error, token } }) => {
            if (res) {
                if (token) {
                    toast.success(`Welcome ${firstName}`);
                    await userLogInMutation({ variables: { token } });
                    await requestEmailVerifyMutation();
                    forceHistory.push(Routes.NUBER);
                    // send mail
                } else {
                    toast.error("something went wrong!");
                }
            } else {
                toast.error(error);
            }
        },
        variables: {
            email,
            firstName,
            lastName,
            password,
            phoneNumber
        }
    });

    const [requestEmailVerifyMutation] = useMutation(
        REQUEST_EMAIL_VERIFICATION
    );
    const submitFn = () => {
        if (password !== passwordConfirm) {
            toast.error("You typed different password, please check again");
            return;
        }
        signUpMutation();
    };

    return (
        <SignUpPresenter
            submitFn={submitFn}
            loading={loading}
            firstName={{
                label: "First Name",
                onChange: setFirstName,
                value: firstName
            }}
            lastName={{
                label: "Last Name",
                onChange: setLastName,
                value: lastName
            }}
            email={{
                label: "Email address",
                onChange: setEmail,
                value: email
            }}
            password={{
                label: "Password",
                onChange: setPassword,
                type: "password",
                value: password
            }}
            passwordConfirm={{
                label: "Password Confirmation",
                onChange: setPasswordConfirm,
                type: "password",
                value: passwordConfirm
            }}
        />
    );
};

export default SignUpContainer;
