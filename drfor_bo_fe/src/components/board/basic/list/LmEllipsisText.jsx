import React, { useEffect, useRef, useState } from "react";

const LmEllipsisText = ({ text, maxWidth }) => {
	const spanRef = useRef(null);
	const [finalText, setFinalText] = useState(text);
	const [isTruncated, setIsTruncated] = useState(false);

	useEffect(() => {
		const span = spanRef.current;
		if (span) {
			// 텍스트 길이 조정
			const computedStyle = window.getComputedStyle(span);
			const font = computedStyle.font;
			const canvas = document.createElement("canvas");
			const context = canvas.getContext("2d");
			context.font = font;

			// 텍스트 실제 너비 계산
			const fullWidth = context.measureText(text).width;

			if (fullWidth > maxWidth) {
				// 최대 너비 초과 시 텍스트를 잘라내기
				let currentText = text;
				while (context.measureText(currentText + "...").width > maxWidth) {
					currentText = currentText.slice(0, -1);
				}
				setFinalText(currentText + "...");
				setIsTruncated(true);
			} else {
				// 최대 너비를 초과하지 않으면 원본 텍스트 유지
				setFinalText(text);
				setIsTruncated(false);
			}
		}
	}, [text, maxWidth]);

	return (
		<span
			ref={spanRef}
			style={{
				display: "inline-block",
				maxWidth: `${maxWidth}px`, // 최대 너비 설정
				whiteSpace: "nowrap",
				overflow: "hidden",
				textOverflow: "ellipsis",
				verticalAlign: "bottom",
				textAlign: "left",
				width: isTruncated ? `${maxWidth}px` : "auto", // 너비 일관성 보장
			}}
		>
			{finalText}
		</span>
	);
};

export default LmEllipsisText;
