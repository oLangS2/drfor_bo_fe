// 페이징 네비게이션
// 데이터 , 페이징 그룹 숫자 (5 = 페이지 1...5까지 보여줌), onPageChange = 페이지 번호 클릭 이벤트
export const LmPaging = ({ data, maxPagesToShowNum, onPageChange, className }) => {
	const { currentPage, totalPage } = data;

	if (maxPagesToShowNum === undefined || maxPagesToShowNum === 0) {
		maxPagesToShowNum = 5;
	}

	const handlePageClick = (page) => {
		if (onPageChange) {
			onPageChange(page);
		}
	};

	const renderPagination = () => {
		const arrowBtPrev = [];
		const arrowBtNext = [];
		const pagesBt = [];

		const currentGroup = Math.ceil(currentPage / maxPagesToShowNum);
		const startPage = (currentGroup - 1) * maxPagesToShowNum + 1;
		const endPage = Math.min(startPage + maxPagesToShowNum - 1, totalPage);

		// NOTE 리스트가 0개일 때도 페이지네이션에 1페이지로 보이게 처리 및 화살표 비활성화
		if (totalPage === 0) {
			pagesBt.push(
				<button key={1} className={`page-number ${currentPage === 1 ? "active" : ""}`}>
					{1}
				</button>
			);

			// 화살표 버튼 비활성화
			// «
			arrowBtPrev.push(
				<button
					key="first"
					onClick={() => handlePageClick(1)}
					disabled={currentPage === 1}
					className="arrow first disabled"
				></button>
			);
			// ‹
			arrowBtPrev.push(
				<button
					key="prev"
					onClick={() => handlePageClick(currentPage - 1)}
					disabled={currentPage === 1}
					className="arrow prev disabled"
				></button>
			);
			// ›
			arrowBtNext.push(
				<button
					key="next"
					onClick={() => handlePageClick(currentPage + 1)}
					disabled={currentPage === totalPage || totalPage === 0}
					className="arrow next disabled"
				></button>
			);
			// »
			arrowBtNext.push(
				<button
					key="last"
					onClick={() => handlePageClick(totalPage)}
					disabled={currentPage === totalPage || totalPage === 0}
					className="arrow last disabled"
				></button>
			);
		} else {
			for (let i = startPage; i <= endPage; i++) {
				// 페이지 번호 버튼 추가
				pagesBt.push(
					<button key={i} onClick={() => handlePageClick(i)} className={`page-number ${currentPage === i ? "active" : ""}`}>
						{i}
					</button>
				);
			}

			// 화살표 버튼 추가
			arrowBtPrev.push(
				<button
					key="first"
					onClick={() => handlePageClick(1)}
					disabled={currentPage === 1}
					className={`arrow first ${currentPage === 1 ? "disabled" : ""}`}
				></button>
			);
			arrowBtPrev.push(
				<button
					key="prev"
					onClick={() => handlePageClick(currentPage - 1)}
					disabled={currentPage === 1}
					className={`arrow prev ${currentPage === 1 ? "disabled" : ""}`}
				></button>
			);
			arrowBtNext.push(
				<button
					key="next"
					onClick={() => handlePageClick(currentPage + 1)}
					disabled={currentPage === totalPage}
					className={`arrow next ${currentPage === totalPage ? "disabled" : ""}`}
				></button>
			);
			arrowBtNext.push(
				<button
					key="last"
					onClick={() => handlePageClick(totalPage)}
					disabled={currentPage === totalPage}
					className={`arrow last ${currentPage === totalPage ? "disabled" : ""}`}
				></button>
			);
		}

		return (
			<div className={`lm-paging ${className || ""}`}>
				{arrowBtPrev}
				<div className="num">{pagesBt}</div>
				{arrowBtNext}
				<button className="category-register">
					<span className="lm-icon-create-content-white"></span>
				</button>
			</div>
		);
	};

	return <>{renderPagination()}</>;
};
