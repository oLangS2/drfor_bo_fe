// input에서 enter 키 입력시
export const handleKeyDown = (event, callback) => {
	if (event.key === "Enter" && typeof callback === "function") {
		callback(); // 콜백 함수 호출
	}
};
