import { useRecoilState } from "recoil";
import { LM_USER_INFO } from "@/store/storeUserInfo";
import { LmAxios } from "@/axios/LmAxios";
import { useNavigate } from "react-router-dom";

const HOOK_LM_USER_INFO = () => {
	const [getUserInfo, updateUserInfo] = useRecoilState(LM_USER_INFO);
	const navigate = useNavigate();

	const setUserInfo = async (data) => {
		if (data === "reset") {
			updateUserInfo();
			return false;
		}

		try {
			const res = await LmAxios({
				method: "POST",
				url: `/admin/sign/in`,
				data: data,
			});

			if (res.data.code === "0000") {
				const resData = {
					access_token: res.headers["dr-access-token"],
				};
				updateUserInfo((prev) => ({
					...prev,
					...resData,
				}));
				// 현정아 여기 좀 와봐
				// 회원등록 후 최초 로그인 시 비밀번호변경 페이지로 이동
				if (res.data.result?.needPasswordChange === "Y") {
					// 비밀번호 변경 페이지로 이동 로직 추가 해야함
					// navigate("/")
				} else {
					// navigate("/counsel");
				}

				navigate("/counsel");
			}
		} catch (err) {
			console.error(err);
		}
	};

	const login = (data) => {
		setUserInfo(data);
	};

	const logOut = () => {
		updateUserInfo({});
		navigate("/member/login");
	};

	return {
		getUserInfo,
		setUserInfo,
		login,
		logOut,
	};
};

export default HOOK_LM_USER_INFO;
