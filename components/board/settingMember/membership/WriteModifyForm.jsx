import { textUtils } from "@/utils/textUtils";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { BaseResponse } from "@/utils/BaseResponse";
import { LmAxios } from "@/axios/LmAxios";
import { isEmpty } from "@/utils/validationUtils";
import { getRowNo } from "@/utils/getRowNo";

// 유로멤버십 등록/수정 컴포넌트
export const WriteModifyForm = () => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const navigate = useNavigate();
	const { setLmPop } = HOOK_LM_POP();
	const { membershipId } = useParams();
	const [errorMsg, setErrorMsg] = useState(""); // 에러 메세지 상태
	const [formData, setFormData] = useState({
		productCode: "",
		grade: "",
		accumulateMoney: "",
		coupon: "",
		status: "N",
	});
	const [isPointChecked, setIsPointChecked] = useState(false); // 적립금 체크 상태 관리
	const [isCouponChecked, setIsCouponChecked] = useState(false); // 쿠폰 체크 상태 관리
	// FIXME - 정책 확정 시 이름 변경
	const [isPointTestChecked, setIsPointTestChecked] = useState(false); // 적립금 체크 상태 관리
	const [isCouponTestChecked, setIsCouponTestChecked] = useState(false); // 쿠폰 체크 상태 관리

	// ---------------------------------------------------------------
	// API
	// ---------------------------------------------------------------
	// 유로멤버십 등록 API
	const apiCreateMembership = async (formData) => {
		if (formData.productCode)
			try {
				const res = await LmAxios({
					method: "POST",
					url: "/admin/members",
					data: formData,
				});
				if (res.data.code === BaseResponse.SUCCESS) {
					setLmPop({
						show: true,
						type: "alert",
						contents: "해당 콘텐츠가 등록되었습니다.",
						success_fun: (hidepop) => {
							hidepop();
							navigate("/setting/membership");
						},
					});
				}
			} catch (error) {
				console.error("유로멤버십 등록 API 호출 실패:", error);
			}
	};
	// 유로멤버십 상세 조회 API
	const apiGetMembershipView = async () => {
		try {
			const res = await LmAxios({
				method: "GET",
				url: `/admin/members/${membershipId}`,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				// formData 업데이트
				setFormData(res.data.result);

				// accumulateMoney와 coupon 값에 따라 체크 상태 업데이트
				setIsPointChecked(!!res.data.result.accumulateMoney); // 값이 있으면 true
				setIsCouponChecked(!!res.data.result.coupon); // 값이 있으면 true
			}
		} catch (error) {
			console.error("getName API 호출 실패:", error);
		}
	};
	// 유로멤버십 수정 API
	const apiPutMembership = async () => {
		try {
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/members/${membershipId}`,
				data: formData,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setLmPop({
					show: true,
					type: "alert",
					contents: "콘텐츠가 수정되었습니다.",
					success_fun: (hidepop) => {
						hidepop();
						navigate("/setting/membership");
					},
				});
			} else {
				setLmPop({
					show: true,
					type: "alert",
					contents: res.data.message,
				});
			}
		} catch (error) {
			console.error("apiPutMembership API 호출 실패:", error);
		}
	};
	// 유로멤버십 삭제 API
	const apiDeleteMembership = async () => {
		try {
			const res = await LmAxios({
				method: "DELETE",
				url: `/admin/members/${membershipId}`,
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setLmPop({
					show: true,
					type: "alert",
					contents: "해당 콘텐츠가 삭제되었습니다.",
					success_fun: (hidepop) => {
						hidepop();
						navigate("/setting/membership");
					},
				});
			} else {
				setLmPop({
					show: true,
					type: "alert",
					contents: res.data.message,
				});
			}
			return;
		} catch (error) {
			console.error("유로멤버십 삭제 API 호출 실패:", error);
		}
	};

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	// input Change 이벤트
	const handleInputChange = (e) => {
		const { name, value, type } = e.target;

		if (type === "radio" && name === "status") {
			// 라디오 버튼 값 업데이트
			setFormData({
				...formData,
				[name]: value,
			});
		} else if (name === "grade" || name === "accumulateMoney") {
			// 숫자만 입력 받기
			const numericValue = textUtils(value, ["num"]);

			// grade 업데이트
			setFormData((prev) => ({
				...prev,
				[name]: numericValue,
			}));
		} else if ((name === "accumulateMoney" && isPointChecked) || (name === "coupon" && isCouponChecked)) {
			// 체크 여부를 확인하여 상태 업데이트

			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		} else {
			// 일반 입력 필드 업데이트
			setFormData({
				...formData,
				[name]: value,
			});
		}
	};

	// 체크박스 change 이벤트
	const handleCheckboxChange = (e) => {
		const { id, checked } = e.target;

		// 체크박스 상태 업데이트
		if (id === "point-check") {
			setIsPointChecked(checked);
			if (!checked) {
				setFormData((prev) => ({
					...prev,
					accumulateMoney: "",
				}));
			}
		} else if (id === "coupon-check") {
			setIsCouponChecked(checked);
			if (!checked) {
				setFormData((prev) => ({
					...prev,
					coupon: "",
				}));
			}
		} else if (id === "mothly-point-check") {
			//FIXME - 정책 확정 시 formData 값에 내용 추가
			setIsPointTestChecked(checked);
			if (!checked) {
				setFormData((prev) => ({
					...prev,
					mothlyPoint: "",
				}));
			}
		} else if (id === "mothly-coupon-check") {
			//FIXME - 정책 확정 시 formData 값에 내용 추가
			setIsCouponTestChecked(checked);
			if (!checked) {
				setFormData((prev) => ({
					...prev,
					mothlyCouponCount: "",
				}));
			}
		}
	};

	// 등록 버튼 클릭 시 필수 항목 빈값 검사 후 API 호출
	const handleCreateMembership = () => {
		if (isEmpty(formData.productCode)) {
			setErrorMsg("필수 항목을 입력해주세요.");
			return;
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: `콘텐츠를 등록하시겠습니까?`,
			success_fun: () => {
				apiCreateMembership(formData);
			},
		});
	};

	// 유로멤버십 삭제
	const handleDeleteMembership = () => {
		setLmPop({
			show: true,
			type: "confirm",
			contents: "해당 콘텐츠를 삭제하시겠습니까?",
			success_fun: async (hidepop) => {
				try {
					const res = await apiDeleteMembership(membershipId);
				} catch (error) {
					console.error("유로멤버십 삭제 API 호출 실패:", error);
				}
			},
		});
	};

	// 수정 버튼 클릭 시 필수 항목 빈값 검사 후 API 호출
	const handleModifyMembership = () => {
		if (isEmpty(formData.productCode)) {
			setErrorMsg("필수 항목을 입력해주세요.");
			return;
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: "콘텐츠를 수정하시겠습니까?",
			success_fun: async (hidepop) => {
				try {
					const res = await apiPutMembership();
				} catch (error) {
					console.error("유로멤버십 수정 API 호출 실패:", error);
				}
			},
		});
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------
	useEffect(() => {
		if (!membershipId) return;

		apiGetMembershipView();
	}, [membershipId]);

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
		<div className="lm-container contents-wrap membership-wrap">
			{/* 컨텐츠 영역 */}
			<div className="lm-card-wrap">
				<div className="lm-card padding-1">
					<div className="lm-title-box">
						<div className="lm-text title2 mb-12">유로멤버십 설정</div>
					</div>
					<table className="lm-table">
						<tbody>
							<tr>
								<th className="w-120 lm-required">상품코드</th>
								<td>
									<input
										type="text"
										className="lm-input"
										name="productCode"
										placeholder="유료멤버십 구매대상 상품코드 1건 입력"
										value={formData.productCode}
										onChange={handleInputChange}
									/>
								</td>
							</tr>

							<tr>
								<th className="w-120">구매후 변환등급</th>
								<td>
									<div className="lm-flex  gap-8">
										<input
											type="text"
											className="lm-input"
											name="grade"
											placeholder="회원등급 지정숫자 1건 입력"
											value={formData.grade}
											onChange={handleInputChange}
										/>
									</div>
								</td>
							</tr>

							<tr>
								<th className="w-120">구매후 지급혜택</th>
								<td>
									<div className="lm-flex-col gap-8">
										<div className="lm-checkbox">
											<input
												id="point-check"
												type="checkbox"
												checked={isPointChecked}
												onChange={handleCheckboxChange}
											/>
											<label htmlFor="point-check">적립금</label>
											<input
												type="text"
												className="lm-input point-input"
												name="accumulateMoney"
												placeholder="금액 숫자만 입력"
												value={formData.accumulateMoney}
												onChange={handleInputChange}
												disabled={!isPointChecked}
											/>
											<p>포인트</p>
										</div>
										<div className="lm-checkbox">
											<input
												id="coupon-check"
												type="checkbox"
												checked={isCouponChecked}
												onChange={handleCheckboxChange}
											/>
											<label htmlFor="coupon-check">쿠폰</label>
											<input
												type="text"
												className="lm-input"
												name="coupon"
												placeholder="쿠폰번호 : 2개 이상일 시 콤마(,)로 구분"
												value={formData.coupon}
												onChange={handleInputChange}
												disabled={!isCouponChecked}
											/>
										</div>
									</div>
								</td>
							</tr>
							{/* FIXME 정책 확정 시 onChange 수정 */}
							<tr>
								<th className="w-120">매월 지급혜택</th>
								<td>
									<div className="lm-flex-col gap-8">
										<div className="lm-checkbox">
											<input
												id="monthly-point-check"
												type="checkbox"
												checked={isPointTestChecked}
												onChange={handleCheckboxChange}
											/>
											<label htmlFor="monthly-point-check">적립금</label>
											<input
												type="text"
												className="lm-input point-input"
												name="point"
												placeholder="금액 숫자만 입력"
												disabled={!isPointTestChecked}
												onChange={handleInputChange}
											/>
											<p>포인트</p>
										</div>
										<div className="lm-checkbox">
											<input
												id="monthly-coupon-check"
												type="checkbox"
												checked={isCouponTestChecked}
												onChange={handleCheckboxChange}
											/>
											<label htmlFor="monthly-coupon-check">쿠폰</label>
											<input
												type="text"
												className="lm-input"
												name="couponCount"
												placeholder="쿠폰번호 : 2개 이상일 시 콤마(,)로 구분"
												disabled={!isCouponTestChecked}
												onChange={handleInputChange}
											/>
										</div>
									</div>
								</td>
							</tr>
							<tr>
								<th className="w-120">사용여부</th>
								<td>
									<div className="lm-flex items-center gap-12">
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
										</div>
										<div className="lm-flex items-center">
											<input
												type="radio"
												id="radio2"
												className="lm-radio-input"
												name="status"
												value="N"
												checked={formData.status === "N"}
												onChange={handleInputChange}
											/>
											<label htmlFor="radio2">마사용</label>
										</div>
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
					{!membershipId ? (
						<div className="lm-flex gap-6">
							<button className="lm-button line lm-flex-1" onClick={() => navigate(-1)}>
								취소
							</button>
							<button className="lm-button color-1 lm-flex-1" onClick={handleCreateMembership}>
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
									onClick={handleDeleteMembership}
								>
									삭제
								</button>
							</div>
							<button className="lm-button w-full mt-6 color-black" onClick={handleModifyMembership}>
								수정
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
