// 콘텐츠 관리의 SHOP메인 인삿말 작성 및 수정 폼 컴포넌트 (컨텐츠 관리 - SHOP메인 인삿말)
import { LmAxios } from "@/axios/LmAxios";
import { useEffect, useState } from "react";
import TimePicker from "@/pages/contents/TimePicker";
import { BaseResponse } from "@/utils/BaseResponse";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { useNavigate, useParams } from "react-router-dom";
import { LmImageFileUpload } from "@/components/LmImageFileUpload"; // 파일업로드 컴포넌트
import { convertFileToBase64 } from "@/utils/fileUtils"; // 파일을 Base64로 변환하는 함수
import { isEmpty } from "@/utils/validationUtils"; // 빈값일 때 유효성검사

// 첨부파일 타입
const uploadType = {
	BACKGROUND_IMAGE: "backgroundImage",
	ICON_IMAGE: "iconImage"
}

export const GreetingContentsForm = () => {
	// ------------------------------------------------------------------------------
	// 초기 변수 설정
	// ------------------------------------------------------------------------------
	const [startTime, setStartTime] = useState({ hour: "00", minute: "00" }); //노출 시작 시간 상태
	const [endTime, setEndTime] = useState({ hour: "00", minute: "00" }); // 노출 종료 시간 상태
	const [userGradeList, setUserGradeList] = useState([]); // 회원 등급 리스트 상태
	const [inputValues, setInputValues] = useState({
		groupNo: "",
		title: "", // 제목
		detail: "", // 상세문구
		use: "N", // 사용여부
		backgroundImageName: "", // 배경이미지
		iconImageName: "" // 아이콘이미지
	});
	const [errorMsg, setErrorMsg] = useState(""); // 에러 메세지 상태
	const { setLmPop } = HOOK_LM_POP(); // 공통 팝업 세팅

	const { contentNo } = useParams(); // URL 경로 파라미터에서 contentNo 가져오기 데이터를 관리하는 상태
	const navigate = useNavigate();

	// 파일첨부
	const [backgroundSelectedFile, setBackgroundSelectedFile] = useState(null); // 파일첨부 (배경 이미지 파일)
	const [iconSelectedFile, setIconSelectedFile] = useState(null); // 파일첨부 (아이콘 파일)

	// 인삿말 상세 데이터
	const [greetingData, setGreetingData] = useState({});

	// ---------------------------------------------------------------
	// API
	// --------------------------------------------------------------
	// 유저 그룹 불러오기
	const apiGetUserGrade = async () => {
		try {
			const res = await LmAxios({
				method: "GET",
				url: "/admin/user/grade/",
				params: {
					displayRow: 100,
					currentPage: 1,
				},
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setUserGradeList(res.data.result?.gradeList);
			}
		} catch (error) {
			console.error("apiGetUserGrade API 호출 실패:", error);
		}
	};

	// 인삿말 등록 api
	const apiPostGreetingWrite = async (data) => {
		try {
			const res = await LmAxios({
				method: "POST",
				url: "/admin/contents/greeting",
				data: data,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setLmPop({
					show: true,
					type: "alert",
					contents: "콘텐츠가 등록되었습니다.",
					success_fun: (hidepop) => {
						hidepop();
						navigate(-1);
					},
				});
			}
		} catch (error) {
			console.error("apiPostGreetingWrite API 호출 실패:", error);
		}
	};

	// 인삿말 상세 조회 api
	const apiGetContentsGreetingDetail = async () => {
		try {
			const res = await LmAxios({
				method: "GET",
				url: `/admin/contents/greeting/${contentNo}`,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				const data = res.data.result; // 응답 데이터 바로 사용
				setGreetingData(data); // 상태 업데이트

				// 시간 데이터에서 값이 HH:mm:ss 형식으로 나와서 셀렉트박스에 담기위해 분리
				const getTimeParts = (timeString) => {
					if (!timeString) {
						return { hour: "00", minute: "00" }; // 기본값 처리
					}

					const [hour, minute] = timeString.split(":");
					return { hour, minute };
				};

				// inputValues와 시간 상태 업데이트
				setInputValues((prev) => ({
					...prev,
					groupNo: data.groupNo || "",
					title: data.title || "",
					detail: data.displayText || "",
					use: data.status || "N", // 기본값 미사용("N")
					backgroundImageName: data.backgroundImageName || "",
					iconImageName: data.iconImageName || "",
				}));

				// 시작 시간 및 종료 시간 상태 업데이트
				setStartTime(getTimeParts(data.startAt));
				setEndTime(getTimeParts(data.endAt));
			}
		} catch (error) {
			console.error("apiGetContentsGreetingDetail API 호출 실패:", error);
		}
	};

	// 인삿말 수정 api
	const apiPutContentsGreetingModify = async (contentNo, putData) => {
		try {
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/contents/greeting/${contentNo}`,
				data: putData,
			});

			if (res.data.code !== BaseResponse.SUCCESS) {
				console.error("apiPutContentsGreetingModify API 호출 실패:", res.data.message);
			}
		} catch (error) {
			console.error("apiPutContentsGreetingModify API 호출 실패:", error);
		}
	};

	// 인삿말 삭제 api
	const apiDeleteContentsGreeting = async () => {
		try {
			const res = await LmAxios({
				method: "DELETE",
				url: `/admin/contents/greeting/${contentNo}`,
			});
			if (res.data.code !== BaseResponse.SUCCESS) {
				console.error("apiDeleteContentsGreeting API 호출 실패:", res.data.message);
			}
		} catch (error) {
			console.error("apiDeleteContentsGreeting API 호출 실패:", error);
		}
	};

	// ------------------------------------------------------------------------------
	// Handler
	// ------------------------------------------------------------------------------
	// input Change
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		setInputValues((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 파일첨부 기능
	const handleFileChange = (files, type) => {
		if (type === uploadType.BACKGROUND_IMAGE) { // 타입이 배경이미지 이면
			setBackgroundSelectedFile(files || null); // backgroundSelectedFile는 선택한 파일
			setInputValues((prevValues) => ({
				...prevValues,
				backgroundImageName: files ? files.name : "",
			})); // input의 values 바꿔서 첨부파일 이름 바꾸기
		} else if (type === uploadType.ICON_IMAGE) { // 타입이 아이콘 이면
			setIconSelectedFile(files || null);
			setInputValues((prevValues) => ({
				...prevValues,
				iconImageName: files ? files.name : "",
			}));
		}
	};

	// 인삿말 등록 핸들러
	const handleRegisterBtnClick = async () => {
		// 유효성 체크
		// 회원등급
		if (isEmpty(inputValues.groupNo)) {
			setErrorMsg("그룹을 선택해주세요.");
			return;
		}

		// 제목
		if (isEmpty(inputValues.title)) {
			setErrorMsg("제목을 입력해주세요.");
			return;
		}

		// 상세문구
		if (isEmpty(inputValues.detail)) {
			setErrorMsg("상세문구를 입력해주세요.");
			return;
		}

		// 이미지 base64 변환
		let backgroundBase64 = ""; // 배경 이미지 Base64
		let iconBase64 = ""; // 아이콘 Base64

		// backgroundSelectedFile 이나 iconSelectedFile 있는 경우 Base64로 변환
		if (backgroundSelectedFile) {
			backgroundBase64 = await convertFileToBase64(backgroundSelectedFile);
		}

		if (iconSelectedFile) {
			iconBase64 = await convertFileToBase64(iconSelectedFile);
		}

		// 요청 데이터 정의
		const postData = {
			groupNo: inputValues.groupNo,
			startAt: `${startTime.hour}:${startTime.minute}:00`,
			endAt: `${endTime.hour}:${endTime.minute}:00`,
			title: inputValues.title,
			displayText: inputValues.detail,
			status: inputValues.use,
			backgroundImage: backgroundBase64,
			backgroundImageName: inputValues.backgroundImageName,
			icon: iconBase64,
			iconImageName: inputValues.iconImageName,
		};

		// 등록 팝업 띄우기
		setLmPop({
			show: true,
			type: "confirm",
			contents: "콘텐츠를 등록하시겠습니까?",
			success_fun: () => {
				apiPostGreetingWrite(postData);
			},
		});
	};

	// 인삿말 수정 핸들러
	const handleModifyBtnClick = async () => {
		// 이미지 Base64 변환
		let backgroundBase64 = greetingData.backgroundImage || ""; // 기본값: 기존 데이터
		let iconBase64 = greetingData.icon || ""; // 기본값: 기존 데이터

		// 새로운 배경 이미지가 선택된 경우 Base64 변환
		if (backgroundSelectedFile) {
			backgroundBase64 = await convertFileToBase64(backgroundSelectedFile);
		}

		// 새로운 아이콘 이미지가 선택된 경우 Base64 변환
		if (iconSelectedFile) {
			iconBase64 = await convertFileToBase64(iconSelectedFile);
		}

		// 수정 요청 데이터 생성
		const putData = {
			groupNo: inputValues.groupNo,
			startAt: `${startTime.hour}:${startTime.minute}:00`,
			endAt: `${endTime.hour}:${endTime.minute}:00`,
			title: inputValues.title,
			displayText: inputValues.detail,
			backgroundImage: backgroundBase64, // Base64 데이터
			backgroundImageName: inputValues.backgroundImageName || greetingData.backgroundImageName,
			icon: iconBase64, // Base64 데이터
			iconImageName: inputValues.iconImageName || greetingData.iconImageName,
			status: inputValues.use,
		};

		// 수정 팝업 띄우기
		setLmPop({
			show: true,
			type: "confirm",
			contents: "콘텐츠를 수정하시겠습니까?",
			success_fun: async () => {
				await apiPutContentsGreetingModify(contentNo, putData);
				setLmPop({
					show: true,
					type: "alert",
					contents: "콘텐츠가 수정되었습니다.",
					success_fun: (hidepop) => {
						hidepop();
						// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
						navigate(-1); // 이전 페이지로 이동
					},
				});
			},
			cancel_fun: (hidepop) => hidepop(),
		});
	};

	// 인삿말 삭제 핸들러
	const handleDeleteBtnClick = () => {
		// 삭제 팝업 띄우기
		setLmPop({
			show: true,
			type: "confirm",
			contents: "콘텐츠를 삭제하시겠습니까?",
			success_fun: async () => {
				apiDeleteContentsGreeting(); // 인삿말 삭제 api 함수
				// 두 번째 팝업 (alert)
				setLmPop({
					show: true,
					type: "alert",
					contents: "콘텐츠가 삭제되었습니다.",
					success_fun: (hidepop) => {
						hidepop();
						// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
						navigate(-1); // 이전 페이지로 이동
					},
				});
			},
			cancel_fun: (hidepop) => hidepop(),
		});
	}

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------
	useEffect(() => {
		apiGetUserGrade(); // 회원 등급 리스트

		if (contentNo) {
			// contentNo가 있을 경우(수정 모드) 상세 조회 API 호출
			apiGetContentsGreetingDetail();
		}
	}, [contentNo]);

	// 에러 메세지가 바뀔 때 공통 팝업 띄움
	useEffect(() => {
		// 에러 메세지가 빈 값이면 return
		if (!errorMsg) return;

		setLmPop({
			show: true,
			type: "alert",
			contents: errorMsg,
			success_fun: (hidepop) => {
				hidepop();
			},
		});
	}, [errorMsg]);

	return (
		<div className="lm-container contents-wrap">
			{/* 컨텐츠 영역 */}
			<div className="lm-card-wrap">
				<div className="lm-card padding-1">
					<div className="lm-title-box">
						<div className="lm-text title2 mb-12">SHOP메인 인삿말</div>
					</div>
					<table className="lm-table">
						<tbody>
							<tr>
								<th>그룹(회원등급)</th>
								<td>
									<select
										name="groupNo"
										value={inputValues.groupNo}
										className="lm-select"
										onChange={(e) => handleInputChange(e)}
									>
										<option value="">[선택] 회원등급</option>
										{userGradeList.map((item) => (
											<option key={item.userGradeId} value={item.gradeGroupNo}>
												{item.gradeName}
											</option>
										))}
									</select>
								</td>
							</tr>
							<tr>
								<th>노출시간</th>
								<td>
									<div className="lm-flex-col gap-8">
										<TimePicker value={startTime} onChange={setStartTime} />
										<TimePicker value={endTime} onChange={setEndTime} />
									</div>
								</td>
							</tr>
							<tr>
								<th>제목</th>
								<td>
									<input
										type="text"
										className="lm-input"
										name="title"
										value={inputValues.title}
										onChange={(e) => handleInputChange(e)}
									/>
								</td>
							</tr>
							<tr>
								<th>상세문구</th>
								<td>
									<textarea
										className="lm-textarea"
										cols="30"
										rows="10"
										name="detail"
										value={inputValues.detail}
										onChange={(e) => handleInputChange(e)}
									></textarea>
								</td>
							</tr>
							<tr>
								<th>배경이미지</th>
								<td>
									<LmImageFileUpload
										onFileChange={(files) => handleFileChange(files, uploadType.BACKGROUND_IMAGE)}
										initialImage={inputValues.backgroundImageName}
										id="backgroundFileInput"
									/>
									<p className="lm-text caption1 lm-gray-2 mt-6">
										이미지 파일(jpg, png, gif)만 등록해 주세요.
										<br />
										5mb 이내 사이즈 1건 업로드 가능합니다.
									</p>
								</td>
							</tr>
							<tr>
								<th>아이콘</th>
								<td>
									<LmImageFileUpload
										onFileChange={(files) => handleFileChange(files, uploadType.ICON_IMAGE)}
										initialImage={inputValues.iconImageName}
										id="iconFileInput"
									/>
									<p className="lm-text caption1 lm-gray-2 mt-6">
										이미지 파일(jpg, png, gif)만 등록해 주세요.
										<br />
										5mb 이내 사이즈 1건 업로드 가능합니다.
									</p>
								</td>
							</tr>
							<tr>
								<th>사용여부</th>
								<td>
									<div className="lm-flex items-center">
										<input
											type="radio"
											id="radio1"
											className="lm-radio-input"
											name="use"
											value="Y"
											checked={inputValues.use === "Y"}
											onChange={handleInputChange}
										/>
										<label htmlFor="radio1">사용</label>
										<input
											type="radio"
											id="radio2"
											className="lm-radio-input"
											name="use"
											value="N"
											checked={inputValues.use === "N"}
											onChange={handleInputChange}
										/>
										<label htmlFor="radio2">미사용</label>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* 사이드 메뉴 */}
			<div className="side-box">
				<div className="btn-box">
					{greetingData.groupNo ? (
						<div className="lm-flex-col gap-6">
							<div className="lm-flex gap-6">
								<button
									className="lm-button line lm-flex-1"
									// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
									onClick={() => navigate(-1)}
								>
									취소
								</button>
								<button
									className="lm-button line lm-flex-1 color-4 delete"
									onClick={handleDeleteBtnClick}
								>
									삭제
								</button>
							</div>
							<button
								className="lm-button color-black w-full"
								onClick={handleModifyBtnClick}
							>
								수정
							</button>
						</div>
					) : (
						<div className="lm-flex gap-6">
							<button
								className="lm-button line lm-flex-1"
								// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
								onClick={() => navigate(-1)}
							>
								취소
							</button>
							<button
								className="lm-button color-1 lm-flex-1"
								onClick={handleRegisterBtnClick}
							>
								등록
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};