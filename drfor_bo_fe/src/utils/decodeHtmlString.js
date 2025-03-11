export const decodeHtmlString = (data) => {
	// HTML 엔티티를 일반 텍스트로 변환
	const resData = data
		.replace(/&lt;/g, "<")  // 모든 &lt;를 <로 변환
		.replace(/&gt;/g, ">")  // 모든 &gt;를 >로 변환
		.replace(/&amp;/g, "&") // 모든 &amp;를 &로 변환
		.replace(/&quot;/g, '"') // 모든 &quot;를 "로 변환
		.replace(/&#39;/g, "'"); // 모든 &#39;를 '로 변환
	return resData;
}