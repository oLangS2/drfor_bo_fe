// 상담글 관리의 상담 답변 작성 및 수정 폼 컴포넌트(상담글 관리)
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LmAxios } from "@/axios/LmAxios";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { Editor } from "@/components/Editor"; // 에디터 컴포넌트
import SearchProductPopup from "@/components/popup/SearchProductPopup"; // 추천상품 팝업
import { BaseResponse } from "@/utils/BaseResponse"; // api 서버 통신 응답
import iconWarningPath from "@/assets/img/icon/icon-warning.svg";
import { maskCustomerId } from "@/utils/maskCustomerId"; // ID 마스크 함수

// 공개여부
const ExposureStatus = {
	E: "E", // 공개
	H: "H", // 비공개
};

// 추천상품 선택 시 초과 개수 = 5
const PROJECT_LIMIT_COUNT = 5;

// 상담 답변 sms 발송 여부
const SendSmsStatus = {
	FASLE: "N", // sms 미진행
	TRUE: "Y", // sms 진행
};

export const WriteModifyForm = () => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const navigate = useNavigate();

	// 팝업
	const { setLmPop } = HOOK_LM_POP(); // 팝업 데이터를 관리하는 상태
	const [popData, setPopData] = useState({}); // 팝업 데이터를 관리하는 상태

	// 파라미터
	const { consultNo } = useParams(); // URL 경로 파라미터에서 consultId(consultNo) 가져오기
	const [searchParams] = useSearchParams(); // URL 쿼리 파라미터 처리

	// 상담 상세 데이터
	const [consultData, setConsultData] = useState(null); // 상담 데이터를 관리하는 상태
	const [selectedProductList, setSelectedProductList] = useState([]); // 선택된 상품 데이터를 관리하는 상태
	const [consultFeedData, setConsultFeedData] = useState(null); // 상담사 답변 데이터를 관리하는 상태
	const [statusData, setStatusData] = useState(""); // 공개 여부 초기값 상태

	// 에디터
	const [editorContent, setEditorContent] = useState(""); // 상담 답변에 대한 내용

	// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
	const currentPage = searchParams.get("currentPage"); // currentPage 값 가져오기

	// ---------------------------------------------------------------
	// API
	// ---------------------------------------------------------------
	// 상담 상세 조회 API
	const apiGetConsultDetail = async () => {
		try {
			const res = await LmAxios({
				method: "GET",
				url: `/admin/consult/${consultNo}`,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setConsultData(res.data.result.consult); // 상담상세
				setConsultFeedData(res.data.result.consultFeed); // 상담답변
				setStatusData(res.data.result.consult.status); // 공개여부
			}
		} catch (error) {
			console.error("apiGetConsultDetail API 호출 실패:", error);
		}
	};

	// 상담 글 공개 여부 수정 API
	const apiPutConsultExposureStatus = async (consultNo, statusData) => {
		try {
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/consult/${consultNo}/exposure`,
				data: { status: statusData }, // 현재 토글 상태 전송
			});

			if (res.data.code !== BaseResponse.SUCCESS) {
				console.error("apiPutConsultExposureStatus API 실패:", res.data.message);
			}
		} catch (error) {
			console.error("공개 여부 수정 API 호출 오류:", error);
		}
	};

	// 상담 답변 신규 등록 API
	const apiPostConsultSubmit = async () => {
		try {
			const res = await LmAxios({
				method: "POST",
				url: `/admin/consult`,
				data: {
					consultId: consultNo, // 상담 ID
					advice: editorContent, // 에디터에서 입력된 상담 내용
					consultFeedProducts: selectedProductList, // 추천 상품 리스트
				},
			});

			if (res.data.code === BaseResponse.SUCCESS) {
				// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
				navigate(-1); // 성공 시 목록으로 이동
			} else {
				console.error("상담 내용 등록 실패:", res.data.message);
			}
		} catch (error) {
			console.error("상담 내용 등록 API 호출 오류:", error);
		}
	};

	// 상담 답변 수정 등록 API
	const apiPutConsultModify = async (sendSms) => {
		try {
			// 상담 내용 수정 API 호출
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/consult/${consultNo}`,
				data: {
					advice: editorContent, // 에디터에서 작성한 내용
					consultFeedProducts: selectedProductList, // 추천 상품 데이터
					sendSms: sendSms, // 팝업 버튼에 따라 sendSms 값 전송
				},
			});

			if (res.data.code === BaseResponse.SUCCESS) {
				// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
				navigate(-1); // 성공 시 목록으로 이동
			} else {
				console.error("상담 내용 수정 실패:", res.data.message);
			}
		} catch (error) {
			console.error("상담 내용 수정 API 호출 실패:", error);
		}
	};

	// 상담 상세 조회 API 데이터에서 떨어지는 값 변환
	// F = "여성"
	// M = "남성"
	// Y = "YES"
	// N = "NO"
	const getGenderType = (genderType) => {
		switch (genderType) {
			case "F":
				return "여성";
			case "M":
				return "남성";
			default:
				return genderType; // 기본값
		}
	};

	const getAnswerType = (answerType) => {
		switch (answerType) {
			case "Y":
				return "YES";
			case "N":
				return "NO";
			default:
				return answerType; // 기본값
		}
	};

	// shampooHabit(샴푸사용 습관) 값만 "YYNY" 떨어져서 배열로 map 사용
	const shampooQuestions = [
		"귀가 후 머리를 감는다.",
		"트리트먼트는 두피에 닿지 않게 모발에만 사용한다.",
		"더 이상 거품이 나오지 않을 때까지 미온수로 휑궈낸다.",
		"뜨겁지 않은 바람으로 두피와 모발을 완전히 건조한다.",
	];
	const shampooAnswers = consultData?.shampooHabit.split("") || [];

	// 샴푸 횟수를 데이터를 (예: "1일1회") 형식화된 문자열로 반환하는 함수
	const getShampooTimes = () => {
		// consultData 객체의 shampooTimes가 없을 경우 빈 문자열 반환
		if (!consultData?.shampooTimes) {
			return "";
		}

		// shampooTimes 문자열을 쉼표(,)로 분리하여 배열로 변환
		const shampooArr = consultData.shampooTimes.split(",");

		// 첫 번째 값(일 수)와 두 번째 값(회 수)을 조합하여 "1일1회" 형식으로 반환
		return `${shampooArr[0]}일${shampooArr[0]}회`;
	};

	// 에디터 컨텐츠 관리
	const handleEditorChange = (content) => {
		setEditorContent(content); // Editor 컴포넌트에서 전달된 값 저장
	};

	// 상품찾기 팝업 오픈
	const handleRecommendPopupOpen = () => {
		setPopData({
			show: true,
			type: "recommend",
			selectedProductList: selectedProductList,
			updateData: productListUpdateData,
		});
	};

	// 상품찾기 팝업에서 데이터 업데이트
	const productListUpdateData = (newData) => {
		console.log("newData", newData);
		/**
		 * 새 데이터를 기존 선택된 상품 리스트에 병합하고 상태를 업데이트합니다.
		 * - 기존 상품 리스트 (`prevList`)
		 * - 새로 추가될 상품 리스트 (`newProducts`)
		 * - 병합 후 최종 업데이트된 리스트 (`updatedList`)
		 */
		setSelectedProductList((prevList) => {
			// prevList는 기존 상품 리스트
			// 기존 리스트와 비교하여 중복되지 않은 상품만 필터링
			const newProducts = newData.filter((newItem) => !prevList.some((item) => item.productCode === newItem.productCode));

			const updatedList = [...prevList, ...newProducts]; // 병합 후 상태 업데이트 (병합 후 업데이트된 상품 리스트)

			// 추천상품이 5개를 초과하면 경고 메시지를 표시하고 기존 상태를 반환
			if (updatedList.length > PROJECT_LIMIT_COUNT) {
				setLmPop({
					show: true,
					type: "alert",
					contents: `추천상품은 ${PROJECT_LIMIT_COUNT}개까지 등록 가능합니다.`,
					success_fun: (hidepop) => {
						hidepop(); // 사용자가 확인 버튼을 누를 때 닫기
					},
				});
				return prevList; // 기존 상태 유지
			}
			return updatedList; // 정상적으로 상태 업데이트
		});
	};

	// 추천상품 삭제 이벤트 핸들러
	const handleDeleteProduct = (productCode) => {
		// productCode 삭제 이벤트 발생 시 삭제할 상품 코
		setSelectedProductList((prevList) => {
			const filteredList = prevList.filter((product) => product.productCode !== productCode);
			// filteredList 삭제 후 업데이트된 상품 리스트
			return filteredList;
		});
	};

	// 상담 답변 productDesc를 업데이트
	// textarea의 값 변경 시 selectedProductList에서 해당 항목의 productDesc를 업데이트하도록 수정
	const handleProductDescChange = (productCode, value) => {
		setSelectedProductList((prevList) =>
			prevList.map((product) => (product.productCode === productCode ? { ...product, productDesc: value } : product))
		);
	};

	// 공개여부 토글 상태 변경 핸들러
	const handleToggle = () => {
		// 현재 상태를 기준으로 새로운 상태(newState) 계산
		const newState = statusData === ExposureStatus.E ? ExposureStatus.H : ExposureStatus.E;
		setStatusData(newState); // 새로운 상태를 임시로 업데이트 (UI 반영)

		const message =
			// 공개 상태에 따른 팝업 메시지 (공개 or 비공개)
			newState === ExposureStatus.E ? "해당 상담글을 공개로 변경하시겠습니까?" : "해당 상담글을 비공개로 변경하시겠습니까?";

		setLmPop({
			show: true,
			type: "confirm",
			contents: message,
			success_fun: (hidePop) => {
				apiPutConsultExposureStatus(consultNo, statusData);
				hidePop(); // 팝업 닫기
			},
			cancel_fun: (hidePop) => {
				setStatusData(statusData); // 상태를 초기값으로 복원 (ex: 원래 비공개였으면 다시 비공개로 복원)
				hidePop(); // 팝업 닫기
			},
		});
	};

	// 상담 답변 수정 팝업
	const handleModifyPopupOpen = () => {
		setLmPop({
			show: true,
			type: "confirm",
			title: "수정된 답변을 회원에게 안내하시겠습니까?",
			contents: (
				<>
					확인: 내용 저장 및 회원안내 진행
					<br />
					취소: 내용 저장 (회원안내 미진행)
				</>
			),
			success_fun: (hidepop) => {
				hidepop(); // 팝업 닫기
				apiPutConsultModify(SendSmsStatus.TRUE); // 확인 버튼 클릭 시 sendSms: "Y"
			},
			cancel_fun: (hidepop) => {
				hidepop(); // 팝업 닫기
				apiPutConsultModify(SendSmsStatus.FASLE); // 취소 버튼 클릭 시 sendSms: "N"
			},
		});
	};

	// 상담 답변 등록 팝업
	const handleSubmitPopupOpen = () => {
		setLmPop({
			show: true,
			type: "confirm",
			contents: "작성한 내용을 등록하시겠습니까?",
			success_fun: () => {
				// 두 번째 팝업 (alert)
				setLmPop({
					show: true,
					type: "alert",
					contents: "등록된 답변이 회원에게 안내됩니다.",
					success_fun: (hidepop) => {
						apiPostConsultSubmit(); // 상담 답변 신규 등록
						hidepop(); // 사용자가 확인 버튼을 누를 때 닫기
					},
				});
			},
			cancel_fun: (hidepop) => {
				hidepop(); // 첫 번째 팝업 닫기
			},
		});
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------
	// 상담 상세 정보 가져오기 (consultNo, currentPage가 변경될 때만 실행)
	useEffect(() => {
		// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
		apiGetConsultDetail();
	}, [consultNo, currentPage]);

	// consultFeedData 처리 (consultFeedData가 변경될 때만 실행)
	useEffect(() => {
		if (consultFeedData) {
			// Editor 초기값 설정
			if (consultFeedData.advice) {
				setEditorContent(consultFeedData.advice);
				// consultFeedData.advice는 에디터에 작성한 최종 내용
			}

			// 추천 상품 설정
			if (consultFeedData.products) {
				setSelectedProductList(consultFeedData.products);
				// consultFeedData.products는 추천상품에 들어있는 상품 리스트 정보
			}
		}
	}, [consultFeedData]);

	return (
		<div className="lm-container consult-wrap">
			{/* 콘텐츠 영역 */}
			<div className="lm-card-wrap">
				<div className="lm-card padding-1">
					<div className="lm-flex-col gap-24">
						<div className="lm-flex justify-between">
							<div>
								<h3 className="lm-text h3">{consultData?.title}</h3>
								<div className="lm-flex items-center gap-12">
									<div className="lm-text body4 lm-gray-2">{maskCustomerId(consultData?.customerId)}</div>
									<div className="lm-line"></div>
									<div className="lm-text body4 lm-gray-2">{consultData?.createAt}</div>
								</div>
							</div>
							<div className="lm-flex items-center gap-6">
								<div className="lm-text body4 lm-gray-2">공개여부</div>
								<button
									className={`lm-toggle-wrap ${statusData === ExposureStatus.E ? "active" : ""}`} // E(공개)일 때 active 클래스 추가
									onClick={handleToggle}
								>
									<div className={`lm-toggle ${statusData === ExposureStatus.E ? "active" : ""}`}>
										<div className="toggle-slider"></div>
									</div>
								</button>
							</div>
						</div>

						<table className="lm-table">
							<tbody>
								{/* 고객 답변 필수값 */}
								<tr>
									<th className="w-120">성별</th>
									<td>
										<div>{getGenderType(consultData?.gender)}</div>
									</td>
									<th className="w-120">나이</th>
									<td>
										<div>{consultData?.age}</div>
									</td>
								</tr>
								<tr>
									<th className="w-120">샴푸사용 습관</th>
									<td colSpan={3}>
										<ul className="lm-flex-col gap-12">
											{shampooQuestions.map((question, index) => (
												<li key={`${question}-${index}`} className="lm-flex items-center gap-16">
													<div className="lm-text body4 lm-gray-2">{question}</div>
													<div className="line-dashed"></div>
													<div className="lm-text title3">{getAnswerType(shampooAnswers[index])}</div>
												</li>
											))}
										</ul>
										<div className="lm-border-top my-24"></div>
										<ul className="lm-flex-col gap-12">
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">샴푸횟수</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{getShampooTimes()}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">샴푸시기</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{consultData?.shampooTime}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">현재 사용 중인 샴푸</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{consultData?.shampooType}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">스타일링제 사용 여부</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{consultData?.usingStylingProduct}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">헤어 시술 여부</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">
													{getAnswerType(consultData?.hairStuff)},{consultData?.hairStuffTimes}
												</div>
											</li>
										</ul>
									</td>
								</tr>
								<tr>
									<th className="w-120">건강정보</th>
									<td colSpan={3}>
										<ul className="lm-flex-col gap-12">
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">건강상태</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{consultData?.healthInfo}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">6개월 이내 다이어트 경험</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{getAnswerType(consultData?.diet)}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">음주 여부</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{getAnswerType(consultData?.alcohol)}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">흡연 여부</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{getAnswerType(consultData?.smoking)}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">출산 여부</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{getAnswerType(consultData?.childbirth)}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">평소 수면 시간</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{consultData?.sleep}</div>
											</li>
										</ul>
									</td>
								</tr>
								{/* !고객 답변 필수값 */}
								{/* 필수값 아님 */}
								<tr>
									<th className="w-120">두피·모발 정보</th>
									<td colSpan={3}>
										<ul className="lm-flex-col gap-12">
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">현재 두피고민</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{consultData?.scalpProblem}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">두피상태 (본인이 생각하는)</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{consultData?.scalpCondition}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">탈모 유전력</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{consultData?.hairLoss}</div>
											</li>
											<li className="lm-flex items-center gap-16">
												<div className="lm-text body4 lm-gray-2">모발상태 (본인이 생각하는)</div>
												<div className="line-dashed"></div>
												<div className="lm-text title3">{consultData?.hairCondition}</div>
											</li>
										</ul>
									</td>
								</tr>
								<tr>
									<th className="w-120">의학정보</th>
									<td colSpan={3}>
										<ul className="lm-flex-col gap-24">
											<li className="lm-flex-col gap-6">
												<div className="lm-text body4 lm-gray-2">공통</div>
												<div className="lm-text title3">{consultData?.medicalInfoGeneral}</div>
											</li>
											<li className="lm-flex-col gap-6">
												<div className="lm-text body4 lm-gray-2">여성만</div>
												<div className="lm-text title3">{consultData?.medicalInfoWomen}</div>
											</li>
										</ul>
									</td>
								</tr>
								{/* 필수값 아님 */}
							</tbody>
						</table>

						<div className="lm-flex-col gap-12">
							<div className="lm-text title3">상담글</div>
							<div>{consultData?.customerComment}</div>
						</div>

						<div className="lm-flex gap-12">
							<div className="lm-img-box">
								<img src={consultData?.imageUrl} alt="" />
							</div>
						</div>
					</div>
				</div>

				<div className="lm-card padding-1">
					<div className="lm-text title2 mb-24">상담사 답변</div>
					<div className="lm-card-top">
						<div className="lm-editor">
							{/* 에디터 컴포넌트 추가 */}
							<Editor onChange={handleEditorChange} value={editorContent} />
						</div>
					</div>
				</div>

				<div className="lm-card padding-1">
					<div className="lm-flex items-center justify-between mb-24">
						<div className="lm-text title2">추천상품</div>
						<button
							className="lm-search-prd lm-text title4 underline"
							onClick={handleRecommendPopupOpen} // 팝업 열기
						>
							상품찾기
						</button>
					</div>
					<div className="lm-card-top">
						{/* 추천상품 목록 렌더링 */}
						<div className="lm-card-top">
							{/* 추천상품 목록 렌더링 */}
							{selectedProductList.length === 0 ? (
								<div className="recommend-prd-empty title4">
									<div className="empty-wrap">
										<div className="empty lm-text-center">
											<img src={iconWarningPath} alt="" className="mb-12" />
											<div>[상품찾기]를 통해 추천상품을 추가해 주세요.</div>
										</div>
									</div>
								</div>
							) : (
								<div className="recommend-prd-wrap lm-flex-col gap-24 mt-24">
									{selectedProductList.map((product, index) => (
										<div className="recommend-prd" key={product.productCode}>
											<div className="lm-flex justify-between">
												<ul className="lm-flex gap-12">
													<li className="lm-text title3">{product.productName}</li>
												</ul>
												<button
													onClick={() => handleDeleteProduct(product.productCode)}
													className="lm-icon lm-icon-close-thin size-20"
												>
													삭제
												</button>
											</div>
											<textarea
												className="w-full lm-textarea"
												value={product.productDesc || ""}
												onChange={(e) => handleProductDescChange(product.productCode, e.target.value)}
											/>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* 사이드 메뉴 */}
			<div className="side-box">
				<div className="btn-box">
					{consultFeedData?.advice ? (
						// 상담사 답변 수정 & 삭제 시
						<div className="lm-flex gap-6">
							<button
								className="lm-button line lm-flex-1"
								// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
								onClick={() => navigate(-1)}
							>
								취소
							</button>
							<button className="lm-button color-black lm-flex-1" onClick={handleModifyPopupOpen}>
								수정
							</button>
						</div>
					) : (
						// 상담사 답변 최초 등록 시 (advice 값이 없을 때)
						<div className="lm-flex gap-6">
							<button
								className="lm-button line lm-flex-1"
								// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
								onClick={() => navigate(-1)}
							>
								취소
							</button>
							<button className="lm-button color-1 lm-flex-1" onClick={handleSubmitPopupOpen}>
								등록
							</button>
						</div>
					)}
				</div>
			</div>

			{/* 추천상품 팝업 */}
			{popData.show && <SearchProductPopup data={popData} setPopData={setPopData} />}
		</div>
	);
};
