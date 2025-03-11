import { BaseResponse } from "@/utils/BaseResponse";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LmAxios } from "@/axios/LmAxios";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { textUtils } from "@/utils/textUtils";

// 계정찾기
export const FindAccount = () => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const [phoneNumber, setPhoneNumber] = useState({
		phoneNumber0: "010",
		phoneNumber1: "",
		phoneNumber2: "",
	});
	const [inputValues, setInputValues] = useState({
		memberName: "",
		memberPhone: "",
	});
	const navigate = useNavigate();
	const { setLmPop } = HOOK_LM_POP();

	// ---------------------------------------------------------------
	// API
	// ---------------------------------------------------------------
	// 계정찾기 - 인증번호 전송 API 호출
	const apiGetSignFind = async () => {
		try {
			const res = await LmAxios({
				method: "GET",
				url: "/admin/sign/find",
				params: inputValues,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				console.log(res.data);
				setLmPop({
					show: true,
					type: "alert",
					contents: "아이디와 임시비밀번호가 전송되었습니다.",
					success_fun: (hidepop) => {
						hidepop();
						navigate("/member/login");
					},
				});
			}
		} catch (error) {
			console.error("계정찾기 - 인증번호 전송 API 호출 실패:", error);
			setLmPop({
				show: true,
				type: "alert",
				contents: "일치하는 정보가 없습니다.",
				success_fun: (hidepop) => {
					hidepop();
				},
			});
		}
	};
	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------
	// input Change 이벤트
	const handleInputChange = (e) => {
		const { name, value, type } = e.target;

		if (type === "radio" && name === "status") {
			// 라디오 버튼 값 업데이트
			setInputValues({
				...inputValues,
				[name]: value,
			});
		} else if (name === "phoneNumber1" || name === "phoneNumber2") {
			// 숫자만 입력 받기
			const numericValue = textUtils(value, ["num"]);

			// 4자리 이상 입력 방지
			if (numericValue.length > 4) return;

			// phoneNumber를 업데이트
			setPhoneNumber((prevPhone) => ({
				...prevPhone,
				[name]: numericValue,
			}));
		} else if (name === "phoneNumber0") {
			// 전화번호 첫 번째 자리 (010, 011 등)
			setPhoneNumber((prevPhone) => ({
				...prevPhone,
				[name]: value,
			}));
		} else {
			// 일반 입력 필드 업데이트
			setInputValues({
				...inputValues,
				[name]: value,
			});
		}
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------

	// 전화번호가 변경될 때마다 memberPhone을 업데이트
	useEffect(() => {
		setInputValues((prevValues) => ({
			...prevValues,
			memberPhone: phoneNumber.phoneNumber0 + phoneNumber.phoneNumber1 + phoneNumber.phoneNumber2,
		}));
	}, [phoneNumber]); // phoneNumber가 변경될 때마다 실행

	return (
		<div className="lmWrap">
			<div className="login-wrap lm-card find-account-wrap">
				<div className="flex-box">
					<div className="intro-box">
						<h3 className="lm-text h3 lm-text-center">계정찾기</h3>
					</div>
					<div action="" className="lm-flex-col gap-24">
						<div className="lm-flex-col gap-6">
							<label htmlFor="name" className="lm-required lm-text title3">
								이름
							</label>
							<input
								type="text"
								id="name"
								className="lm-input"
								name="memberName"
								onChange={handleInputChange}
								value={phoneNumber.memberName}
							/>
						</div>

						<div className="lm-flex-col gap-6 check">
							<label htmlFor="branch" className="lm-required lm-text title3 ">
								휴대폰번호
							</label>
							<div className="lm-form-box">
								<select
									name="phoneNumber0"
									className="lm-select"
									onChange={handleInputChange}
									value={phoneNumber.phoneNumber0}
								>
									<option value="010">010</option>
									<option value="011">011</option>
									<option value="016">016</option>
									<option value="017">017</option>
									<option value="018">018</option>
									<option value="019">019</option>
								</select>
								<input
									type="text"
									className="lm-input"
									name="phoneNumber1"
									onChange={handleInputChange}
									value={phoneNumber.phoneNumber1}
									maxLength={4}
								/>
								<input
									type="text"
									className="lm-input"
									name="phoneNumber2"
									onChange={handleInputChange}
									value={phoneNumber.phoneNumber2}
									maxLength={4}
								/>
							</div>
							<p className="lm-text body4 lm-gray-2 ">
								이름과 휴대폰 번호 인증 후 입력하신 휴대폰 번호로 아이디와 임시 비밀번호가 발급됩니다.
							</p>
						</div>

						<div className="lm-button-wrap lm-form-box lm-flex justify-center">
							<Link to={"/member/login"}>
								<button className="lm-button line line-gray-4 text-main-color1 ">취소</button>
							</Link>
							<button className="lm-button color-1" onClick={apiGetSignFind}>
								인증번호 전송
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
