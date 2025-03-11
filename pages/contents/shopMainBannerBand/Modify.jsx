import { ContentsForm } from "@/components/board/contents/contentsForm/ContentsForm";
import { bannerType } from "@/constants/bannerType";

export const ShopMainBannerBandModify = () => {
	return <ContentsForm bannerType={bannerType.RB} />;
};
