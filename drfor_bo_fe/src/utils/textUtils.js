// 원하는 문자만 출력
// 사용예시 (숫자만 입력하고싶을 때)
// const test = textUtils(value, ["num"]);
export const textUtils = (inputString, languages = ["ko"]) => {
	if (!inputString) {
		return "";
	}

	const supportedLanguages = {
		ko: /[가-힣ㄱ-ㅎㅏ-ㅣ]/g, // 한글
		eng: /[a-zA-Z]/g, // 영어
		num: /[0-9]/g, // 숫자
		special: /[!@#$%^&*()_+\-=]/g, // 특수문자
		space: /[\s]/g, // 띄어쓰기
	};

	let filteredCharacters = "";
	for (let char of inputString) {
		for (let lang of languages) {
			if (char.match(supportedLanguages[lang])) {
				filteredCharacters += char;
				break;
			}
		}
	}
	return filteredCharacters;
};
