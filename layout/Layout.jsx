import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { LayoutHeader } from "@/layout/Header";
import { LayoutAside } from "@/layout/Aside";
import { useEffect } from "react";

export const Layout = () => {
	let asideShow = false;

	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		if (location.pathname === "/") {
			navigate("/counsel", { replace: true });
		}
	}, [location.pathname]);

	return (
		<>
			<Helmet>
				<title>닥터포헤어 BO</title>
			</Helmet>
			<div className="lmWrap">
				<LayoutHeader />
				<div className="lmContents">
					<Outlet />
				</div>
				{asideShow && <LayoutAside />}
			</div>
		</>
	);
};
