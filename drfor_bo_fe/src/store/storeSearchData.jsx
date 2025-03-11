import { atom } from "recoil";

export const filterStorageValue = atom({
  key: "filterStorageValue", // atom의 고유 키
  default: {
    customerId: "",
    member: "",
    gender: "",
    age: "",
    startDate: "",
    endDate: "",
    isAnswered: "",
    state: false,
    pageNum: 1,
  }, // 초기값
});

export const counselorFilterStorageValue = atom({
  key: "counselorFilterStorageValue", // atom의 고유 키
  default: {
    memberName: "", // 이름
    memberId: "", // 아이디
    memberPhone: "", // 휴대폰번호
    phoneNumber0: "",
    phoneNumber1: "",
    phoneNumber2: "",
    status: "Y,N,D", // 계정 상태
    searchState: false,
  }, // 초기값
});

export const counselorCurrentPageValue = atom({
  key: "counselorCurrentPageValue", // atom의 고유 키
  default: {
    currentPage: 1,
  }, // 초기값
});
