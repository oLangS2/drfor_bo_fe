//  테이블의 No 를 페이징과 항목의 갯수를 계산하여 반환
export const getRowNo = (pagingData, currentPage, dataIndex) => {
	if (!pagingData || !pagingData.totalCount || !pagingData.displayRow) return 0;
	return pagingData.totalCount - ((currentPage - 1) * pagingData.displayRow + dataIndex);
};
