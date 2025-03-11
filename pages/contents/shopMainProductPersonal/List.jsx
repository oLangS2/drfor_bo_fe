// SHOP메인 개인화 추천상품
import { useEffect, useState } from "react";
import { LmAxios } from "@/axios/LmAxios";
import { LmPaging } from "@/components/board/LmPaging";
import { BaseResponse } from "@/utils/BaseResponse";
import { getRowNo } from "@/utils/getRowNo";
import { useNavigate } from "react-router-dom";
import HOOK_LM_POP from "@/store/hooks/hookPop";

// 개인화 추천상품 사용여부
const ProductPersonalStatus = {
	FASLE: "N",
	TRUE: "Y",
};

export const ShopMainProductPersonalList = () => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { setLmPop } = HOOK_LM_POP();
	//  컨텐츠 리스트, 페이징
	const [listData, setListData] = useState({});
	const [pagingData, setPagingData] = useState({});
	const [currentPage, setCurrentPage] = useState(1);
	// 로딩 상태 추가
	const [isLoading, setIsLoading] = useState(false);

	// List Header Setting
	const listHeader = [
		{ text: "NO", class: "contentsRecommendProductId no" },
		{ text: "그룹", class: "groupName" },
		{ text: "대상상품", class: "productCount" },
		{ text: "노출상품", class: "exposureCount" },
		{ text: "관리", class: "status" },
	];

	// ---------------------------------------------------------------
	// API
	// ---------------------------------------------------------------

	// 데이터 가져오는 함수
	const apiGetContentsProductList = async (page = currentPage) => {
		try {
			setIsLoading(true); // 로딩 시작
			const res = await LmAxios({
				method: "GET",
				url: "/admin/contents/product",
				params: {
					currentPage: page,
					displayRow: 20,
				},
			});

			if (res.data.code === BaseResponse.SUCCESS) {
				const { contentsRecommendedProducts, paging } = res.data.result;

				// 리스트 데이터 업데이트
				setListData({ ...listData, list: contentsRecommendedProducts });

				// 페이징 데이터 업데이트
				setPagingData({
					totalCount: paging.totalCount,
					totalPage: paging.totalPage,
					displayRow: paging.displayRow,
					currentPage: paging.currentPage,
				});
			} else {
				console.error("contentsRecommendedProducts API 호출 실패: 예상하지 못한 응답", res.data);
			}
		} catch (error) {
			console.error("contentsRecommendedProducts API 호출 실패:", error);
		} finally {
			setIsLoading(false); // 로딩 종료
		}
	};

	// 개인화 추천 상품 사용 여부 수정 API
	const apiPutProductPersonalUse = async (contentsRecommendProductId) => {
		try {
			const res = await LmAxios({
				method: "PATCH",
				url: `/admin/contents/product/${contentsRecommendProductId}/use`,
			});
			return res.data;
		} catch (error) {
			console.error("회원그룹 사용 여부 수정 API 호출 실패:", error);
		}
	};

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	// 컨텐츠 Data 페이지 변경 핸들러
	const handlePageChange = (page) => {
		if (page > 0 && pagingData?.totalPage && page <= pagingData.totalPage) {
			setCurrentPage(page); // 현재 페이지 상태 업데이트
			apiGetContentsProductList(page); // 새로운 페이지 데이터 로드
		}
	};

	// 개인화 추천상품 사용 여부 수정
	const handleProductPersonalUseModify = (rowData) => {
		let useType = "미사용";
		if (rowData.status === ProductPersonalStatus.FASLE) {
			useType = "사용";
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: `해당 콘텐츠를 ${useType}으로 변경하시겠습니까?`,
			success_fun: async (hidepop) => {
				try {
					const res = await apiPutProductPersonalUse(rowData.contentsRecommendProductId);
					if (res.code === BaseResponse.SUCCESS) {
						hidepop();
						apiGetContentsProductList();
					}
				} catch (error) {
					console.error("회원그룹 사용 여부 수정 API 호출 실패:", error);
				}
			},
		});
	};

	// ---------------------------------------------------------------
	// private methods
	// ---------------------------------------------------------------

	// 페이지 이동
	const navigate = useNavigate();

	const handleNavigateWrite = () => {
		navigate(`/contents/shop/main/product/personal/write/?currentPage=${pagingData.currentPage}`);
	};

	const handleNavigateModify = (contentsRecommendProductId) => {
		navigate(
			`/contents/shop/main/product/personal/modify/${contentsRecommendProductId}?currentPage=${pagingData.currentPage}`
		);
	};

	// 개인화 추천상품 status 값에 따른 버튼 매핑
	const getButtonClass = (status) => {
		return `status-button-${status === ProductPersonalStatus.FASLE ? "inactive" : "active"}`;
	};

	const getButtonText = (status) => {
		return status === ProductPersonalStatus.FASLE ? "미사용" : "사용";
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------

	// 초기 데이터 로드
	useEffect(() => {
		apiGetContentsProductList();
	}, [currentPage]); // currentPage 변경 시 데이터 로드

	return (
		<div className="lmConsultListWrap consult-wrap">
			<div className="lm-panel lm-panel-listpage contentsListPanelWrap">
				<div className="lm-panel-title">
					<div className="title">SHOP메인 개인화 추천상품</div>
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
										<td
											className="member-name link-text"
											onClick={() => handleNavigateModify(item.contentsRecommendProductId)}
										>
											{item.groupName}
										</td>
										<td className="member-name num-or-eng">{item.productCount}</td>
										<td className="member-name num-or-eng">{item.exposureCount}</td>
										<td className="status-button">
											<button
												className={getButtonClass(item.status)}
												onClick={() => handleProductPersonalUseModify(item)}
											>
												{getButtonText(item.status)}
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
