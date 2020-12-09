import { useMutation, useQuery } from "@apollo/react-hooks";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { toast } from "react-toastify";
import { GET_CURRENT_USER } from "../../SharedQueries";
import {
    GetCurrentUser,
    ReportMovement,
    ReportMovementVariables
} from "../../types/api";
import { generateMarker, ICoords } from "../../utils/mapHelpers";
import Routes from "../routes";
import HomePresenter from "./HomePresenter";
import { REPORT_MOVEMENT } from "./HomeQueries";

interface IProps extends RouteComponentProps { }

const HomeContainer: React.FC<IProps> = ({ history }) => {

    const [map, setMap] = useState<google.maps.Map>();
    const [userMarker, setUserMarker] = useState<google.maps.Marker>();
    const [userCoords, setUserCoords] = useState<ICoords>({ lat: 0, lng: 0 });

    console.log("HomeContainer routed into. [states] map, userMarker, userCoors ");

    const { data: userData } = useQuery<GetCurrentUser>(GET_CURRENT_USER, {
        fetchPolicy: "cache-and-network",
        onCompleted: ({ GetCurrentUser }) => {
            console.log("useQuery<GetCurrentUser> onCompleted entered.");

            const { res, user } = GetCurrentUser;
            if (res && user) {
                if (!user.verifiedEmail) {
                    const min = Math.floor(minAfterSignUp(user.createAt));
                    if (min > 60) {
                        history.push(Routes.EMAIL_VERIFY);
                        toast.error("Verify Your Email first");
                    } else {
                        toast.error(
                            `after ${60 -
                            min}minuets, unable to use service without email verification`
                        );
                    }
                }
                if (user.currentRideId) {
                    history.push(Routes.RIDE + `${user.currentRideId}`);
                }
            }
            console.log("useQuery<GetCurrentUser> onCompleted ended.");
        }
    });

    const [reportMovementMutation] = useMutation<
        ReportMovement,
        ReportMovementVariables
    >(REPORT_MOVEMENT, {
        onCompleted: ({ ReportMovement: { res, error } }) => {
            console.log("useMutation<ReportMovement, ReportMovementVariables> onCompleted entered.");

            if (!res) {
                toast.error(error);
            }
        },
        variables: {
            lastLat: userCoords.lat,
            lastLng: userCoords.lng
        }
    });

    useEffect(() => {
        if (map) {
            console.log("useEffect entered. marker made at center of map.");

            const { lat: getLat, lng: getLng } = map.getCenter();
            const marker = generateMarker(
                map,
                { lat: getLat(), lng: getLng() },
                {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 5
                }
            );
            if (marker) {
                setUserMarker(marker);
            }
        }
    }, [map]);

    useEffect(() => {
        if (userMarker && map) {
            console.log("useEffect entered. navigator.geolocation.watchPosition.");

            const watchId = navigator.geolocation.watchPosition(
                position => {
                    const {
                        coords: { latitude: lat, longitude: lng }
                    } = position;
                    userMarker.setPosition({ lat, lng });
                    setUserCoords({ lat, lng });
                    reportMovementMutation();
                },
                () => {
                    toast.error("Cannot track your location");
                },
                { enableHighAccuracy: true }
            );
            return () => {
                navigator.geolocation.clearWatch(watchId);
            };
        }
    }, [map, userMarker, setUserCoords, reportMovementMutation]);

    const minAfterSignUp = (createAt: string): number => {
        const current = new Date();
        const createdAt = new Date(parseInt(createAt, 10));
        const diff = current.getTime() - createdAt.getTime();
        const secDiff = diff / 1000;
        const minDiff = secDiff / 60;
        console.log(`after sign up past ${minDiff} minutes`);
        return minDiff;
    };

    console.log("HomeContainer set [states] map, userMarker, userCoors: ", map, userMarker, userCoords);

    return (
        <HomePresenter
            map={map}
            userMarker={userMarker}
            userCoords={userCoords}
            userData={userData}
            setMap={setMap}
        />
    );
};

export default HomeContainer;
