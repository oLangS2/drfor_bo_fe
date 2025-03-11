import { ContentsForm } from "@/components/board/contents/contentsForm/ContentsForm";
import { bannerType } from "@/constants/bannerType";

export const BrandMainBannerSlideWrite = () => {
	return <ContentsForm bannerType={bannerType.BB} />;
};
