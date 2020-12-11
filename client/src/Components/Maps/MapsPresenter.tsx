import React from "react";
import * as S from "./MapsStyle";

interface IProps {
	mapRef: any;
	isHome: boolean;
}

const MapsPresenter: React.FC<IProps> = ({ mapRef, isHome }) => {
    console.log("MapsPresenter entered. mapRef, isHome:  ", mapRef, isHome);
	return <S.Map id={"googleMap"} ref={mapRef} isHome={isHome} />;
};

export default MapsPresenter;
