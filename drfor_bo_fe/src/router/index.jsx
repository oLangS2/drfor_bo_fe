import { useRoutes } from "react-router-dom";
import { Layout } from "@/layout/Layout";
import { NotFound } from "@/pages/notFound/NotFound";
import { Login } from "@/pages/member/login/Login";
import { FindAccount } from "@/pages/member/login/FindAccount";
import { PwModify } from "@/pages/member/login/PwModify";

import { CounseModify } from "@/pages/consult/Modify";
import { ConsultView } from "@/pages/consult/View";
import { ConsultWrite } from "@/pages/consult/Write";

import { ConsultantList } from "@/pages/consultant/List";
import { ConsultantModify } from "@/pages/consultant/Modify";
import { ConsultantView } from "@/pages/consultant/View";
import { ConsultantWrite } from "@/pages/consultant/Write";

import { MemberGroup } from "@/pages/setting/memberGroup/MemberGroup";
import { MemberGrade } from "@/pages/setting/memberGrade/MemberGrade";
import { MembershipList } from "@/pages/setting/membership/List";
import { MembershipModify } from "@/pages/setting/membership/Modify";
import { MembershipWrite } from "@/pages/setting/membership/Write";

import { ShopMainBannerBandWrite } from "@/pages/contents/shopMainBannerBand/Write";
import { ShopMainBannerBandModify } from "@/pages/contents/shopMainBannerBand/Modify";
import { ShopMainBannerSlideWrite } from "@/pages/contents/shopMainBannerSlide/Write";
import { ShopMainBannerSlideModify } from "@/pages/contents/shopMainBannerSlide/Modify";
import { ShopMainIconCategoryWrite } from "@/pages/contents/shopMainIconCategory/Write";
import { ShopMainIconCategoryModify } from "@/pages/contents/shopMainIconCategory/Modify";
import { ShopMainNewProductWrite } from "@/pages/contents/shopMainNewProduct/Write";
import { ShopMainNewProductModify } from "@/pages/contents/shopMainNewProduct/Modify";
import { ShopBrandBannerMembershipWrite } from "@/pages/contents/shopBrandBannerMembership/Write";
import { ShopBrandBannerMembershipModify } from "@/pages/contents/shopBrandBannerMembership/Modify";
import { ShopMainPurchaseBenefitBannerWrite } from "@/pages/contents/shopMainPurchaseBenefitBanner/Write";
import { ShopMainPurchaseBenefitBannerModify } from "@/pages/contents/shopMainPurchaseBenefitBanner/Modify";
import { ShopMainVideoWrite } from "@/pages/contents/shopMainVideo/Write";
import { ShopMainVideoModify } from "@/pages/contents/shopMainVideo/Modify";
import { BrandMainBannerSlideWrite } from "@/pages/contents/brandMainBannerSlide/Write";
import { BrandMainBannerSlideModify } from "@/pages/contents/brandMainBannerSlide/Modify";
import { BrandMainBannerHairConsultWrite } from "@/pages/contents/brandMainBannerHairconsult/Write";
import { BrandMainBannerHairConsultModify } from "@/pages/contents/brandMainBannerHairconsult/Modify";
import { ShopMainGrettingList } from "@/pages/contents/shopMainGreetting/List";
import { ShopMainGrettingWrite } from "@/pages/contents/shopMainGreetting/Write";
import { ShopMainGrettingModify } from "@/pages/contents/shopMainGreetting/Modify";
import { ShopMainProductPersonalList } from "@/pages/contents/shopMainProductPersonal/List";
import { ShopMainProductPersonalWrite } from "@/pages/contents/shopMainProductPersonal/Write";
import { ShopMainProductPersonalModify } from "@/pages/contents/shopMainProductPersonal/Modify";
import { ContentsGeneralList } from "@/pages/contents/general/List";
import { bannerTypePath } from "@/constants/bannerType";
import ConsultList from "@/pages/consult/List";

