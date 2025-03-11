import { ContentsForm } from "@/components/board/contents/contentsForm/ContentsForm";
import { bannerType } from "@/constants/bannerType";

export const ShopMainBannerBandWrite = () => {
	return <ContentsForm bannerType={bannerType.RB} />;
};
