import { useEffect, useState } from "react";
import { LmAxios } from "@/axios/LmAxios";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { BaseResponse } from "../../../utils/BaseResponse";
import { CreateSettingPop } from "@/components/board/settingMember/CreateSettingPop";
// 회원등급 사용여부
const MemberGradeStatus = {
	FASLE: "N",
	TRUE: "Y",
};

// 회원등급 설정
export const MemberGrade = () => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { setLmPop } = HOOK_LM_POP();
	const [isPopOpen, setIsPopOpen] = useState(false);
	const [gradeValue, setGradeValue] = useState();

	// ---------------------------------------------------------------
	// API
	// ---------------------------------------------------------------

	// 회원등급 리스트 조회 API
	const apiGetMemberGradeList = async () => {
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
				setGradeValue(res.data.result.gradeList);
			}
		} catch (error) {
			console.error("회원등급 리스트 조회 API 호출 실패:", error);
		}
	};

	// 회원등급 사용 여부 수정 API
	const apiPutMemberGradeUse = async (userGradeId) => {
		try {
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/user/grade/${userGradeId}/use`,
			});
			return res.data;
		} catch (error) {
			console.error("회원등급 사용 여부 수정 API 호출 실패:", error);
		}
	};

	// 회원등급 삭제 API
	const apiDeleteMemberGrede = async (userGradeId) => {
		try {
			const res = await LmAxios({
				method: "DELETE",
				url: `/admin/user/grade/${userGradeId}`,
			});
			return res.data;
		} catch (error) {
			console.error("회원등급 삭제 API 호출 실패:", error);
		}
	};

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	// 회원등급 등록 팝업 open
	const handleMemberGradeSubmitPop = () => {
		setIsPopOpen(true);
	};

	// 회원등급 등록 팝업 close
	const handleMemberGradeClosePop = () => {
		setIsPopOpen(false);
	};

	// 회원등급 사용 여부 수정
	const handleMemberGradeUseModify = (rowData) => {
		let useType = "미사용";
		if (rowData.status === MemberGradeStatus.FASLE) {
			useType = "사용";
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: `해당 콘텐츠를 ${useType}으로 변경하시겠습니까?`,
			success_fun: async (hidepop) => {
				try {
					const res = await apiPutMemberGradeUse(rowData.userGradeId);
					if (res.code === BaseResponse.SUCCESS) {
						hidepop();
						apiGetMemberGradeList();
					}
				} catch (error) {
					console.error("회원등급 사용 여부 수정 API 호출 실패:", error);
				}
			},
		});
	};
	// 회원등급 삭제
	const handleMemberGradeDelete = (userGradeId) => {
		setLmPop({
			show: true,
			type: "confirm",
			contents: "해당 콘텐츠를 삭제하시겠습니까?",
			success_fun: async () => {
				try {
					const res = await apiDeleteMemberGrede(userGradeId);
					if (res.code === BaseResponse.SUCCESS) {
						setLmPop({
							show: true,
							type: "alert",
							contents: "해당 콘텐츠가 삭제되었습니다.",
							success_fun: (hidepop) => {
								hidepop();
								apiGetMemberGradeList();
							},
						});
					}
				} catch (error) {
					console.error("회원등급 삭제 API 호출 실패:", error);
				}
			},
		});
	};

	// ---------------------------------------------------------------
	// private method
	// ---------------------------------------------------------------

	// 회원등급의 status 값에 따른 버튼 매핑
	const getButtonClass = (status) => {
		return `status-button-${status === MemberGradeStatus.FASLE ? "inactive" : "active"}`;
	};

	const getButtonText = (status) => {
		return status === MemberGradeStatus.FASLE ? "미사용" : "사용";
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------
	useEffect(() => {
		apiGetMemberGradeList();
	}, []);

	return (
		<div className="lm-panel lmLavelListWrap lm-panel-listpage">
			<div className="lm-panel-title lm-flex justify-between">
				<div className="title">회원등급 설정</div>
				<button className="lm-button color-1" onClick={handleMemberGradeSubmitPop}>
					회원등급 등록
				</button>
			</div>

			<table className="lm-board-basic tableBoardLayout3">
				<thead>
					<tr>
						<th>등급번호</th>
						<th>등급명</th>
						<th>관리</th>
					</tr>
				</thead>
				<tbody>
					{gradeValue?.length > 0 ? (
						gradeValue.map((item, index) => (
							<tr key={index}>
								<td>
									<span>{item.gradeGroupNo}</span>
								</td>
								<td>{item.gradeName}</td>
								<td className="status-button">
									<button
										className={getButtonClass(item.status)}
										onClick={() => handleMemberGradeUseModify(item)}
									>
										{getButtonText(item.status)}
									</button>
									<button
										className="status-button-inactive"
										onClick={() => handleMemberGradeDelete(item.userGradeId)}
									>
										삭제
									</button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={3} className="no-results">
								등록된 분류가 없습니다.
							</td>
						</tr>
					)}
				</tbody>
			</table>
			{isPopOpen && (
				<CreateSettingPop
					isPopOpen={isPopOpen}
					onClose={handleMemberGradeClosePop}
					onApi={apiGetMemberGradeList}
					type={"grade"}
				/>
			)}
		</div>
	);
};
