import iconWarningPath from "@/assets/img/icon/icon-warning.svg";

const NoSearchList = () => {
	return (
		<div className="empty-wrap">
			<div className="empty lm-flex-col items-center gap-12">
				<img src={iconWarningPath} alt="" />
				검색 결과가 없습니다
			</div>
		</div>
	);
};

export default NoSearchList;
