// 일반 컨텐츠
// NOTE: bannerType = RB, SB, IC, NP, MB, PB, VD, BB, BS
import { useEffect, useState } from "react";
import { LmAxios } from "@/axios/LmAxios";
import { LmPaging } from "@/components/board/LmPaging";
import { BaseResponse } from "@/utils/BaseResponse";
import { getRowNo } from "@/utils/getRowNo";
import { useNavigate } from "react-router-dom";
import { bannerTypePath, bannerTypeStatus } from "@/constants/bannerType";
import { ContentUsageStatus } from "@/constants/ContentUsageStatus";
import { dateUtils } from "@/utils/dateUtils";
import HOOK_LM_POP from "@/store/hooks/hookPop";

// listData 링크여부: Y || N
const hasLinkStatus = {
	HAS_LINK: "Y",
	NO_LINK: "N",
};

// filter sortType 정렬기준
// CD는 생성일 내림차, CA는 생성일 오름차 순으로 정렬됩니다.
// SD는 노출순서 내림차, SA는 노출순서 오름차 순으로 정렬됩니다.
const generalContentsSortTypeStatus = {
	CREATED_DESC: "CD",
	CREATED_ASC: "CA",
	EXPOSED_DESC: "SD",
	EXPOSED_ASC: "SA",
};

