// 공백 또는 null, undefined 확인
export const isEmpty = (value) => value === null || value === undefined || value.trim?.() === "";

// 숫자만 포함되어 있는지 확인
export const isNumeric = (value) => /^[0-9]+$/.test(value);

// 핸드폰 번호 형식 검증
export const isValidPhoneNumber = (phone) => /^01[016789]-?\d{3,4}-?\d{4}$/.test(phone);

// 이메일 형식 검증
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// URL 형식 검증
export const isValidURL = (url) => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url);

// 아이디 형식 검증
export const isCheckId = (id) => /^[a-z](?=.*\d)[a-z0-9]{3,15}$/.test(id);

// 비밀번호 형식 검증
export const isCheckPw = (pw) =>
	/^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[a-z\d!@#$%^&*()_\-+=<>?]{8,16}$/.test(pw);
