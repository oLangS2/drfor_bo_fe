const getFilter = {
	replaceNewlinesWithBr: (text) => {
		// 내려쓰기 전부 치환
		if (!text) {
			return false;
		}
		text = text.replace(/\\r|\r|\\n|\n|<br>/g, "<br />");
		return text;
	},
	spaceDelet: (text) => {
		// 스페이스 삭제
		if (!text) {
			return "";
		}
		const resultText = text.replace(/\s+/g, "");
		return resultText;
	},
	getDeviceCheck: () => {
		return /Mobi|Android/i.test(navigator.userAgent) ? "MOBILE_WEB" : "PC";
	},

	//LEADERMINE 게시글 HTML 추출
	getStringToHtml: (data) => {
		// 특정 클래스를 가진 요소를 선택
		const resData = data
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");
		return resData;
	},
};

export { getFilter };
