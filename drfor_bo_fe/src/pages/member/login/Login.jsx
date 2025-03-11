import { useEffect, useState } from "react";
import HOOK_LM_USER_INFO from "@/store/hooks/hookUserInfo";
import { useNavigate } from "react-router-dom";
import { handleKeyDown } from "@/common/handleKeyDown";
import iconLogo from "@/assets/img/logo/logo.png";
// 로그인
export const Login = () => {
	const { setUserInfo, login } = HOOK_LM_USER_INFO();
	const [inputValues, setInputValues] = useState({
		id: "",
		password: "",
	});
	const navigate = useNavigate();

	// input Change 이벤트
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setInputValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 로그인 버튼 클릭 이벤트
	const handleLoginBtnClick = () => {
		login({
			id: inputValues.id,
			password: inputValues.password,
		});
	};

	useEffect(() => {
		setUserInfo("reset");
	}, []);

	const moveToFindAccount = () => {
		navigate("/member/find-account");
	};

	return (
		<div className="lmWrap">
			<div className="login-wrap lm-card padding-6">
				<div className="flex-box">
					<div className="intro-box">
						<div className="logo">
							<img src={iconLogo} alt="닥터포헤어 로고" />
						</div>
					</div>
					<div className="form-box">
						<div className="lm-input-wrap">
							<input
								type="text"
								placeholder="아이디를 입력해주세요."
								className="lm-input"
								name="id"
								value={inputValues.id}
								onChange={handleInputChange}
								onKeyDown={(e) => handleKeyDown(e, handleLoginBtnClick)} // 콜백 전달
							/>
						</div>

						<div className="lm-input-wrap">
							<input
								type="password"
								placeholder="비밀번호를 입력해주세요."
								className="lm-input"
								name="password"
								value={inputValues.password}
								onChange={handleInputChange}
								onKeyDown={(e) => handleKeyDown(e, handleLoginBtnClick)} // 콜백 전달
							/>
						</div>
						<button className="lm-button color-1" onClick={handleLoginBtnClick}>
							로그인
						</button>
						<button className="lm-button color-black line" onClick={moveToFindAccount}>
							계정찾기
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
