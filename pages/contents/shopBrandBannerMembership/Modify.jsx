import { ContentsForm } from "@/components/board/contents/contentsForm/ContentsForm";
import { bannerType } from "@/constants/bannerType";

export const ShopBrandBannerMembershipModify = () => {
	return <ContentsForm bannerType={bannerType.MB} />;
};
