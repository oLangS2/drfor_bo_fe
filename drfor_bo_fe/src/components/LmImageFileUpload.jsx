import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import HOOK_LM_POP from "@/store/hooks/hookPop";

// 상수 정의
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB 제한
const ALLOWED_FILE_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/gif"]; // 허용 파일 유형

export const LmImageFileUpload = ({ onFileChange, initialImage, id = "fileInput" }) => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { setLmPop } = HOOK_LM_POP();
	const [fileName, setFileName] = useState("");

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------
	// 파일 선택 처리 함수
	const handleFileChange = (e) => {
		const file = e.target.files[0]; // 단일 파일 선택

		if (!file) return;

		// 파일 조건 검사
		if (file.size > MAX_FILE_SIZE || !ALLOWED_FILE_TYPES.includes(file.type)) {
			resetFileInput();
			setLmPop({
				show: true,
				type: "alert",
				contents: "파일형태(jpg, png, gif) 또는 크기(5mb이하)을 확인해 주세요.",
			});
			return;
		}

		// 유효한 파일 처리 (기존 파일 제거 후 새 파일 등록)
		setFileName(file.name);
		onFileChange(file); // 부모 컴포넌트로 파일 정보 전달
	};

	// 파일 선택 창 열기
	const handleButtonClick = () => {
		document.getElementById(id).click();
	};

	// 파일 삭제 처리 함수
	const handleFileDelete = () => {
		if (!fileName) return; // 파일이 없으면 동작하지 않음
		setFileName(""); // 파일 초기화
		onFileChange(null); // 부모 컴포넌트에 null 전달
		resetFileInput();
	};

	// 파일 입력 초기화 함수
	const resetFileInput = () => {
		document.getElementById(id).value = "";
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------
	useEffect(() => {
		if (initialImage) {
			setFileName(initialImage);
		}
	}, [initialImage]);

	return (
		<div className="lm-input-file-wrap">
			<div className="lm-input-file-box">
				{/* 파일 선택 input */}
				<input
					type="file"
					id={id} // 동적으로 ID 설정
					accept=".jpg,.jpeg,.png,.gif"
					style={{ display: "none" }}
					onChange={handleFileChange}
				/>
				{/* 읽기 전용 텍스트 필드 */}
				<div className="lm-input-file-box">
					<input
						type="text"
						placeholder="선택된 파일 없음"
						value={fileName || ""} // 파일 이름 표시
						readOnly
					/>
					{/* TODO - 삭제버튼 SVG 오류 수정 */}
					{/* 파일 삭제 버튼 */}
					<button
						type="button"
						className="lm-icon-file-delete"
						onClick={handleFileDelete}
						disabled={!fileName} // 파일이 없으면 비활성화
					></button>
				</div>
				{/* 파일 첨부 버튼 */}
				<button type="button" className="lm-file-button-up" onClick={handleButtonClick}>
					파일첨부
				</button>
			</div>
		</div>
	);
};

// PropTypes 정의
LmImageFileUpload.propTypes = {
	onFileChange: PropTypes.func.isRequired, // 파일 선택 시 부모로 파일 정보 전달
	initialImage: PropTypes.string, // 초기 파일 이름 (선택 사항)
	id: PropTypes.string, // 파일 입력 ID (선택 사항)
};
