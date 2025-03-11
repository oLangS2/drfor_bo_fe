import { LmAxios } from "@/axios/LmAxios";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { BaseResponse } from "@/utils/BaseResponse";
import { useState } from "react";
import { textUtils } from "@/utils/textUtils";

// 그룹 등록 팝업
export const GroupCreatePop = ({ onClose, onApi, funCancel }) => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { setLmPop } = HOOK_LM_POP();
	const [gradeValue, setGradeValue] = useState({
		gradeGroupNo: "",
		gradeName: "",
	});

	// ---------------------------------------------------------------
	// API
	// ---------------------------------------------------------------

	// 회원그룹 등록 API
	const apiCreateUserGrade = async () => {
		if (!gradeValue.gradeGroupNo || !gradeValue.gradeName) {
			setLmPop({
				show: true,
				type: "alert",
				contents: "필수 항목을 입력해주세요.",
			});
			return;
		}

		if (gradeValue.gradeGroupNo)
			try {
				const res = await LmAxios({
					method: "POST",
					url: "/admin/user/group/",
					data: {
						userGroupNo: gradeValue.gradeGroupNo,
						userGroupName: gradeValue.gradeName,
					},
				});
				if (res.data.code === BaseResponse.SUCCESS) {
					onClose();
					onApi();
				}
			} catch (error) {
				console.error("postName API 호출 실패:", error);
				onClose();
			}
	};

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	// input Change 이벤트
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		if (name === "gradeGroupNo") {
			// 숫자만 입력 받기
			const numericValue = textUtils(value, ["num"]);

			// gradeGroupNo 업데이트
			setGradeValue((prev) => ({
				...prev,
				[name]: numericValue,
			}));
		} else if (name === "gradeName") {
			// 텍스트 (한글,영어대소문자,숫자)만 입력 받기
			const textValue = textUtils(value, ["ko", "eng", "num", "space"]);

			// gradeName 업데이트
			setGradeValue((prev) => ({
				...prev,
				[name]: textValue,
			}));
		}
	};

	return (
		<div className="lm-pop-container">
			<div className="lm-pop-title mb-24">회원그룹 등록</div>
			<div className="lm-line-bottom"></div>
			<div className="lm-input-box-wrap">
				<div className="lm-input-box-wrap-title">그룹번호</div>
				<input
					name="gradeGroupNo"
					type="text"
					className="lm-input s-s"
					value={gradeValue.gradeGroupNo}
					onChange={handleInputChange}
				/>
			</div>
			<div className="lm-input-box-wrap">
				<div className="lm-input-box-wrap-title">그룹명</div>
				<input
					name="gradeName"
					type="text"
					className="lm-input s-s"
					value={gradeValue.gradeName}
					onChange={handleInputChange}
				/>
			</div>
			<div className="lm-pop-bt-wrap">
				<button className="lm-pop-bt-cancle" onClick={funCancel}>
					취소
				</button>
				<button
					className="lm-pop-bt-success"
					onClick={apiCreateUserGrade} // 닫기 동작 추가
				>
					적용
				</button>
			</div>
		</div>
	);
};
