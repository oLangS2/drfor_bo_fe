import { Link } from "react-router-dom";

export const NotFound = () => {
	return (
		<div className="not-found-wrap ">
			<div className="container">
				<h1 className="title">404</h1>
				<div>
					<p className="lm-text title1 mb-12">페이지를 찾을 수 없습니다</p>
					<span className="lm-text body4">
						찾으려는 페이지의 주소가 잘못 입력되었거나,주소의 변경 혹은 삭제로 인해 사용하실 수 없습니다.
					</span>
				</div>
				<Link to={"/"} className="lm-button color-1 lm-flex items-center">
					메인으로 가기
				</Link>
			</div>
		</div>
	);
};
