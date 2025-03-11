import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LmAxios } from "@/axios/LmAxios";

import HOOK_LM_LODING from "@/store/hooks/hookLoding";

import LmLoding from "@/components/LmLoding";
import LmPop from "@/components/LmPop";
import LmToastPop from "@/components/LmToastPop";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import HOOK_LM_USER_INFO from "@/store/hooks/hookUserInfo";

const LmCommon = () => {
	const location = useLocation();
	const { getLmLoding, setLmLoding } = HOOK_LM_LODING();
	const { setLmPop } = HOOK_LM_POP();
	const { getUserInfo, logOut } = HOOK_LM_USER_INFO();

	useEffect(() => {
		// Axios 인터셉터로 상태 업데이트
		const requestInterceptor = LmAxios.interceptors.request.use(
			(config) => {
				setLmLoding({ show: true });
				// 헤더에 Authorization 토큰 추가
				if (getUserInfo?.access_token) {
					const access_token = `Bearer ${getUserInfo.access_token}`;
					config.headers.Authorization = access_token;
				}
				return config;
			},
			(error) => {
				setLmLoding({ show: false });

				setLmPop({
					show: true,
					type: "alert",
					title: null,
					success_fun: null,
					success_title: "확인",
					contents: "동일한 오류가 발생하는 경우 관리자에게 문의해주세요.",
				});

				return Promise.reject(error);
			}
		);

		const responseInterceptor = LmAxios.interceptors.response.use(
			(response) => {
				setLmLoding({ show: false });

				let logOutCode = "9301";
				if (
					response.data.code === logOutCode ||
					response.data.code === "9304" // 토큰만료
				) {
					logOut(); // 로그아웃 처리
					return response;
				}

				if (response.data.code !== "0000") {
					setLmPop({
						show: true,
						type: "alert",
						title: null,
						success_title: "확인",
						contents:
							response.data.message ||
							"동일한 오류가 발생하는 경우 관리자에게 문의해주세요.",
						success_fun: null,
					});
				}
				return response;
			},
			(error) => {
				setLmLoding({ show: false });

				setLmPop({
					show: true,
					type: "alert",
					title: null,
					success_fun: null,
					success_title: "확인",
					contents: "동일한 오류가 발생하는 경우 관리자에게 문의해주세요.",
				});
				return Promise.reject(error);
			}
		);

		// 컴포넌트 언마운트 시 인터셉터 제거
		return () => {
			LmAxios.interceptors.request.eject(requestInterceptor);
			LmAxios.interceptors.response.eject(responseInterceptor);
		};
	}, [getLmLoding.show, location]);

	return (
		<>
			<LmToastPop />
			<LmPop />
			<LmLoding />
		</>
	);
};

export default LmCommon;
