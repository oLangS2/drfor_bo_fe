import { LmAxios } from "@/axios/LmAxios";
import { BaseResponse } from "@/utils/BaseResponse";
import { useEffect, useState } from "react";
import HOOK_LM_POP from "@/store/hooks/hookPop";

const ConsultPublicStatus = {
	ENABLED: "E",
	DISABLED: "H",
	DELETED: "D",
};

export const LmStatusToggle = ({ consult, onUpdate = () => {} }) => {
	const [isActive, setIsActive] = useState(consult.status === ConsultPublicStatus);

	// 팝업
	const { setLmPop } = HOOK_LM_POP(); // 팝업 데이터를 관리하는 상태

	useEffect(() => {
		setIsActive(consult.status === ConsultPublicStatus.ENABLED);
	}, [consult.status]);

	const handleToggleData = async (newStatus, hidePop) => {
		try {
			const res = await LmAxios({
				method: "PUT",
				url: `/admin/consult/${consult.consultId}/exposure`,
				data: {
					status: newStatus,
				},
			});

			if (res.data.code === BaseResponse.SUCCESS) {
				setIsActive((prev) => !prev);
				onUpdate(consult.consultId, newStatus);
				hidePop();
			} else {
				console.error("API 호출 실패: 예상하지 못한 응답", res.data.message);
				hidePop();
			}
		} catch (error) {
			console.error("apiPutConsultExposure API 호출 실패:", error);
		}
	};

	const confirmPopupOpen = () => {
		const newStatus = isActive ? ConsultPublicStatus.DISABLED : ConsultPublicStatus.ENABLED;

		const message = isActive ? "해당 상담글을 비공개로 변경하시겠습니까?" : "해당 상담글을 공개로 변경하시겠습니까?";

		setLmPop({
			show: true,
			type: "confirm",
			contents: message,
			success_fun: (hidePop) => {
				handleToggleData(newStatus, hidePop);
			},
			cancel_fun: (hidePop) => {
				hidePop(); // 팝업 닫기
			},
		});
	};

	if (consult.status === ConsultPublicStatus.DELETED) {
		return null;
	}

	return (
		<button
			className={`lm-toggle-wrap ${isActive ? "active" : ""}`}
			onClick={confirmPopupOpen}
			style={{ display: consult.status === ConsultPublicStatus.DELETED ? "none" : "" }}
		>
			<div className={`lm-toggle ${isActive ? "active" : ""}`}>
				<div className="toggle-slider"></div>
			</div>
		</button>
	);
};
