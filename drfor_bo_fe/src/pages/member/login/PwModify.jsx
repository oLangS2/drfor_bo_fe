import { Link, useNavigate } from "react-router-dom";
import { getFilter } from "@/utils/getFilter";
import { useEffect, useState } from "react";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import HOOK_LM_USER_INFO from "@/store/hooks/hookUserInfo";
import { LmAxios } from "@/axios/LmAxios";
import { isCheckPw } from "@/utils/validationUtils";

export const PwModify = () => {
	const { setLmPop } = HOOK_LM_POP();
	const { logOut } = HOOK_LM_USER_INFO();
	const navigate = useNavigate();
	const [inputValues, setInputValues] = useState({
		password: "",
		newPassword: "",
		newPasswordCheck: "",
	});
	// 비밀번호 안내 메세지 상태 설정
	const [compareMessages, setCompareMessages] = useState({
		newPassword: "",
		newPasswordCheck: "",
	});

	// input Change 이벤트
	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setInputValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 비밀번호 유효성 체크
	const checkPassword = (newPassword) => {
		if (newPassword !== "") {
			return isCheckPw(newPassword);
		} else {
			return true;
		}
	};

	// 새 비밀번호 유효성 검사
	useEffect(() => {
		const { newPassword, newPasswordCheck } = inputValues;

		const messages = { newPassword: "", newPasswordCheck: "" };

		if (newPassword.trim() === "") {
			messages.newPassword = ""; // 새 비밀번호가 비어 있을 경우 초기화
		} else if (!checkPassword(newPassword)) {
			messages.newPassword = "비밀번호 규칙을 확인해주시기 바랍니다.";
		}

		if (newPasswordCheck.trim() === "") {
			messages.newPasswordCheck = ""; // 확인 비밀번호가 비어 있을 경우 초기화
		} else if (newPassword !== newPasswordCheck) {
			messages.newPasswordCheck = "비밀번호가 일치하지 않습니다.";
		}

		setCompareMessages(messages);
	}, [inputValues.newPassword, inputValues.newPasswordCheck]);

	// input 빈값 체크하여 팝업창 안내 및 비밀번호 변경 api 호출
	const handleModifyPw = async () => {
		if (!inputValues.password || !inputValues.newPassword || !inputValues.newPasswordCheck) {
			setLmPop({
				show: true,
				type: "alert",
				contents: "필수 항목을 입력해주세요.",
			});
			return;
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: "비밀번호를 변경하시겠습니까?",
			success_fun: async () => {
				await LmAxios({
					method: "patch",
					url: "/admin/consultant/change/password",
					data: {
						currentPassword: inputValues.password.trim(),
						newPassword: inputValues.newPassword.trim(),
						confirmPassword: inputValues.newPasswordCheck.trim(),
					},
				})
					.then((res) => {
						if (res.data.code === "0000") {
							setLmPop({
								show: true,
								type: "alert",
								contents: "비밀번호가 변경되었습니다. <br/> 다시 로그인 해주세요.",
								success_fun: (hidepop) => {
									hidepop();
									logOut(); // 로그아웃 처리
									navigate("/member/login");
								},
							});
						} else {
							setLmPop({
								show: true,
								type: "alert",
								contents: "입력하신 정보를 다시 확인해 주시기 바랍니다.",
							});
						}
					})
					.catch((error) => {
						console.error("비밀번호 변경 API 호출 실패:", error);
					});
			},
		});
	};

	// 변경 완료 시 로그인 페이지 안내 팝업창 생성
	return (
		<div className="lmWrap">
			<div className="login-wrap lm-card padding-6">
				<div className="flex-box form-box">
					<div className="intro-box">
						<h3 className="lm-text h3 lm-text-center">비밀번호 변경</h3>
					</div>
					<div className="lm-flex-col gap-24">
						{/* 현재 비밀번호 */}
						<div className="lm-flex-col gap-6">
							<label htmlFor="password" className="lm-required lm-text title3">
								현재 비밀번호
							</label>
							<input
								type="password"
								id="password"
								className="lm-input"
								name="password"
								value={inputValues.password}
								onChange={handleInputChange}
							/>
						</div>

						{/* 새 비밀번호 */}
						<div className="lm-flex-col gap-6">
							<label htmlFor="newPassword" className="lm-required lm-text title3">
								새 비밀번호
							</label>
							<input
								type="password"
								id="newPassword"
								className="lm-input"
								name="newPassword"
								value={inputValues.newPassword}
								onChange={handleInputChange}
							/>
							<p className="lm-text body4 lm-gray-2 ">
								영문 소문자, 숫자, 특수기호를 2종 이상 조합하여, 8~16자
							</p>
							<span>
								{compareMessages.newPassword && (
									<span className="error-box">{compareMessages.newPassword}</span>
								)}
							</span>
						</div>

						{/* 새 비밀번호 확인 */}
						<div className="lm-flex-col gap-6">
							<label htmlFor="newPasswordCheck" className="lm-required lm-text title3">
								새 비밀번호 확인
							</label>
							<input
								type="password"
								id="newPasswordCheck"
								className="lm-input"
								name="newPasswordCheck"
								value={inputValues.newPasswordCheck}
								onChange={handleInputChange}
							/>
							<span>
								<span>
									{compareMessages.newPasswordCheck && (
										<span className="error-box">{compareMessages.newPasswordCheck}</span>
									)}
								</span>
							</span>
						</div>

						{/* 버튼 */}
						<div className="lm-button-wrap lm-form-box lm-flex justify-center">
							<Link to={"/member/login"}>
								<button className="lm-button line line-gray-4 text-main-color1">취소</button>
							</Link>
							<button className="lm-button color-1" onClick={handleModifyPw}>
								비밀번호 변경
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
