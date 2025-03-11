import { useEffect, useRef, useState } from "react";
import SampleSitemap from "@/axios/mockup/sitemap.json";
import { LmNavButton } from "@/components/LmButton";
import { useLocation } from "react-router-dom";
import HOOK_LM_USER_INFO from "@/store/hooks/hookUserInfo";
import iconLogoSymbol from "@/assets/img/logo/logo_symbol.png";
import { useRecoilState } from "recoil";
import { LM_USER_INFO } from "@/store/storeUserInfo";
// 헤더
export const LayoutHeader = () => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const location = useLocation();
	const [sitemap, setSitemap] = useState([]);
	const [childrenShow, setChildrenShow] = useState([]);
	const [smallHeader, setSmallHeader] = useState(false); // header 크기 줄이고 키우기
	const subNavRefs = useRef([]);
	const { logOut } = HOOK_LM_USER_INFO();
	const [getUserInfo] = useRecoilState(LM_USER_INFO);
	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	const getSitemap = () => {
		setSitemap(SampleSitemap);
		let showChild = new Array(SampleSitemap.length).fill(false);
		setChildrenShow(showChild);
	};

	const toggleShow = (index) => {
		if (!smallHeader) {
			setChildrenShow((prevData) => {
				const newData = [...prevData];
				newData[index] = !newData[index];
				return newData;
			});
		} else {
			navigate(sitemap[index].link);
		}
	};

	// 헤더 토글
	const toggleHeader = () => {
		setSmallHeader((prev) => !prev);
		navSubSet();
	};

	const navSubSet = () => {
		const initialShowNav = sitemap.map((navItem) => {
			return navItem.link === "/" ? navItem.link === location.pathname : location.pathname.includes(navItem.link);
		});
		setChildrenShow(initialShowNav);
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------

	useEffect(() => {
		navSubSet();
	}, [location.pathname]);

	useEffect(() => {
		getSitemap();
	}, []);

	useEffect(() => {
		subNavRefs.current.forEach((ref, index) => {
			if (ref) {
				ref.style.maxHeight = childrenShow[index] ? `${ref.scrollHeight}px` : "0px";
			}
		});
	}, [childrenShow]);

	return (
		<div className={`lmHeader ${smallHeader ? "small" : ""}`}>
			<button className={`toggle-bt ${smallHeader ? "small" : ""}`} onClick={() => toggleHeader()}>
				<span></span>
			</button>
			<div className="lmHeader-inner">
				<div className="lm-inner top">
					<div className="profile-box">
						<img src={iconLogoSymbol} alt="닥터포헤어 로고" />
					</div>
					{/* TODO - 로그인시 회원의 정보 가져옴 (아직 백엔드 개발 안됨)*/}
					<div className="info">
						<div>테스트</div>
						<div>테스트1</div>
					</div>

					<button
						className="logout-btn "
						onClick={() => {
							logOut();
						}}
					>
						<div className="lm-icon-logout size-20"></div>
					</button>
				</div>
				<div className="lm-inner nav">
					<ul>
						{sitemap.map((navItem, index) => {
							if (false) {
								return <></>;
							} else {
								return (
									<li key={index} className="depth-1">
										{!smallHeader && (
											<LmNavButton
												to={navItem.link}
												lmClass={`${navItem.icon} ${childrenShow[index] ? "show" : ""}`}
												lmEvent={navItem.children?.length > 0 ? () => toggleShow(index) : false}
												lmParents={navItem?.children?.length > 0}
											>
												<div>
													<span>{navItem.title}</span>
												</div>
											</LmNavButton>
										)}

										{smallHeader &&
											(navItem.link === "/counsel" || navItem.link === "/consultant" ? (
												<LmNavButton
													to={navItem.link}
													lmClass={`${navItem.icon} ${childrenShow[index] ? "active" : ""}`}
													lmParents={true}
												>
													<div>
														<span>{navItem.title}</span>
													</div>
												</LmNavButton>
											) : (
												<LmNavButton
													lmClass={`${navItem.icon} ${childrenShow[index] ? "active" : ""}`}
												>
													<div>
														<span>{navItem.title}</span>
													</div>
												</LmNavButton>
											))}

										{!smallHeader && navItem?.children && navItem?.children?.length !== 0 && (
											<div className={`sub-nav`} ref={(el) => (subNavRefs.current[index] = el)}>
												<div className="sub-nav-inner">
													{navItem?.children?.map((subNavItem, subIndex) => {
														// if (
														// 	!subNavItem.role.includes(
														// 		getUserInfo.role
														// 	)
														// ) {
														// 	return <></>;
														// } else {
														return (
															<LmNavButton
																key={subIndex}
																to={subNavItem.link}
																// lmClass={`${subNavItem.class}`}
															>
																<span>{subNavItem.title}</span>
															</LmNavButton>
														);
														// }
													})}
												</div>
											</div>
										)}
										{smallHeader && navItem?.children && navItem?.children?.length !== 0 && (
											<div className={`sub-nav-position`}>
												<div className="sub-nav-inner">
													{navItem?.children?.map((subNavItem, subIndex) => {
														// if (
														// 	!subNavItem.role.includes(
														// 		getUserInfo.role
														// 	)
														// ) {
														// 	return <></>;
														// } else {
														return (
															<LmNavButton
																key={subIndex}
																to={subNavItem.link}
																// lmClass={`${subNavItem.class}`}
															>
																<span>{subNavItem.title}</span>
															</LmNavButton>
														);
														// }
													})}
												</div>
											</div>
										)}
									</li>
								);
							}
						})}
					</ul>
				</div>
			</div>
		</div>
	);
};
