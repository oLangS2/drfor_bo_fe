import { ContentsForm } from "@/components/board/contents/contentsForm/ContentsForm";
import { bannerType } from "@/constants/bannerType";

export const ShopMainNewProductWrite = () => {
	return <ContentsForm bannerType={bannerType.NP} />;
};
