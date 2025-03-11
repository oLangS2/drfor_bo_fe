import { ContentsForm } from "@/components/board/contents/contentsForm/ContentsForm";
import { bannerType } from "@/constants/bannerType";

export const BrandMainBannerSlideModify = () => {
	return <ContentsForm bannerType={bannerType.BB} />;
};
