import { ContentsForm } from "@/components/board/contents/contentsForm/ContentsForm";
import { bannerType } from "@/constants/bannerType";

export const ShopMainPurchaseBenefitBannerWrite = () => {
	return <ContentsForm bannerType={bannerType.PB} />;
};
