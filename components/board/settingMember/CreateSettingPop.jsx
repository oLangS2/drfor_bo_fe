import { useEffect, useState } from "react";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { GradeCreatePop } from "./grade/GradeCreatePop";
import { GroupCreatePop } from "./group/GroupCreatePop";

// isPopOpen : 팝업 open
// onClose: 팝업창 close
// onApi : 리스트 조회 api
// type : 게시글 타입 상태
export const CreateSettingPop = ({ isPopOpen, onClose, onApi, type }) => {
	// ---------------------------------------------------------------
	// 초기 변수 설정
	// ---------------------------------------------------------------
	const { getLmPop, setLmPop } = HOOK_LM_POP();
	const [showClass, setShowClass] = useState(false);
	// CreateSettingPop Type
	const MemberTypeStatus = {
		GRADE: "grade",
		GROUP: "group",
	};
	// ---------------------------------------------------------------
	// private method
	// ---------------------------------------------------------------

	// 팝업창 닫기
	const hidePop = () => {
		setShowClass("");
		setTimeout(() => {
			onClose(); // onClose 호출로 팝업 상태 변경
		}, 300);
	};

	// 취소 버튼 누를때 팝업창 닫기
	const funCancel = () => {
		if (getLmPop.cancel_fun) {
			getLmPop.cancel_fun(hidePop);
		} else {
			hidePop();
		}
	};

	// ---------------------------------------------------------------
	// useEffect
	// ---------------------------------------------------------------
	useEffect(() => {
		if (isPopOpen) {
			setShowClass("show");
		} else {
			setShowClass("");
		}
	}, [isPopOpen]);

	return (
		isPopOpen && (
			<div className="lm-pop create-pop">
				<div className={`lm-pop-inner ${showClass}`}>
					{/* type 값에 따라 조건부 렌더링 */}
					{type === MemberTypeStatus.GRADE && (
						<GradeCreatePop onApi={onApi} onClose={onClose} funCancel={funCancel} />
					)}
					{type === MemberTypeStatus.GROUP && (
						<GroupCreatePop onApi={onApi} onClose={onClose} funCancel={funCancel} />
					)}
				</div>
			</div>
		)
	);
};
