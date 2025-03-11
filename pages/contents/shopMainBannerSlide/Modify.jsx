import { ContentsForm } from "@/components/board/contents/contentsForm/ContentsForm";
import { bannerType } from "@/constants/bannerType";

export const ShopMainBannerSlideModify = () => {
	return <ContentsForm bannerType={bannerType.SB} />;
};
