import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { LmAxios } from "@/axios/LmAxios";
import { BaseResponse } from "@/utils/BaseResponse";
import { LmImageFileUpload } from "@/components/LmImageFileUpload";
import { convertFileToBase64 } from "@/utils/fileUtils";
import { isEmpty, isNumeric, isValidURL } from "@/utils/validationUtils";
import { useNavigate, useParams } from "react-router-dom";
import { dateUtils } from "@/utils/dateUtils";
import { bannerTypePath } from "@/constants/bannerType";

// 시간 및 분 범위 상수 선언
const timeRange = {
	hour: 24,
	minute: 60,
};

export const ContentsForm = ({ bannerType }) => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { setLmPop } = HOOK_LM_POP();
	const [startDate, setStartDate] = useState(null); // 시작날짜/시간/분
	const [endDate, setEndDate] = useState(null); // 종료날짜/시간/분
	const [formData, setFormData] = useState({
		title: "", // 제목
		displayText: "", // 상세문구
		status: "N", // 사용여부
		contentType: "", // 컨텐츠 타입
		videoLink: "", // 동영상 경로
		link: "", // 링크
		newWindow: "N", // 새창 여부
		sortNum: "", // 정렬 순서
		imageName: "", // 업로드 파일 이름
	});
	const [errorMsg, setErrorMsg] = useState(""); // 에러 메세지 상태
	const [selectedPlatForm, setSelectedPlatForm] = useState([]); // 선택된 플랫폼 유형
	const [selectedFile, setSelectedFile] = useState(null); // 선택된 파일 상태
	const { contentNo } = useParams(); // 수정 페이지에서 contentNo 조회
	const navigate = useNavigate(); // 페이지 전환
	const pageTypeName = contentNo ? "수정" : "등록"; // 페이지에 따라 이름 변경

	// ---------------------------------------------------------------
	// Api
	// ---------------------------------------------------------------

	// 일반 컨텐츠 등록
	const apiPostPutContentsGeneral = async (requestData) => {
		const editUrl = `/admin/contents/general/${contentNo}`; // 수정 URL
		const writeUrl = "/admin/contents/general"; // 등록 URL

		try {
			const res = await LmAxios({
				method: contentNo ? "PUT" : "POST",
				url: contentNo ? editUrl : writeUrl,
				data: requestData,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setLmPop({
					show: true,
					type: "alert",
					contents: `콘텐츠가 ${pageTypeName}되었습니다.`, // 등록/수정 분기처리
					success_title: "확인",
					success_fun: (hidepop) => {
						// 목록 페이지로 이동
						hidepop();
						goToListPage();
					},
				});
			}
		} catch (error) {
			console.error("apiPostContentsGeneral API 호출 실패:", error);
		}
	};

	// 컨텐츠 상세 불러오기
	const apiGetContentsGeneralDetail = async () => {
		try {
			const res = await LmAxios({
				method: "GET",
				url: `/admin/contents/general/${contentNo}`,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				const resData = res.data.result;

				setFormData({
					title: resData.title || "",
					sortNum: resData.sortNum || "",
					status: resData.status || "N",
					imageName: resData.imageName || "",
					videoLink: resData.videoLink || "",
					link: resData.link || "",
					newWindow: resData.newWindow || "N",
					displayText: resData.displayText || "",
					contentType: resData.contentType || "",
				});

				setSelectedPlatForm(
					resData.platform ? resData.platform.split(",").map((item) => item.trim()) : []
				);
				setSelectedFile(resData.image || "");
				setStartDate(resData.startAt ? new Date(resData?.startAt) : null);
				setEndDate(resData.endAt ? new Date(resData?.endAt) : null);
			}
		} catch (error) {
			console.error("apiGetContentsGeneralDetail API 호출 실패:", error);
		}
	};

	// 컨텐츠 삭제
	const apiDeleteContentsGeneral = async () => {
		try {
			const res = await LmAxios({
				method: "DELETE",
				url: `/admin/contents/general/${contentNo}`,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setLmPop({
					show: true,
					type: "alert",
					contents: "해당 콘텐츠가 삭제되었습니다.",
					success_fun: (hidepop) => {
						// 목록으로 이동
						hidepop();
						goToListPage();
					},
				});
			}
		} catch (error) {
			console.error("apiDeleteContentsGeneral API 호출 실패:", error);
		}
	};

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	// 일반 컨텐츠 등록 및 수정버튼 클릭 이벤트
	const handleRegisterBtnClick = async () => {
		// 유효성 검사 추가
		// 제목
		if (isEmpty(formData.title)) {
			setErrorMsg("제목을 입력해주세요.");
			return;
		}

		// 컨텐츠 종류가 이미지 인지 동영상인지 분기
		if (
			(formData.contentType === "V" && isEmpty(formData.videoLink)) ||
			(formData.contentType === "I" && isEmpty(selectedFile))
		) {
			setErrorMsg("이미지 첨부 또는 동영상 경로를 등록해 주세요.");
			return;
		}

		// 데이터 정제
		const requesetDateOptions = {
			dateSeparator: "-",
			timeSeparator: ":",
			showYear: true,
			showMonth: true,
			showDay: true,
			showHours: true,
			showMinutes: true,
			showSeconds: true,
		};

		const requestData = {
			bannerType,
			...formData,
			platform: selectedPlatForm.join(","),
			sortNum: Number(formData.sortNum),
		};

		let base64 = ""; // base64 변수를 조건문 외부에서 선언

		// selectedFile이 있는 경우에만 Base64로 변환
		if (selectedFile) {
			// 현재 저장된 파일이  url  형식이면 그대로 data에 입력
			if (isValidURL(selectedFile)) {
				requestData["image"] = selectedFile;
			} else {
				base64 = await convertFileToBase64(selectedFile);
				requestData["image"] = base64;
			}
		}

		if (startDate) {
			requestData["startAt"] = dateUtils.dateFormat(startDate, requesetDateOptions);
		}

		if (endDate) {
			requestData["endAt"] = dateUtils.dateFormat(endDate, requesetDateOptions);
		}

		// 등록 팝업 오픈
		setLmPop({
			show: true,
			type: "confirm",
			contents: `콘텐츠를 ${pageTypeName}하시겠습니까?`,
			success_title: pageTypeName,
			success_fun: () => {
				apiPostPutContentsGeneral(requestData);
			},
		});
	};

	// input Change
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		if (name === "sortNum" && !isNumeric(value)) return;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 날짜 변환 handler
	// event target name 을 던져주지 않고 value만 던져줘서 따로 type을 추가해둠
	const handleDateChange = (type, value) => {
		if (type === "start") {
			setStartDate(value);

			// 시작날짜가 종료날짜를 넘으면 종료 날짜 null 로 변경
			if (endDate && value > endDate) {
				setEndDate(null);
			}
		} else {
			setEndDate(value);
		}
	};

	// 시간/분  select 함수
	const handleTimeChange = (event) => {
		// type: start, end
		// time: hour, minute

		const { name, value } = event.target;

		const newValue = parseInt(value, 10); // 시간과 분을 두 자리수 숫자로 만듦

		// newValue가 숫자가 아니면 리턴
		if (isNaN(newValue)) return;

		const updatedStartDate = new Date(startDate);
		const updatedEndDate = new Date(endDate);

		switch (name) {
			case "start-hour":
				// 시작 시간
				updatedStartDate.setHours(newValue);
				setStartDate(updatedStartDate);
				return;

			case "start-minute":
				// 시작 분
				updatedStartDate.setMinutes(newValue);
				setStartDate(updatedStartDate);
				return;

			case "end-hour":
				// 시작 분
				updatedEndDate.setHours(newValue);
				setEndDate(updatedEndDate);
				return;

			case "end-minute":
				// 시작 분
				updatedEndDate.setMinutes(newValue);
				setEndDate(updatedEndDate);
				return;

			default:
				break;
		}
	};

	// 체크박스 체크 함수
	const handleCheckPlatForm = (e) => {
		const { value } = e.target;

		setSelectedPlatForm((prev) => {
			if (prev.includes(value)) {
				return prev.filter((item) => item !== value);
			} else {
				return [...prev, value];
			}
		});
	};

	// 파일첨부 기능
	const handleFileChange = (files) => {
		if (files) {
			setSelectedFile(files);
			setFormData({
				...formData,
				imageName: files.name,
			});
		} else {
			setSelectedFile(null);
			setFormData((prevValues) => ({
				...prevValues,
				imageName: "",
			}));
		}
	};

	// 삭제 버튼 클릭 이벤트
	const handleDeleteBtnClick = () => {
		setLmPop({
			show: true,
			type: "confirm",
			contents: "해당 콘텐츠를 삭제하시겠습니까?",
			success_title: "확인",
			success_fun: () => {
				apiDeleteContentsGeneral();
			},
		});
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------

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
				setErrorMsg("");
			},
		});
	}, [errorMsg]);

	// 수정 페이지에서 상세 정보 불러오고 상태 업데이트
	useEffect(() => {
		if (!contentNo) return;

		apiGetContentsGeneralDetail();
	}, []);

	// ---------------------------------------------------------------
	// private methods
	// ---------------------------------------------------------------

	// 시간 분 select option 생성
	const generateOptions = (range) => {
		const rangeArray = [...Array(range).keys()];

		return rangeArray.map((value) => (
			<option key={value} value={value}>
				{value.toString().padStart(2, "0")}
			</option>
		));
	};

	// 목록 페이지 이동 함수
	const goToListPage = () => {
		navigate(`/contents/${bannerTypePath[bannerType]}`);
	};

	return (
		<div className="lm-container contents-wrap">
			{/* 컨텐츠 영역 */}
			<div className="lm-card-wrap">
				<div className="lm-card padding-1">
					<div className="lm-title-box">
						<div className="lm-text title2 mb-12">SHOP메인 상단 띠배너</div>
					</div>
					<table className="lm-table">
						<tbody>
							<tr>
								<th>제목</th>
								<td>
									<input
										type="text"
										className="lm-input"
										name="title"
										value={formData.title}
										onChange={handleInputChange}
									/>
								</td>
							</tr>

							<tr>
								<th>노출순서</th>
								<td>
									<div className="lm-flex  gap-8">
										<input
											type="text"
											className="lm-input"
											name="sortNum"
											onChange={handleInputChange}
											value={formData.sortNum}
										/>
										{/* <button>적용</button> */}
									</div>
								</td>
							</tr>

							<tr>
								<th>플랫폼</th>
								<td>
									<div className="lm-flex items-center gap-8">
										<div className="lm-checkbox">
											<input
												id="pc-check"
												type="checkbox"
												checked={selectedPlatForm.includes("PC")}
												value={"PC"}
												onChange={handleCheckPlatForm}
											/>
											<label htmlFor="pc-check">PC</label>
										</div>
										<div className="lm-checkbox">
											<input
												id="mo-check"
												type="checkbox"
												checked={selectedPlatForm.includes("MO")}
												value={"MO"}
												onChange={handleCheckPlatForm}
											/>
											<label htmlFor="mo-check">MO</label>
										</div>
									</div>
								</td>
							</tr>
							<tr>
								<th>사용기간</th>
								<td>
									<div className="lm-flex-col gap-8">
										<div className="lm-flex items-center gap-8">
											<DatePicker
												placeholderText="시작일 날짜"
												className="lm-input"
												onChange={(value) => {
													handleDateChange("start", value);
												}}
												selected={startDate}
												endDate={endDate}
												dateFormat={"yyyy.MM.dd"}
											/>
											<select
												className="lm-select"
												value={startDate?.getHours()?.toString() || ""}
												name="start-hour"
												onChange={handleTimeChange}
											>
												{generateOptions(timeRange.hour)}
											</select>
											시
											<select
												className="lm-select"
												value={startDate?.getMinutes()?.toString() || ""}
												name="start-minute"
												onChange={handleTimeChange}
											>
												{generateOptions(timeRange.minute)}
											</select>
											분
										</div>
										<div className="lm-flex items-center gap-8">
											<DatePicker
												placeholderText="종료일 날짜"
												className="lm-input"
												onChange={(value) => {
													handleDateChange("end", value);
												}}
												selected={endDate}
												startDate={startDate}
												minDate={startDate} // 시작 날짜보다 빠를 수 없게 제한
												dateFormat={"yyyy.MM.dd"}
											/>
											<select
												className="lm-select"
												value={endDate?.getHours()?.toString() || ""}
												name="end-hour"
												onChange={handleTimeChange}
											>
												{generateOptions(timeRange.hour)}
											</select>
											시
											<select
												className="lm-select"
												value={endDate?.getMinutes()?.toString() || ""}
												name="end-minute"
												onChange={handleTimeChange}
											>
												{generateOptions(timeRange.minute)}
											</select>
											분
										</div>
									</div>
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
											name="status"
											value="Y"
											checked={formData.status === "Y"}
											onChange={handleInputChange}
										/>
										<label htmlFor="radio1">사용</label>
										<input
											type="radio"
											id="radio2"
											className="lm-radio-input"
											name="status"
											value="N"
											checked={formData.status === "N"}
											onChange={handleInputChange}
										/>
										<label htmlFor="radio2">미사용</label>
									</div>
								</td>
							</tr>
							<tr>
								<th>콘텐츠 종류</th>
								<td>
									<div className="lm-flex items-center gap-12">
										<div className="lm-flex items-center">
											<input
												type="radio"
												id="radio3"
												className="lm-radio-input"
												name="contentType"
												value="I"
												checked={formData.contentType === "I"}
												onChange={handleInputChange}
											/>
											<label htmlFor="radio3">이미지</label>
										</div>
										<div className="lm-flex items-center">
											<input
												type="radio"
												id="radio4"
												className="lm-radio-input"
												name="contentType"
												value="V"
												checked={formData.contentType === "V"}
												onChange={handleInputChange}
											/>
											<label htmlFor="radio4">동영상</label>
										</div>
									</div>
								</td>
							</tr>
							<tr>
								<th>이미지등록</th>
								<td>
									<LmImageFileUpload
										onFileChange={handleFileChange}
										initialImage={formData.imageName}
									/>
									<p className="lm-text caption1 lm-gray-2 mt-6">
										이미지 파일(jpg, png, gif)만 등록해 주세요.
										<br />
										5mb 이내 사이즈 1건 업로드 가능합니다.
									</p>
								</td>
							</tr>
							<tr>
								<th>동영상 경로</th>
								<td>
									<input
										type="text"
										className="lm-input"
										placeholder="동영상 URL 작성"
										name="videoLink"
										value={formData.videoLink}
										onChange={handleInputChange}
									/>
								</td>
							</tr>
							<tr>
								<th>링크</th>
								<td>
									<input
										type="text"
										className="lm-input"
										placeholder="이동할 URL 입력"
										name="link"
										value={formData.link}
										onChange={handleInputChange}
									/>
								</td>
							</tr>
							<tr>
								<th>새창여부</th>
								<td>
									<div className="lm-flex items-center gap-12">
										<div className="lm-flex items-center">
											<input
												type="radio"
												id="radio5"
												className="lm-radio-input"
												name="newWindow"
												value="Y"
												checked={formData.newWindow === "Y"}
												onChange={handleInputChange}
											/>
											<label htmlFor="radio5">새창</label>
										</div>
										<div className="lm-flex items-center">
											<input
												type="radio"
												id="radio6"
												className="lm-radio-input"
												name="newWindow"
												value="N"
												checked={formData.newWindow === "N"}
												onChange={handleInputChange}
											/>
											<label htmlFor="radio6">현재창</label>
										</div>
									</div>
								</td>
							</tr>
							<tr>
								<th>상세문구</th>
								<td>
									<div>
										<textarea
											className="lm-textarea"
											name="displayText"
											cols="30"
											rows="10"
											value={formData.displayText}
											onChange={handleInputChange}
										></textarea>
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
					<div className="lm-flex gap-6">
						<button className="lm-button line lm-flex-1" onClick={goToListPage}>
							취소
						</button>
						{contentNo ? (
							<button
								className="lm-button line color-4 lm-flex-1 delete"
								onClick={handleDeleteBtnClick}
							>
								삭제
							</button>
						) : (
							<button
								className="lm-button color-1 lm-flex-1"
								onClick={handleRegisterBtnClick}
							>
								등록
							</button>
						)}
					</div>
					{contentNo && (
						<div className="mt-6">
							<button
								className="lm-button color-black w-full"
								onClick={handleRegisterBtnClick}
							>
								수정
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
