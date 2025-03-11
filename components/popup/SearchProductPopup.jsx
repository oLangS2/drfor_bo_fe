import { useEffect, useRef, useState } from "react";
import { LmAxios } from "@/axios/LmAxios";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import iconWarningPath from "@/assets/img/icon/icon-warning.svg";
import { BaseResponse } from "@/utils/BaseResponse"; // api 서버 통신 응답
import { LmPaging } from "@/components/board/LmPaging"; // 페이지네이션 공통 컴포넌트

const SearchProductPopup = ({ data, setPopData }) => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { setLmPop } = HOOK_LM_POP(); // 공통팝업 Hook
	const searchInputRef = useRef(); // 상품명 또는 상품코드 입력 input
	const [searchResultList, setSearchResultList] = useState([]); // 검색 결과 상품 리스트 상태
	const displayRow = 10; // 1페이지 당 10개 상품
	const [pagingData, setPagingData] = useState({
		currentPage: 1, // 현재 페이지
		totalCount: 0, // 검색된 상품의 전체 개수
		totalPage: 1, // 전체 페이지 수
	});

	let checkList = []; // 체크된 상품 리스트
	let allChecked = false; // 전체 체크 버튼 클릭 되었는지

	// ---------------------------------------------------------------
	// Api
	// ---------------------------------------------------------------

	// 상품 검색
	const getSearchProductList = async () => {
		await LmAxios({
			method: "GET",
			url: "/admin/product/cafe24",
			params: {
				displayRow,
				currentPage: pagingData.currentPage,
				keyword: searchInputRef.current.value,
			},
		}).then((res) => {
			if (res.data.code === BaseResponse.SUCCESS) {
				setSearchResultList(res.data.result.products);
				setPagingData({
					currentPage: res.data.result.paging.currentPage,
					totalCount: res.data.result.paging.totalCount,
					totalPage: res.data.result.paging.totalPage,
				});
				checkList = [];
			}
		});
	};

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	// input에서 enter 키 입력시
	const handleKeyDown = (event) => {
		if (event.key === "Enter") getSearchProductList();
	};

	// 페이지네이션
	const handlePageChange = (pageNumber) => {
		if (pageNumber > 0 && pageNumber <= pagingData.totalPage)
			setPagingData({
				...pagingData,
				currentPage: pageNumber,
			});
	};

	// 팝업 닫기 이벤트
	const handleCloseProductPopup = () => {
		setPopData((prev) => ({
			...prev,
			show: false,
		}));
	};

	// 전체 체크
	const handleAllCheckItems = () => {
		if (allChecked) {
			checkList = []; // 모든 체크 해제
		} else {
			checkList = [...searchResultList]; // 모든 체크
		}
		allChecked = !allChecked;
		updateCheckBoxStates();
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------

	// 상품 리스트 불러오기
	useEffect(() => {
		getSearchProductList();
	}, [pagingData.currentPage]);

	// ---------------------------------------------------------------
	// private methods
	// ---------------------------------------------------------------

	// 전체 체크 상태 업데이트
	const updateAllCheckedStatus = () => {
		allChecked = checkList.length === searchResultList.length;
	};

	// 체크 시에 배열에 추가 로직
	const handleCheckItem = (item) => {
		const isChecked = checkList.some(
			(checkedItem) => checkedItem.product_code === item.product_code
		);
		if (isChecked) {
			checkList = checkList.filter(
				(checkedItem) => checkedItem.product_code !== item.product_code
			);
		} else {
			checkList.push(item);
		}
		updateAllCheckedStatus();
		updateCheckBoxStates();
		// 전체 체크 상태 업데이트
	};

	// // 전체 체크박스 상태 업데이트
	const updateCheckBoxStates = () => {
		// 전체 체크박스의 체크 상태 업데이트
		const allCheckBox = document.querySelector(".lm-allChk");
		if (allCheckBox) {
			allCheckBox.checked = allChecked;
		}

		// 각 개별 체크박스의 체크 상태 업데이트
		searchResultList.forEach((item) => {
			const checkBox = document.querySelector(`#checkbox-${item.product_code}`);
			if (checkBox) {
				checkBox.checked = checkList.some(
					(checkedItem) => checkedItem.product_code === item.product_code
				);
			}
		});
	};

	const newSuccessFunc = () => {
		if (checkList.length === 0) {
			setLmPop({
				show: true,
				title: `상품검색`,
				contents: <>선택된 상품이 없습니다.</>,
			});
			return;
		}

		let newArr = [...data.selectedProductList];
		checkList.forEach((item) => {
			if (newArr.some((el) => el.productCode === item.product_code)) {
				newArr = newArr.map((el) => {
					if (el.productCode === item.product_code) {
						return {
							...el,
							[data.type]: "Y",
						};
					} else {
						return el;
					}
				});
			} else {
				newArr.push({
					productCode: item.product_code,
					thumbnail: item.small_image,
					productName: item.product_name,
					productNo: item.product_no,
				});
			}
		});

		data.updateData(newArr);
		handleCloseProductPopup();
	};

	return (
		<div className="lm-pop new-search">
			<div className="lm-pop-inner show">
				<div
					className={`lm-pop-container active`}
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<div
						className="lm-pop-title"
						dangerouslySetInnerHTML={{
							__html: "상품검색",
						}}
					/>

					<button
						className="lm-close"
						onClick={() => {
							handleCloseProductPopup();
						}}
					/>

					<div className="lm-pop-contents">
						<div className="consulting-write-wrap pop-col search-item">
							<div className="lm-card info-area text-left lm-flex-col w-full">
								<div className="lm-flex mb-24">
									<div className="lm-search-wrap input-box w-full">
										<input
											className="lm-input"
											ref={searchInputRef}
											type="text"
											onKeyDown={handleKeyDown}
											placeholder="상품명 또는 상품코드"
										/>
										<button
											className="lm-search-btn"
											onClick={getSearchProductList}
										></button>
									</div>
								</div>

								{searchResultList.length !== 0 ? (
									<div className="list-table-wrap">
										<table className="list-table lm-table">
											<thead>
												<tr>
													<th>
														<div className="lm-checkbox">
															<input
																className="lm-allChk"
																type="checkbox"
																onClick={handleAllCheckItems}
															/>
														</div>
													</th>
													<th>NO</th>
													<th>자체상품코드</th>
													<th className="lm-text-center">상품명</th>
													<th>상품번호</th>
												</tr>
											</thead>
											<tbody>
												{searchResultList.map((item, index) => (
													<tr key={item.product_code}>
														<td>
															<div className="lm-checkbox">
																<input
																	type="checkbox"
																	id={`checkbox-${item.product_code}`}
																	onClick={() => {
																		handleCheckItem(item);
																	}}
																/>
															</div>
														</td>
														<td className="lm-text-center">
															{index + 1}
														</td>
														<td>{item.product_code}</td>
														<td className="lm-flex items-center gap-12">
															<div className="lm-text-ellipsis w-300">
																{item.product_name}
															</div>
														</td>
														<td>{item.product_no}</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<div className="no-prd">
										<img src={iconWarningPath} alt="" />
										<p>상품이 없습니다.</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* 페이지네이션 컴포넌트 */}
					{pagingData && pagingData.totalPage >= 0 && (
						<LmPaging
							data={{
								...pagingData,
								currentPage: pagingData.currentPage,
							}}
							onPageChange={handlePageChange}
							className="border-none" // 공통 LmPaging 에서 테두리 스타일 제거한 스타일
						/>
					)}

					<div className={`lm-pop-bt-wrap`}>
						<button
							className="lm-pop-bt-cancle w-80 h-40"
							onClick={() => {
								handleCloseProductPopup();
							}}
							dangerouslySetInnerHTML={{
								__html: "취소",
							}}
						/>

						<button
							className="lm-pop-bt-choice w-80 h-40"
							onClick={() => {
								newSuccessFunc();
							}}
							dangerouslySetInnerHTML={{
								__html: "선택",
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SearchProductPopup;
