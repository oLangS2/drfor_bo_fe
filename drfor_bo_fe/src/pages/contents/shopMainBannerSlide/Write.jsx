import { ContentsForm } from "@/components/board/contents/contentsForm/ContentsForm";
import { bannerType } from "@/constants/bannerType";

export const ShopMainBannerSlideWrite = () => {
	return <ContentsForm bannerType={bannerType.SB} />;
};
