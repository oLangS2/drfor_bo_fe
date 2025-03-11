// 페이지
import { useState } from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { getFilter } from "@/utils/getFilter";
import { LmAxios } from "@/axios/LmAxios";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { decodeHtmlString } from "@/utils/decodeHtmlString"; // HTML 엔티티(코드화된 문자열)를 일반 HTML 텍스트로 변환하는 (디코딩) 함수

// 상수 정의
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB 제한
const ALLOWED_FILE_TYPES = ["image/jpg", "image/jpeg", "image/png", "image/gif"]; // 허용 파일 유형

export const Editor = ({ onChange, value }) => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { setLmPop } = HOOK_LM_POP();
	const [device, setDevice] = useState(getFilter.getDeviceCheck());

	const setOptions = {
		buttonList: [
			["undo", "redo"],
			["font", "fontSize"],
			["bold", "underline", "italic", "strike", "subscript", "superscript"],
			["codeView"],
			["fontColor", "hiliteColor"],
			["align", "list", "lineHeight"],
			["outdent", "indent"],
			["table", "horizontalRule", "link", "image", "video"],
			["preview", "print"],
			["removeFormat"],
		],
		// defaultTag: "div",
		minHeight: "300px",
		showPathLabel: false,
		font: [
			"Logical",
			"Salesforce Sans",
			"Garamond",
			"Sans-Serif",
			"Serif",
			"Times New Roman",
			"Helvetica",
			"Arial",
			"Comic Sans MS",
			"Courier New",
			"Impact",
			"Georgia",
			"Tahoma",
			"Trebuchet MS",
			"Verdana",
		].sort(),
	};

	const handleChange = (content) => {
		if (onChange) {
			onChange(content); // 부모 컴포넌트로 값 전달
		}
	};

	const handleOnkeyUp = (e, core) => {
		// let target = document.querySelector('.sun-editor-editable');
		// target.scrollTop = target.scrollHeight + 100;
	};

	const handleOnkeyDown = (e, core) => {
		if (e.key === "Enter") {
			setTimeout(() => {
				core.focus(); // 포커스를 유지
				if (device === "PC") {
					// pc 엔터시 스크롤 이동
					const selection = window.getSelection();
					if (selection.rangeCount > 0) {
						const range = selection.getRangeAt(0);
						const cursorElement = range.startContainer.parentNode;

						if (cursorElement) {
							// 에디터 컨테이너 가져오기
							const editorContainer = core.context.element.wysiwyg; // WYSIWYG 영역

							// 커서 위치 계산
							const cursorRect = cursorElement.getBoundingClientRect();
							const editorRect = editorContainer.getBoundingClientRect();

							// 스크롤 조정 (세로 스크롤만)
							if (cursorRect.bottom > editorRect.bottom) {
								// 커서가 에디터 하단을 넘어가면 스크롤 다운
								editorContainer.scrollTop += cursorRect.bottom - editorRect.bottom;
							} else if (cursorRect.top < editorRect.top) {
								// 커서가 에디터 상단을 넘어가면 스크롤 업
								editorContainer.scrollTop -= editorRect.top - cursorRect.top;
							}
						}
					}
				}
			}, 0);
		}
	};

	// 이미지 업로드 전에 파일 조건 확인
	const handleImageUploadBefore = (files, info) => {
		const file = files[0];

		if (!file) return true;

		// 파일 조건 검사
		if (file.size > MAX_FILE_SIZE || !ALLOWED_FILE_TYPES.includes(file.type)) {
			setLmPop({
				show: true,
				type: "alert",
				contents: "파일형태(jpg, png, gif) 또는 크기(5mb이하)을 확인해 주세요.",
			});
			return false; // 업로드 중지
		}

		// 파일 조건이 모두 만족하면 업로드 진행
		return true;
	};

	// 카페 24 서버에 이미지 업로드 후 sunEditor에 url 삽입
	const handleImageUpload = async (files, info, uploadHandler) => {
		if (!files || files.length === 0) return;

		const file = files[0];

		// file이 File 객체인지 확인
		if (!(file instanceof File)) {
			return;
		}
		try {
			const reader = new FileReader();

			reader.onloadend = async () => {
				if (!reader.result) {
					console.error("이미지 파일을 읽을 수 없습니다.");
					uploadHandler({ result: [] });
					return;
				}

				const imageData = reader.result;

				try {
					const res = await LmAxios({
						method: "POST",
						url: "/system/common/image/upload",
						data: { base64EncodedImage: imageData },
					});

					if (res.data?.result?.imageUrl) {
						uploadHandler({
							result: [{ url: res.data.result.imageUrl }],
						});
					} else {
						console.error("이미지 업로드 실패:", res.data?.message || "알 수 없는 오류");
						uploadHandler({ result: [] });
					}
				} catch (error) {
					console.error("이미지 업로드 중 오류 발생:", error);
					uploadHandler({ result: [] });
				}
			};

			reader.readAsDataURL(file);
		} catch (error) {
			console.error("이미지 처리 중 오류 발생:", error);
		}
	};

	return (
		<SunEditor
			setContents={decodeHtmlString(value || "")}
			onChange={handleChange}
			onKeyUp={handleOnkeyUp}
			onKeyDown={handleOnkeyDown}
			onImageUpload={handleImageUpload}
			onImageUploadBefore={handleImageUploadBefore}
			setOptions={setOptions}
		/>
	);
};
