// 파일을 Base64로 변환하는 함수
export const convertFileToBase64 = (file) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject("파일을 Base64로 변환하는 중 오류가 발생했습니다.");
		reader.readAsDataURL(file);
	});
};
