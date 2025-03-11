// listData 답변여부: Y || N
export const answeredStatus = {
  WRITE: "N",
  MODIFY: "Y",
};

// searchData 성별
export const genderOptions = {
  FEMALE: "F",
  MALE: "M",
};

// 공개여부 (D는 삭제상태)
export const ExposureStatus = {
  E: "E", // 공개
  H: "H", // 비공개
  D: "D", // 삭제
};

// searchData 나이
export const ageOptions = {
  UNDER_20: "A", // 20세 미만
  FROM_20_TO_25: "B", // 20~25세
  FROM_26_TO_30: "C", // 26~30세
  FROM_31_TO_35: "D", // 31~35세
  FROM_36_TO_40: "E", // 36~40세
  FROM_41_TO_45: "F", // 41~45세
  FROM_46_TO_50: "G", // 46~50세
  FROM_51_TO_55: "H", // 51~55세
  FROM_56_TO_60: "I", // 56~60세
  FROM_61_TO_65: "J", // 61~65세
  OVER_66: "K", // 66세 이상
};

// searchData 답변 미작성 여부(답변 미작성 상담글만 보기)
export const isAnsweredOptions = {
  COMPLETED: "Y", // Y: 답변 완료, 미완료 모두 조회
  INCOMPLETE: "N", // N: 답변 미완료만 조회
};
