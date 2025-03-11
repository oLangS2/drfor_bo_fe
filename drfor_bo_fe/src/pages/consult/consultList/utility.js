// 회원 ID 마스킹 함수
export const maskCustomerId = (customerId) => {
  if (!customerId || customerId.length <= 1) return customerId;
  const firstChar = customerId[0]; // 첫 번째 문자
  const maskedPart = "*".repeat(customerId.length - 1); // 나머지 문자 길이만큼 *
  return `${firstChar}${maskedPart}`; // 결합하여 반환
};
