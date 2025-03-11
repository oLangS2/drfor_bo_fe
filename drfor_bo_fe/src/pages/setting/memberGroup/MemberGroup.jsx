import { useEffect, useState } from "react";
import { LmAxios } from "@/axios/LmAxios";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { BaseResponse } from "../../../utils/BaseResponse";
import { CreateSettingPop } from "@/components/board/settingMember/CreateSettingPop";
// 회원그룹 사용여부
const MemberGroupStatus = {
	FASLE: "N",
	TRUE: "Y",
};

// 회원그룹 설정
export const MemberGroup = () => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { setLmPop } = HOOK_LM_POP();
	const [isPopOpen, setIsPopOpen] = useState(false);
	const [groupValue, setGroupValue] = useState();

	// ---------------------------------------------------------------
	// API
	// ---------------------------------------------------------------

	// 회원그룹 리스트 조회 API
	const apiGetMemberGroupList = async () => {
		try {
			const res = await LmAxios({
				method: "GET",
				url: "/admin/user/group/",
				params: {
					displayRow: 100,
					currentPage: 1,
				},
			});
			if (res.data.code === BaseResponse.SUCCESS) {
				setGroupValue(res.data.result.userGroup);
			}
		} catch (error) {
			console.error("회원그룹 리스트 조회 API 호출 실패:", error);
		}
	};

	// 회원그룹 사용 여부 수정 API
	const apiPutMemberGroupUse = async (usergroupId) => {
		try {
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/user/group/${usergroupId}/use`,
			});
			return res.data;
		} catch (error) {
			console.error("회원그룹 사용 여부 수정 API 호출 실패:", error);
		}
	};

	// 회원그룹 삭제 API
	const apiDeleteMemberGrede = async (usergroupId) => {
		try {
			const res = await LmAxios({
				method: "DELETE",
				url: `/admin/user/group/${usergroupId}`,
			});
			return res.data;
		} catch (error) {
			console.error("회원그룹 삭제 API 호출 실패:", error);
		}
	};

	// ---------------------------------------------------------------
	// Handler
	// ---------------------------------------------------------------

	// 회원그룹 등록 팝업 open
	const handleMemberGroupSubmitPop = () => {
		setIsPopOpen(true);
	};

	// 회원그룹 등록 팝업 close
	const handleMemberGroupClosePop = () => {
		setIsPopOpen(false);
	};

	// 회원그룹 사용 여부 수정
	const handleMemberGroupUseModify = (rowData) => {
		let useType = "미사용";
		if (rowData.status === MemberGroupStatus.FASLE) {
			useType = "사용";
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: `해당 콘텐츠를 ${useType}으로 변경하시겠습니까?`,
			success_fun: async (hidepop) => {
				try {
					const res = await apiPutMemberGroupUse(rowData.userGroupId);
					if (res.code === BaseResponse.SUCCESS) {
						hidepop();
						apiGetMemberGroupList();
					}
				} catch (error) {
					console.error("회원그룹 사용 여부 수정 API 호출 실패:", error);
				}
			},
		});
	};
	// 회원그룹 삭제
	const handleMemberGroupDelete = (usergroupId) => {
		setLmPop({
			show: true,
			type: "confirm",
			contents: "해당 콘텐츠를 삭제하시겠습니까?",
			success_fun: async () => {
				try {
					const res = await apiDeleteMemberGrede(usergroupId);
					if (res.code === BaseResponse.SUCCESS) {
						setLmPop({
							show: true,
							type: "alert",
							contents: "해당 콘텐츠가 삭제되었습니다.",
							success_fun: (hidepop) => {
								hidepop();
								apiGetMemberGroupList();
							},
						});
					}
				} catch (error) {
					console.error("회원그룹 삭제 API 호출 실패:", error);
				}
			},
		});
	};

	// ---------------------------------------------------------------
	// private method
	// ---------------------------------------------------------------

	// 회원그룹의 status 값에 따른 버튼 매핑
	const getButtonClass = (status) => {
		return `status-button-${status === MemberGroupStatus.FASLE ? "inactive" : "active"}`;
	};

	const getButtonText = (status) => {
		return status === MemberGroupStatus.FASLE ? "미사용" : "사용";
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------
	useEffect(() => {
		apiGetMemberGroupList();
	}, []);

	return (
		<div className="lm-panel lmLavelListWrap lm-panel-listpage">
			<div className="lm-panel-title lm-flex justify-between">
				<div className="title">회원그룹 설정</div>
				<button className="lm-button color-1" onClick={handleMemberGroupSubmitPop}>
					회원그룹 등록
				</button>
			</div>

			<table className="lm-board-basic tableBoardLayout3">
				<thead>
					<tr>
						<th>그룹번호</th>
						<th>그룹명</th>
						<th>관리</th>
					</tr>
				</thead>
				<tbody>
					{groupValue?.length > 0 ? (
						groupValue.map((item, index) => (
							<tr key={index}>
								<td>
									<span>{item.userGroupNo}</span>
								</td>
								<td>{item.userGroupName}</td>
								<td className="status-button">
									<button
										className={getButtonClass(item.status)}
										onClick={() => handleMemberGroupUseModify(item)}
									>
										{getButtonText(item.status)}
									</button>
									<button
										className="status-button-inactive"
										onClick={() => handleMemberGroupDelete(item.userGroupId)}
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
					onClose={handleMemberGroupClosePop}
					onApi={apiGetMemberGroupList}
					type={"group"}
				/>
			)}
		</div>
	);
};
