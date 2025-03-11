// 상담글 관리의 상담 답변 상세 컴포넌트 (상담글 관리)
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { LmAxios } from "@/axios/LmAxios";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import SearchProductPopup from "@/components/popup/SearchProductPopup"; // 추천상품 팝업
import { BaseResponse } from "@/utils/BaseResponse"; // api 서버 통신 응답
import { maskCustomerId } from "@/utils/maskCustomerId"; // ID 마스크 함수
// TODO decodeHtmlString 에서 string기능을 하는 함수는 합쳐서 utils에 따로 만들건지 다같이 논의 하기
import { decodeHtmlString } from "@/utils/decodeHtmlString"; // HTML 엔티티(코드화된 문자열)를 일반 HTML 텍스트로 변환하는 (디코딩) 함수

// 공개여부
const ExposureStatus = {
	E: "E", // 공개
	H: "H", // 비공개
	D: "D" // 삭제 된 상태
};

export const ConsultView = () => {
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
			console.error("apiPutConsultExposureStatus API 호출 오류:", error);
		}
	};

	// 상담 답변 삭제 API
	const apiDeleteConsult = async () => {
		try {
			const res = await LmAxios({
				method: "DELETE",
				url: `/admin/consult/${consultNo}`,
			});
			if (res.data.code !== BaseResponse.SUCCESS) {
				console.error("apiDeleteConsult API 실패:", res.data.message);
			}
		} catch (error) {
			console.error("apiDeleteConsult API 호출 실패:", error);
		}
	};

	// 상담 답변 삭제 팝업
	const handleDeletePopupOpen = () => {
		setLmPop({
			show: true,
			type: "confirm",
			contents: "해당 상담글을 삭제하시겠습니까?",
			success_fun: () => {
				apiDeleteConsult(); // 상담 답변 삭제
				// 두 번째 팝업 (alert)
				setLmPop({
					show: true,
					type: "alert",
					contents: "해당 상담글이 삭제되었습니다.",
					success_fun: (hidepop) => {
						hidepop(); // 사용자가 확인 버튼을 누를 때 닫기
						// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
						navigate(-1); // 리스트로 가기
					},
				});
			},
			cancel_fun: (hidepop) => {
				hidepop(); // 팝업 닫기
			},
		});
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
				setEditorContent(decodeHtmlString(consultFeedData.advice)); // HTML 텍스트 디코딩
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

							{/* 삭제된 글 일 경우 공개여부 토글 안보이게 */}
							{statusData === ExposureStatus.D ? (
								<div className="lm-flex items-center gap-6 displaynone"></div>
							) : (
								<div className="lm-flex items-center gap-6 ">
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
							)}
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

				{/* 상담사 답변이 있으면 해당영역 보이게 */}
				{consultFeedData?.advice ? (
					<div className="lm-card padding-1 lm-advice-wrap">
						<div className="lm-text title2 mb-4">상담사 답변</div>
						<div className="lm-flex items-center gap-12">
							<div className="lm-text body4 lm-gray-2">
								<span>{consultFeedData?.consultantName}</span> /{" "}
								<span>{maskCustomerId(consultFeedData?.consultantId)}</span>
							</div>
							<div className="lm-line"></div>
							<div className="lm-text body4 lm-gray-2">{consultFeedData?.createAt}</div>
						</div>
						<div className="lm-card-top my-24"></div>
						<div className="lm-editor-text">
							<div className="p-12 mb-24">
								<div dangerouslySetInnerHTML={{ __html: editorContent }}></div>
							</div>
							{/* 추천상품 목록 렌더링 */}
							{selectedProductList.length === 0 ? (
								<ul className="recommend-prd-view displaynone"></ul>
							) : (
								<ul className="recommend-prd-view">
									{selectedProductList.map((product) => (
										<li className="lm-flex-col gap-6" key={product.productCode}>
											<div className="lm-text title3">{product.productName}</div>
											<div>{product.productDesc}</div>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				) : (
					// 상담사 답변이 없을 때는 해당영역 안보이게
					<div className="lm-advice-wrap displaynone"></div>
				)}
			</div>

			{/* 사이드 메뉴 */}
			<div className="side-box">
				<div className="btn-box">
					{/* 삭제된 글 일 경우 목록 버튼만 보이게 */}
					{statusData === ExposureStatus.D ? (
						<div className="lm-flex-col gap-6">
							<div className="lm-flex gap-6">
								<button
									className="lm-button line lm-flex-1"
									// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
									onClick={() => navigate(-1)}
								>
									목록
								</button>
							</div>
						</div>
					) : (
						<div className="lm-flex-col gap-6">
							<div className="lm-flex gap-6">
								<button
									className="lm-button line lm-flex-1"
									// TODO 목록 돌아가기시 필터 값에 따른 페이지 유지 기능 추가
									onClick={() => navigate(-1)}
								>
									목록
								</button>
								<button
									className="lm-button line lm-flex-1 color-4"
									// onClick={handleModifyPopupOpen}
									onClick={() => handleDeletePopupOpen()}
								>
									삭제
								</button>
							</div>
							<button
								className="lm-button color-black lm-flex-1"
								// onClick={handleModifyPopupOpen}
								onClick={() => navigate(`/counsel/modify/${consultNo}?currentPage=${currentPage}`)}
							>
								수정
							</button>
						</div>
					)}
				</div >
			</div >

			{/* 추천상품 팝업 */}
			{popData.show && <SearchProductPopup data={popData} setPopData={setPopData} />}
		</div >
	);
};
