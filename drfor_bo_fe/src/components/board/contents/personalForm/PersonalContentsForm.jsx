// 개인화 추천 상품 등록/수정
import { LmAxios } from "@/axios/LmAxios";
import SearchProductPopup from "@/components/popup/SearchProductPopup";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { useNavigate, useParams } from "react-router-dom";
import { BaseResponse } from "@/utils/BaseResponse";
import { isEmpty } from "@/utils/validationUtils";
import { useEffect, useState } from "react";
import { textUtils } from "@/utils/textUtils";

export const PersonalContentsForm = () => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { contentNo } = useParams(); // URL 경로 파라미터에서 contentNo 가져오기 데이터를 관리하는 상태
	const navigate = useNavigate();
	const { setLmPop } = HOOK_LM_POP();
	const [userGroupList, setUserGroupList] = useState([]);
	const [formData, setFormData] = useState({
		groupNo: "", // 그룹번호
		groupName: "", // 그룹네임
		exposureCount: "", // 제목
		status: "N", // 사용여부
	});
	const [popData, setPopData] = useState({}); // 팝업 데이터를 관리하는 상태
	const [errorMsg, setErrorMsg] = useState(""); // 에러 메세지 상태
	const [selectedProductList, setSelectedProductList] = useState([]); // 선택된 상품
	// ---------------------------------------------------------------
	// Api
	// ---------------------------------------------------------------
	// 유저 그룹 불러오기
	const apiGetUserGrade = async () => {
		await LmAxios({
			method: "GET",
			url: "/admin/user/group/",
			params: {
				displayRow: 100,
				currentPage: 1,
			},
		})
			.then((res) => {
				if (res.data.code === BaseResponse.SUCCESS) {
					setUserGroupList(res.data.result?.userGroup);
				}
			})
			.catch((error) => {
				console.error("apiGetUserGrade API 호출 실패:", error);
			});
	};

	// 개인화 추천상품 등록 api
	const apiPostPersonalProductWrite = async (data) => {
		try {
			const res = await LmAxios({
				method: "POST",
				url: "/admin/contents/product",
				data: {
					groupNo: formData.groupNo,
					groupName: formData.groupName,
					exposureCount: formData.exposureCount,
					// promotionImage: "",
					// promotionImageName: "",
					status: formData.status,
					recommendProducts: selectedProductList,
				},
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setLmPop({
					show: true,
					type: "alert",
					contents: "콘텐츠가 등록되었습니다.",
					success_title: "확인",
					success_fun: (hidepop) => {
						hidepop();
						navigate("/contents/shop/main/product/personal");
					},
				});
			}
		} catch (error) {
			console.error("apiPostPersonalProductWrite API 호출 실패:", error);
		}
	};

	// 개인화 상품 상세 조회 api
	const apiGetPersonalProductView = async () => {
		try {
			const res = await LmAxios({
				method: "GET",
				url: `/admin/contents/product/${contentNo}`,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setFormData(res.data.result);
				setSelectedProductList(res.data.result.recommendProductList);
			}
		} catch (error) {
			console.error("개인화 상품 상세 조회 API 호출 실패:", error);
		}
	};

	// 개인화 상품 컨텐츠 삭제 API
	const apiDeletePersonalProduct = async () => {
		try {
			const res = await LmAxios({
				method: "DELETE",
				url: `/admin/contents/product/${contentNo}`,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setLmPop({
					show: true,
					type: "alert",
					contents: "콘텐츠가 삭제되었습니다.",
					success_fun: (hidepop) => {
						hidepop();
						navigate("/contents/shop/main/product/personal");
					},
				});
			}
			return;
		} catch (error) {
			console.error("회원등급 삭제 API 호출 실패:", error);
		}
	};

	// 개인화 상품 컨텐츠 수정 API
	const apiPutPersonalProduct = async () => {
		try {
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/contents/product/${contentNo}`,
				data: {
					groupNo: formData.groupNo,
					groupName: formData.groupName,
					exposureCount: formData.exposureCount,
					// promotionImage: "",
					// promotionImageName: "",
					status: formData.status,
					recommendProducts: selectedProductList,
				},
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setLmPop({
					show: true,
					type: "alert",
					contents: "콘텐츠가 수정되었습니다.",
					success_fun: (hidepop) => {
						hidepop();
						navigate("/contents/shop/main/product/personal");
					},
				});
			}
			return;
		} catch (error) {
			console.error("회원등급 삭제 API 호출 실패:", error);
		}
	};
	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------
	// 등록 버튼 클릭
	const handleWriteBtnClick = () => {
		// 회원등급
		if (isEmpty(formData.groupNo)) {
			setErrorMsg("그룹을 선택해주세요.");
			return;
		}

		// 노출갯수
		if (isEmpty(formData.exposureCount)) {
			setErrorMsg("노출갯수를 입력해주세요.");
			return;
		}

		// groupNo와 일치하는 userGroupName 찾기
		const matchingGrade = userGroupList.find((item) => item.userGroupNo === Number(formData.groupNo));

		if (matchingGrade) {
			formData.groupName = matchingGrade.userGroupName;
		} else {
			formData.groupName = ""; // 매칭되는 값이 없으면 빈 문자열로 설정
		}

		// 등록 팝업 띄우기
		setLmPop({
			show: true,
			type: "confirm",
			contents: "콘텐츠를 등록하시겠습니까?",
			success_title: "등록",
			success_fun: () => {
				apiPostPersonalProductWrite(formData);
			},
		});
	};

	// 회원그룹 Change
	const handleUserGroupChange = (e) => {
		const { name, value } = e.target;

		// formData 업데이트
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// input Change
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		// 노출상품개수에서 숫자가 아닌 경우 리턴
		if (name === "exposureCount" && value !== textUtils(value, ["num"])) {
			return;
		}

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// 팝업 버튼 클릭 이벤트
	const handleProductPopupOpen = () => {
		setPopData({
			show: true,
			type: "recommend",
			selectedProductList: selectedProductList,
			updateData: updateProductListState,
		});
	};

	// 선택 상품 삭제 버튼 이벤트
	const handleDeleteProduct = (code) => {
		setSelectedProductList((prev) => prev.filter((item) => item.productCode !== code));
	};

	// 컨텐츠 삭제 팝업 이벤트
	const handleDeletePersonalCotents = () => {
		setLmPop({
			show: true,
			type: "confirm",
			contents: "해당 콘텐츠를 삭제하시겠습니까?",
			success_fun: () => apiDeletePersonalProduct(),
		});
	};

	console.log("formData", formData);

	// 컨텐츠 수정 팝업 이벤트
	const handleModifyPersonalCotents = () => {
		// 회원등급
		if (isEmpty(formData.groupNo)) {
			setErrorMsg("그룹을 선택해주세요.");
			return;
		}

		// 노출갯수
		if (isEmpty(formData.exposureCount)) {
			setErrorMsg("노출갯수를 입력해주세요.");
			return;
		}

		//TODO - groupName제거 예정
		// groupNo와 일치하는 userGroupName 찾기
		const matchingGrade = userGroupList.find((item) => item.userGroupNo === Number(formData.groupNo));

		if (matchingGrade) {
			formData.groupName = matchingGrade.userGroupName;
		} else {
			formData.groupName = ""; // 매칭되는 값이 없으면 빈 문자열로 설정
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: "콘텐츠를 수정하시겠습니까?",
			success_fun: () => apiPutPersonalProduct(contentNo),
		});
	};
	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------
	// 초기 렌더링
	useEffect(() => {
		// 회원 그룹 리스트 조회
		apiGetUserGrade();

		// 수정페이지일 경우 개인화 상품 상세 조회
		if (!contentNo) return;
		apiGetPersonalProductView();
	}, []);

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

	// ---------------------------------------------------------------
	// private methods
	// ---------------------------------------------------------------
	// 상품찾기 팝업에서 대상 상품 업데이트
	// newProductData -> 상품찾기 팝업 선택 데이터
	const updateProductListState = (newProductData) => {
		// 새로운 상품 데이터를 기존 리스트에 병합
		setSelectedProductList((prevList) => {
			const newProducts = newProductData.filter(
				(newItem) => !prevList.some((item) => item.productCode === newItem.productCode)
			);

			const updatedList = [...prevList, ...newProducts]; // 병합 후 상태 업데이트

			return updatedList; // 정상적으로 상태 업데이트
		});
	};

	return (
		<div className="lm-container contents-wrap">
			{/* 컨텐츠 영역 */}
			<div className="lm-card-wrap">
				<div className="lm-card padding-1">
					<div className="lm-title-box">
						<div className="lm-text title2 mb-12">SHOP메인 개인화 추천상품</div>
					</div>
					<table className="lm-table">
						<tbody>
							<tr>
								<th>회원그룹</th>
								<td>
									<select
										name="groupNo"
										value={formData.groupNo}
										className="lm-select"
										onChange={handleUserGroupChange}
									>
										<option value="">[선택] 회원그룹</option>
										{userGroupList.length > 0 &&
											userGroupList.map((item) => (
												<option key={item.userGroupId} value={item.userGroupNo}>
													{item.userGroupName}
												</option>
											))}
									</select>
								</td>
							</tr>
							<tr>
								<th>대상상품</th>
								<td>
									<div>
										<button className="lm-product-button-pop mb-4" onClick={handleProductPopupOpen}>
											상품찾기
										</button>

										<ul className="product-list">
											{selectedProductList?.map((item, index) => (
												<li
													key={item.productCode}
													onClick={() => handleDeleteProduct(item.productCode)}
												>
													{item.productCode}{" "}
													<span className="lm-icon-close-gray color-5"></span>
												</li>
											))}
										</ul>
									</div>
								</td>
							</tr>
							<tr>
								<th>노출상품개수</th>
								<td>
									<input
										type="text"
										name="exposureCount"
										className="lm-input"
										placeholder="숫자만 입력"
										value={formData.exposureCount}
										onChange={handleInputChange}
									/>
								</td>
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
						</tbody>
					</table>
				</div>
			</div>
			{/* 사이드 메뉴 */}
			<div className="side-box">
				<div className="btn-box">
					{!contentNo ? (
						<div className="lm-flex gap-6">
							<button className="lm-button line lm-flex-1" onClick={() => navigate(-1)}>
								취소
							</button>
							<button className="lm-button color-1 lm-flex-1" onClick={handleWriteBtnClick}>
								등록
							</button>
						</div>
					) : (
						<>
							<div className="lm-flex gap-6">
								<button className="lm-button line lm-flex-1" onClick={() => navigate(-1)}>
									취소
								</button>
								<button
									className="lm-button line font-color-4 lm-flex-1 "
									onClick={handleDeletePersonalCotents}
								>
									삭제
								</button>
							</div>
							<button className="lm-button w-full mt-6 color-black" onClick={handleModifyPersonalCotents}>
								수정
							</button>
						</>
					)}
				</div>
			</div>

			{/* 추천상품 팝업 */}
			{popData.show && <SearchProductPopup data={popData} setPopData={setPopData} />}
		</div>
	);
};
