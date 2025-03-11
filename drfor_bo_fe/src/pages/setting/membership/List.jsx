import { useEffect, useState } from "react";
import { LmAxios } from "@/axios/LmAxios";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { BaseResponse } from "../../../utils/BaseResponse";
import { useNavigate } from "react-router-dom";
import { getRowNo } from "@/utils/getRowNo";
// 유로멤버십 사용여부
const MembershipStatus = {
	FASLE: "N",
	TRUE: "Y",
};

// 유로멤버십 설정
export const MembershipList = () => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { setLmPop } = HOOK_LM_POP();
	const [membershipValue, setMembershipValue] = useState();
	const navigate = useNavigate();
	const [pagingData, setPagingData] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);

	// ---------------------------------------------------------------
	// API
	// ---------------------------------------------------------------

	// 유로멤버십 리스트 조회 API
	const apiGetMembershipList = async () => {
		try {
			const res = await LmAxios({
				method: "GET",
				url: "/admin/members",
				params: {
					displayRow: 100,
					currentPage: 1,
				},
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setMembershipValue(res.data.result.members);

				// 페이징 데이터 업데이트
				const { paging } = res.data.result;

				setPagingData({
					totalCount: paging.totalCount,
					totalPage: paging.totalPage,
					displayRow: paging.displayRow,
					currentPage: paging.currentPage,
				});
			}
		} catch (error) {
			console.error("유로멤버십 리스트 조회 API 호출 실패:", error);
		}
	};

	// 유로멤버십 사용 여부 수정 API
	const apiPutMembershipUse = async (membershipId) => {
		try {
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/members/${membershipId}/use`,
			});
			return res.data;
		} catch (error) {
			console.error("유로멤버십 사용 여부 수정 API 호출 실패:", error);
		}
	};

	// 유로멤버십 삭제 API
	const apiDeleteMembership = async (membershipId) => {
		try {
			const res = await LmAxios({
				method: "DELETE",
				url: `/admin/members/${membershipId}`,
			});
			return res.data;
		} catch (error) {
			console.error("유로멤버십 삭제 API 호출 실패:", error);
		}
	};

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	// 유로멤버십 사용 여부 수정
	const handleMembershipUseModify = (rowData) => {
		let useType = "미사용";
		if (rowData.status === MembershipStatus.FASLE) {
			useType = "사용";
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: `해당 콘텐츠를 ${useType}으로 변경하시겠습니까?`,
			success_fun: async (hidepop) => {
				try {
					const res = await apiPutMembershipUse(rowData.membershipId);
					if (res.code === BaseResponse.SUCCESS) {
						hidepop();
						apiGetMembershipList();
					}
				} catch (error) {
					console.error("유로멤버십 사용 여부 수정 API 호출 실패:", error);
				}
			},
		});
	};
	// 유로멤버십 삭제
	const handleMembershipDelete = (membershipId) => {
		setLmPop({
			show: true,
			type: "confirm",
			contents: "해당 콘텐츠를 삭제하시겠습니까?",
			success_fun: async () => {
				try {
					const res = await apiDeleteMembership(membershipId);
					if (res.code === BaseResponse.SUCCESS) {
						setLmPop({
							show: true,
							type: "alert",
							contents: "해당 콘텐츠가 삭제되었습니다.",
							success_fun: (hidepop) => {
								hidepop();
								apiGetMembershipList();
							},
						});
					}
				} catch (error) {
					console.error("유로멤버십 삭제 API 호출 실패:", error);
				}
			},
		});
	};

	// 유로 멤버십 등록 페이지로 이동
	const handleMembershipWrite = () => {
		navigate("/setting/membership/write");
	};

	// 유로 멤버십 수정 페이지로 이동
	const handleNavigateModify = (membershipId) => {
		navigate(`/setting/membership/modify/${membershipId}`);
	};

	// ---------------------------------------------------------------
	// private method
	// ---------------------------------------------------------------

	// 유로멤버십의 status 값에 따른 버튼 매핑
	const getButtonClass = (status) => {
		return `status-button-${status === MembershipStatus.FASLE ? "inactive" : "active"}`;
	};

	const getButtonText = (status) => {
		return status === MembershipStatus.FASLE ? "미사용" : "사용";
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------
	useEffect(() => {
		apiGetMembershipList();
	}, []);

	return (
		<div className="lm-panel lmMembershipListWrap lm-panel-listpage ">
			<div className="lm-panel-title lm-flex justify-between">
				<div className="title">유로멤버십 설정</div>
				<button className="lm-button color-1 register-button" onClick={handleMembershipWrite}>
					유로멤버십 등록
				</button>
			</div>

			<table className="lm-board-basic tableBoardLayout3">
				<thead>
					<tr>
						<th>번호</th>
						<th>상품코드</th>
						<th>등급명</th>
						<th>초기혜택</th>
						<th>정기혜택</th>
						<th>관리</th>
					</tr>
				</thead>
				<tbody>
					{membershipValue?.length > 0 ? (
						membershipValue.map((item, index) => (
							<tr key={index} onClick={() => handleNavigateModify(item.membershipId)}>
								<td>
									<span>{getRowNo(pagingData, currentPage, index)}</span>
								</td>
								<td>{item.productCode}</td>
								<td>{item.gradeName}</td>
								<td>
									{item.couponCount ? <span>쿠폰 {item.couponCount}개</span> : null}
									<br />
									{item.point ? <span>{item.point} 포인트</span> : null}
								</td>
								{/* FIXME - 정책 미확정으로 인한 정기혜택 임시로 빈값처리 */}
								<td></td>
								<td className="status-button">
									<button
										className={getButtonClass(item.status)}
										onClick={(e) => {
											e.stopPropagation();
											handleMembershipUseModify(item);
										}}
									>
										{getButtonText(item.status)}
									</button>
									<button
										className="status-button-inactive"
										onClick={(e) => {
											e.stopPropagation();
											handleMembershipDelete(item.membershipId);
										}}
									>
										삭제
									</button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={6} className="no-results">
								등록된 분류가 없습니다.
							</td>
						</tr>
					)}
				</tbody>
			</table>
		</div>
	);
};