export const ContentsGeneralList = ({ bannerType }) => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------

	//  컨텐츠 리스트, 페이징
	const [listData, setListData] = useState({});
	const [pagingData, setPagingData] = useState({});
	const [currentPage, setCurrentPage] = useState(1);
	// 로딩 상태 추가
	const [isLoading, setIsLoading] = useState(false);
	const { setLmPop } = HOOK_LM_POP(); // 공통 팝업
	const [sortType, setSortType] = useState(generalContentsSortTypeStatus.CREATED_DESC);

	// List Header Setting
	const listHeader = [
		{ text: "NO", class: "contentsMainId no" },
		{ text: "노출순서", class: "sortNum" },
		{ text: "플랫폼", class: "platform" },
		{ text: "제목", class: "title" },
		{ text: "작성일", class: "createAt" },
		{ text: "링크여부", class: "hasLink" },
		{ text: "사용기간", class: "startAtEndAt" },
		{ text: "관리", class: "status" },
	];

	// ---------------------------------------------------------------
	// API
	// ---------------------------------------------------------------

	// 데이터 가져오는 함수
	// 메인콘텐츠 기본 bannerType으로 구분
	const apiGetContentsGeneralList = async (page = currentPage) => {
		try {
			setIsLoading(true); // 로딩 시작
			const res = await LmAxios({
				method: "GET",
				url: "/admin/contents/general",
				params: {
					currentPage: page,
					displayRow: 20,
					bannerType: bannerType,
					sortType: sortType,
				},
			});

			if (res.data.code === BaseResponse.SUCCESS) {
				const { generalContents, paging } = res.data.result;

				// 리스트 데이터 업데이트
				setListData({
					list: generalContents.map((data) => ({
						contentsMainId: data.contentsMainId,
						sortNum: data.sortNum,
						platform: data.platform,
						title: data.title,
						createAt: data.createAt,
						hasLink: data.hasLink,
						startAtEndAt: durationCalculate(data.startAt, data.endAt),
						status: data.status, // 사용여부 Y: 사용, N: 미사용, D: 삭제
					})),
				});

				// 페이징 데이터 업데이트
				setPagingData({
					totalCount: paging.totalCount,
					totalPage: paging.totalPage,
					displayRow: paging.displayRow,
					currentPage: paging.currentPage,
				});
			} else {
				console.error("generalContents API 호출 실패: 예상하지 못한 응답", res.data);
			}
		} catch (error) {
			console.error("generalContents API 호출 실패:", error);
		} finally {
			setIsLoading(false); // 로딩 종료
		}
	};

	// 일반 컨텐츠 노출 여부 수정 api
	const apiPutContentsGeneralUse = async (contentId) => {
		try {
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/contents/general/${contentId}/use`,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				apiGetContentsGeneralList();
			}
		} catch (error) {
			console.error("apiPutContentsGeneralUse API 호출 실패:", error);
		}
	};

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	//  컨텐츠 Data 페이지 변경 핸들러
	const handlePageChange = (page) => {
		if (page > 0 && pagingData?.totalPage && page <= pagingData.totalPage) {
			setCurrentPage(page); // 현재 페이지 상태 업데이트
			apiGetContentsGeneralList(page); // 새로운 페이지 데이터 로드
		}
	};

	// 사용여부 버튼 클릭 이벤트
	const handleUseBtnClick = (contentId, use) => {
		const contentsText = use === "Y" ? "비공개" : "공개";

		setLmPop({
			show: true,
			type: "confirm",
			contents: `해당 콘텐츠를 ${contentsText}로 변경하시겠습니까?`,
			success_fun: (hidepop) => {
				apiPutContentsGeneralUse(contentId);
				hidepop();
			},
		});
	};

	// 정렬 필터링
	const handleSortChange = (className) => {
		console.log("111", className);

		setSortType((prevSortType) => {
			if (className === "sortNum") {
				// 노출순서
				return prevSortType === generalContentsSortTypeStatus.EXPOSED_DESC
					? generalContentsSortTypeStatus.EXPOSED_ASC
					: generalContentsSortTypeStatus.EXPOSED_DESC;
			}
			if (className === "createAt") {
				// 생성일 (사용/미사용 전환일)
				return prevSortType === generalContentsSortTypeStatus.CREATED_DESC
					? generalContentsSortTypeStatus.CREATED_ASC
					: generalContentsSortTypeStatus.CREATED_DESC;
			}
			return prevSortType;
		});
	};

	// ---------------------------------------------------------------
	// private methods
	// ---------------------------------------------------------------

	// 페이지 이동
	const navigate = useNavigate();
	const path = bannerTypePath[bannerType]; // bannerType에 해당하는 path 가져오기

	// 등록페이지지
	const handleNavigateWrite = () => {
		navigate(`/contents/${path}/write/?currentPage=${pagingData.currentPage}`);
	};

	// 수정페이지
	const handleNavigateModify = (contentsMainId) => {
		navigate(`/contents/${path}/modify/${contentsMainId}?currentPage=${pagingData.currentPage}`);
	};

	// 사용기간 계산
	const durationCalculate = (startAt, endAt) => {
		// 시작날짜와 종료날짜가 모두 없을 경우 빈 문자열 return
		if (!startAt && !endAt) return "";

		return `${startAt || ""} ~ ${endAt || ""}`;
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------

	// 초기 데이터 로드
	useEffect(() => {
		apiGetContentsGeneralList();
	}, [bannerType, currentPage, sortType]); // currentPage 변경 시 데이터 로드

	return (
		<div className="lmConsultListWrap consult-wrap">
			<div className="lm-panel lm-panel-listpage contentsListPanelWrap">
				<div className="lm-panel-title">
					<div className="title">{bannerTypeStatus[bannerType]}</div>
					<div className="filter"></div>
					<button className="register-button" onClick={() => handleNavigateWrite()}>
						콘텐츠 등록
					</button>
				</div>
				<div className="total">총 {pagingData?.totalCount}건</div>

				{/*  리스트 데이터를 렌더링 */}
				{listData ? (
					<table className="lm-board-basic contentsTableBoardWrap">
						<thead>
							<tr>
								{listHeader.map((item, index) => (
									<th key={index} className={item.class}>
										{item.text}
										{(item.class === "sortNum" || item.class === "createAt") && (
											<span
												className="lm-icon-list-filter-arrow size-8 "
												onClick={() => handleSortChange(item.class)}
												style={{
													transform:
														(item.class === "sortNum" &&
															sortType === generalContentsSortTypeStatus.EXPOSED_ASC) ||
														(item.class === "createAt" &&
															sortType === generalContentsSortTypeStatus.CREATED_ASC)
															? "rotate(180deg)"
															: "rotate(0deg)",
												}}
											/>
										)}
									</th>
								))}
							</tr>
						</thead>
						<thead style={{ height: "12px" }}>
							<tr></tr>
						</thead>
						<tbody>
							{listData.list?.length > 0 ? (
								listData.list.map((item, index) => (
									<tr key={index}>
										<td className="no num-or-eng">
											<span>{getRowNo(pagingData, currentPage, index)}</span>
										</td>
										<td className="member-name num-or-eng">{item.sortNum}</td>
										<td className="member-name num-or-eng">{item.platform.replace(/,/g, "/")}</td>
										<td className="member-name link-text" onClick={() => handleNavigateModify(item.contentsMainId)}>
											<div className="lm-text-ellipsis w-308 table">{item.title}</div>
										</td>
										<td className="temporary num-or-eng">{dateUtils.dateFormat(item.createAt)}</td>
										<td className="member-name num-or-eng">{item.hasLink === hasLinkStatus.HAS_LINK ? "O" : "X"}</td>
										<td className="member-name num-or-eng">{item.startAtEndAt}</td>
										<td className="status-button">
											<button
												className={
													item.status === ContentUsageStatus.USED
														? "status-button-active"
														: "status-button-inactive"
												}
												onClick={() => {
													handleUseBtnClick(item.contentsMainId, item.status);
												}}
											>
												<span>{item.status === ContentUsageStatus.USED ? "사용" : "미사용"}</span>
											</button>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={listHeader?.length} className="no-results">
										검색된 상담글이 없습니다.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				) : (
					<div className="lm-loader-10"></div>
				)}

				{/*  페이지네이션 컴포넌트 */}
				{pagingData && pagingData.totalPage >= 0 && (
					<LmPaging
						data={{
							...pagingData,
							currentPage,
						}}
						onPageChange={handlePageChange}
					/>
				)}
			</div>
		</div>
	);
};