const MyRouter = () => {
  let element = useRoutes([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "counsel",
          children: [
            // 상담글 관리
            {
              index: true,
              element: <ConsultList />,
            },
            {
              path: "write/:consultNo",
              element: <ConsultWrite />,
            },
            {
              path: "view/:consultNo",
              element: <ConsultView />,
            },
            {
              path: "modify/:consultNo",
              element: <CounseModify />,
            },
          ],
        },
        {
          path: "consultant",
          children: [
            // 상담사 관리
            {
              index: true,
              element: <ConsultantList />,
            },
            {
              path: "write",
              element: <ConsultantWrite />,
            },
            {
              path: "view/:consultantNo",
              element: <ConsultantView />,
            },
            {
              path: "modify/:consultantNo",
              element: <ConsultantModify />,
            },
          ],
        },
        {
          path: "contents",
          children: [
            // SHOP메인 상단 띠배너
            {
              path: bannerTypePath.RB,
              children: [
                {
                  index: true,
                  element: <ContentsGeneralList bannerType="RB" />,
                },
                {
                  path: "write",
                  element: <ShopMainBannerBandWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <ShopMainBannerBandModify />,
                },
              ],
            },
            // SHOP메인 최상단 슬라이드 배너
            {
              path: bannerTypePath.SB,
              children: [
                {
                  index: true,
                  element: <ContentsGeneralList bannerType="SB" />,
                },
                {
                  path: "write",
                  element: <ShopMainBannerSlideWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <ShopMainBannerSlideModify />,
                },
              ],
            },
            // SHOP메인 아이콘 카테고리
            {
              path: bannerTypePath.IC,
              children: [
                {
                  index: true,
                  element: <ContentsGeneralList bannerType="IC" />,
                },
                {
                  path: "write",
                  element: <ShopMainIconCategoryWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <ShopMainIconCategoryModify />,
                },
              ],
            },
            // SHOP메인 NEW상품
            {
              path: bannerTypePath.NP,
              children: [
                {
                  index: true,
                  element: <ContentsGeneralList bannerType="NP" />,
                },
                {
                  path: "write",
                  element: <ShopMainNewProductWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <ShopMainNewProductModify />,
                },
              ],
            },
            // SHOP/BRAND 유료멤버십 배너
            {
              path: bannerTypePath.MB,
              children: [
                {
                  index: true,
                  element: <ContentsGeneralList bannerType="MB" />,
                },
                {
                  path: "write",
                  element: <ShopBrandBannerMembershipWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <ShopBrandBannerMembershipModify />,
                },
              ],
            },
            // SHOP메인 공식몰 구매혜택 배너
            {
              path: bannerTypePath.PB,
              children: [
                {
                  index: true,
                  element: <ContentsGeneralList bannerType="PB" />,
                },
                {
                  path: "write",
                  element: <ShopMainPurchaseBenefitBannerWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <ShopMainPurchaseBenefitBannerModify />,
                },
              ],
            },
            // SHOP메인 영상
            {
              path: bannerTypePath.VD,
              children: [
                {
                  index: true,
                  element: <ContentsGeneralList bannerType="VD" />,
                },
                {
                  path: "write",
                  element: <ShopMainVideoWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <ShopMainVideoModify />,
                },
              ],
            },
            // BRAND메인 최상단 슬라이드 배너
            {
              path: bannerTypePath.BB,
              children: [
                {
                  index: true,
                  element: <ContentsGeneralList bannerType="BB" />,
                },
                {
                  path: "write",
                  element: <BrandMainBannerSlideWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <BrandMainBannerSlideModify />,
                },
              ],
            },
            // BRAND메인 두피고민상담소 배너
            {
              path: bannerTypePath.BS,
              children: [
                {
                  index: true,
                  element: <ContentsGeneralList bannerType="BS" />,
                },
                {
                  path: "write",
                  element: <BrandMainBannerHairConsultWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <BrandMainBannerHairConsultModify />,
                },
              ],
            },
            // SHOP메인 인삿말
            {
              path: "shop/main/greeting",
              children: [
                {
                  index: true,
                  element: <ShopMainGrettingList />,
                },
                {
                  path: "write",
                  element: <ShopMainGrettingWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <ShopMainGrettingModify />,
                },
              ],
            },
            // SHOP메인 개인화 추천상품
            {
              path: "shop/main/product/personal",
              children: [
                {
                  index: true,
                  element: <ShopMainProductPersonalList />,
                },
                {
                  path: "write",
                  element: <ShopMainProductPersonalWrite />,
                },
                {
                  path: "modify/:contentNo",
                  element: <ShopMainProductPersonalModify />,
                },
              ],
            },
          ],
        },
        //설정
        {
          path: "setting",
          children: [
            // 회원등급
            {
              path: "membergrade",
              children: [
                {
                  index: true,
                  element: <MemberGrade />,
                },
              ],
            },
            // 회원구분
            {
              path: "membergroup",
              children: [
                {
                  index: true,
                  element: <MemberGroup />,
                },
              ],
            },
            // 유로멤버십
            {
              path: "membership",
              children: [
                {
                  index: true,
                  element: <MembershipList />,
                },
                {
                  path: "write",
                  element: <MembershipWrite />,
                },
                {
                  path: "modify/:membershipId",
                  element: <MembershipModify />,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: "/",
      children: [
        //계정 관리
        {
          path: "member/",
          children: [
            {
              path: "login",
              element: <Login />,
            },
            {
              path: "find-account",
              element: <FindAccount />,
            },
            {
              path: "pw-modify",
              element: <PwModify />,
            },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);
  return element;
};

export default MyRouter;
