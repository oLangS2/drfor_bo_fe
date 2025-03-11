// ID를 마스킹 처리하는 함수
export const maskCustomerId = (customerId) => {
	if (!customerId) return ''; // 아이디가 없으면 빈값
	const visibleLength = 1; // 노출할 문자 길이
	const maskedLength = customerId.length - visibleLength; // 마스킹할 문자 길이
	if (maskedLength <= 0) return customerId; // ID 길이가 visibleLength 이하일 경우 그대로 반환

	return `${customerId.slice(0, visibleLength)}${'*'.repeat(maskedLength)}`;
};