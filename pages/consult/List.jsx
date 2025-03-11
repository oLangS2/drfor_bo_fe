// 두피고민 상담관리(상담글 관리)
import { useEffect, useState } from "react";
import { LmAxios } from "@/axios/LmAxios";
import { LmPaging } from "@/components/board/LmPaging";
import { LmStatusToggle } from "@/components/board/basic/list/LmStatusToggle";
import { useNavigate } from "react-router-dom";
import { BaseResponse } from "../../utils/BaseResponse";
import { getRowNo } from "@/utils/getRowNo";
import { handleKeyDown } from "@/common/handleKeyDown";
import { dateUtils } from "@/utils/dateUtils";
import DateRangePicker from "@/components/date/DateRangePicker";
import { useRecoilState } from "recoil";
import { filterStorageValue } from "@/store/storeSearchData";
import {
  answeredStatus,
  genderOptions,
  ExposureStatus,
  ageOptions,
  isAnsweredOptions,
} from "./consultList/constants";
import { maskCustomerId } from "./consultList/utility";

const ConsultList = () => {
  const [myValue, setMyValue] = useRecoilState(filterStorageValue);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchData, setSearchData] = useState({
    customerId: "",
    member: "",
    gender: "",
    age: "",
    startDate: "",
    endDate: "",
    isAnswered: "",
    state: false,
    pageNum: 1,
  });
  const [listData, setListData] = useState({});
  const [pagingData, setPagingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

  const listHeader = [
    { text: "NO", class: "consultId no" },
    { text: "두피 타입", class: "scalpType" },
    { text: "글제목", class: "consultTitle" },
    { text: "회원 아이디", class: "customerId" },
    { text: "상담사", class: "memberIdName" },
    { text: "작성일", class: "createAt" },
    { text: "답변여부", class: "answered" },
    { text: "관리", class: "answeredButton" },
    { text: "공개여부", class: "status" },
  ];

  // ---------------------------------------------------------------
  // API
  // ---------------------------------------------------------------

  // 데이터 가져오는 함수
  const apiGetConsultList = async (
    page = currentPage,
    filters = searchData
  ) => {
    // NOTE params에 gender, age, isAnswered  키값을 지정했을 때엔 value가 빈값이면 안되는 정책이므로 기본값 규정
    const genderFilter = filters.gender || "F,M";
    const ageFilter = filters.age || "A,B,C,D,E,F,G,H,I,J,K";
    const isAnsweredFilter = filters.isAnswered || "Y,N";

    try {
      const res = await LmAxios({
        method: "GET",
        url: "/admin/consult",
        params: {
          currentPage: page,
          displayRow: 20, // 기본값, 1페이지 20개 노출
          // 검색 필터
          customerId: searchData.customerId.trim() || "",
          member: searchData.member.trim() || "",
          gender: genderFilter, // 기본값 적용
          age: ageFilter, // 기본값 적용
          startDate: searchData.startDate || "",
          endDate: searchData.endDate || "",
          isAnswered: searchData.isAnswered || "",
          isAnswered: isAnsweredFilter, // 기본값 적용
        },
      });

      // 로딩 상태 변경
      if (res.data.code === BaseResponse.SUCCESS) {
        console.log("consult1 API 호출 성공:", res.data.result);
        console.log("현재 페이지:", res.data.result.paging.currentPage);
        console.log("전체 게시물 수:", res.data.result.paging.totalCount);
        console.log("전체 페이지 수:", res.data.result.paging.totalPage);

        const { consultList, paging } = res.data.result;

        // 리스트 데이터 업데이트
        setListData({
          list: consultList.map((data) => ({
            consultId: data.consultId,
            scalpType: data.scalpType,
            consultTitle:
              (data.status === ExposureStatus.D ? "[삭제] " : "") +
              data.consultTitle,
            customerId: data.customerId,
            memberId: data.memberId,
            memberName: data.memberName,
            memberIdName: `${data.memberId} || ${data.memberName}`, // 추가: 결합된 값
            createAt: data.createAt,
            answered: data.answered, // 답변 여부: Y || N
            answeredButton: data.answered,
            status: data.status, // 토글 상태 E: 노출, H: 노출안함(숨김), D: 삭제
          })),
        });

        // 페이징 데이터 업데이트
        setPagingData({
          totalCount: paging.totalCount,
          totalPage: paging.totalPage,
          displayRow: paging.displayRow,
          currentPage: paging.currentPage,
        });
      } else {
        console.error("consult1 API 호출 실패: 예상하지 못한 응답", res.data);
      }
    } catch (error) {
      console.error("consult1 API 호출 실패:", error);
    }
  };

  // [답변작성] 버튼을 클릭한 순간에 상담 답변 등록 전 회원 수정 불가 처리 api
  const apiDisableConsultEditable = async (consultId) => {
    try {
      const res = await LmAxios({
        method: "POST",
        url: `/admin/consult/${consultId}/editable`,
      });
      if (res.data.code !== BaseResponse.SUCCESS) {
        console.error(
          "apiDisableConsultEditable API 호출 실패:",
          res.data.message
        );
      }
    } catch (error) {
      console.error("apiDisableConsultEditable API 호출 실패:", error);
    }
  };

  // ---------------------------------------------------------------
  // Handler
  // ---------------------------------------------------------------

  // 컨텐츠 Data 페이지 변경 핸들러
  const handlePageChange = (page) => {
    console.log("페이지네이션 클릭됨");
    console.log("클릭된 페이지", page);
    // 페이지가 클릭될때, 페이지 번호를 저장한다.

    setSearchData((prev) => ({
      ...prev,
      pageNum: page,
    }));

    setMyValue((prev) => ({
      ...prev,
      pageNum: page,
    }));

    console.log("searchData", searchData);
    console.log("myValue", myValue);

    if (page > 0 && pagingData?.totalPage && page <= pagingData.totalPage) {
      setCurrentPage(page); // 현재 페이지 상태 업데이트
      apiGetConsultList(page); // 새로운 페이지 데이터 로드
    }
  };

  // input change 이벤트
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setSearchData((prev) => ({
      ...prev,
      [name]: value, // 다른 필드는 공백 제거된 값으로 업데이트
    }));
  };

  // checkbox change 이벤트
  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;

    setSearchData((prev) => {
      switch (name) {
        case "gender":
          // 성별 체크박스
          let currentGender = prev.gender ? prev.gender.split(",") : []; // 쉼표로 분리

          if (checked) {
            // 체크된 경우, 값 추가
            currentGender.push(value);
          } else {
            // 체크 해제된 경우, 값 제거
            currentGender = currentGender.filter((g) => g !== value);
          }
          return {
            ...prev,
            gender: currentGender.join(","), // 쉼표로 연결된 문자열
          };

        case "age":
          // 나이 체크박스
          let currentAges = prev.age ? prev.age.split(",") : []; // 쉼표로 분리
          if (checked) {
            currentAges.push(value); // 체크된 값 추가
          } else {
            currentAges = currentAges.filter((g) => g !== value); // 체크 해제 시 제거
          }
          return {
            ...prev,
            age: currentAges.join(","), // 쉼표로 연결된 문자열
          };

        case "isAnswered":
          return {
            ...prev,
            isAnswered: checked ? isAnsweredOptions.INCOMPLETE : "", // 체크 시 "N", 해제 시 빈 문자열
          };

        default:
          break;
      }
    });
  };

  // 날짜 변화 감지
  const handleDateChange = (start, end) => {
    setSearchData((prev) => ({
      ...prev,
      startDate: dateUtils.dateFormat(new Date(start)),
      endDate: dateUtils.dateFormat(new Date(end)),
    }));
  };

  // 검색 버튼 클릭 이벤트

  // 검색 버튼이 눌렸을 때,
  // 필터링 사용을 ture로 변경한다.
  // - true일 때, 페이지 로드 시 필터링 값을 사용한다.
  // searchData 값을 setMyValue 에 저장한다.
  // - searchData는 필터링 값이다.
  // - myValue는 리코일에 저장된 필터링 값이다.
  // api를 호출하고 1페이지로 이동한다.
  const handleBtnClick = async () => {
    setSearchData((prev) => {
      const updatedSearchData = {
        ...prev,
        pageNum: 1,
        state: true,
      };
      setMyValue(updatedSearchData); // Recoil에도 반영
      return updatedSearchData;
    });

    // ✅ 함수형 업데이트로 최신 상태를 가져옴
    setCurrentPage(() => {
      const newPage = 1;
      apiGetConsultList(newPage, searchData); // 최신값 사용 보장
      return newPage;
    });
  };

  // ---------------------------------------------------------------
  // private methods
  // ---------------------------------------------------------------

  // 페이지 이동
  const navigate = useNavigate();

  // [답변작성] 버튼 클릭
  const handleNavigateWrite = async (consultId, currentPage) => {
    if (answeredStatus.WRITE === "N") {
      // 상담 답변 등록 전 회원 수정 불가 처리
      const isEditable = await apiDisableConsultEditable(consultId);

      if (!isEditable) {
        // 편집 불가 상태일 경우 추가 동작 중단
        return;
      }
    }
    // 답변수정 상태일 경우 페이지 이동
    navigate(`/counsel/write/${consultId}?currentPage=${currentPage}`);
  };
  const handleNavigateView = (consultId, currentPage) => {
    setSearchData(myValue); // 상세 페이지 이동 전 현재 검색 데이터 유지
    navigate(`/counsel/view/${consultId}?currentPage=${currentPage}`);
  };
  const handleNavigateModify = (consultId, currentPage) => {
    navigate(`/counsel/modify/${consultId}?currentPage=${currentPage}`);
  };

  // 나이 키값에 따른 텍스트 매핑
  const getAgeText = (key) => {
    if (key === "UNDER_20") return "20세 미만";
    if (key === "OVER_66") return "66세 이상";
    if (key.startsWith("FROM_") && key.includes("_TO_")) {
      return (
        key.replace("FROM_", "").replace("_TO_", "~").replace("_", " ") + "세"
      );
    }
    return key; // 기본값 (필요 시 추가)
  };

  // ---------------------------------------------------------------
  // useEffect
  // ---------------------------------------------------------------

  useEffect(() => {
    console.log("필터값 조회---------------- : ", myValue.state);

    if (myValue.state) {
      console.log("검색 상태가 존재합니다.");
      setCurrentPage(myValue.pageNum);

      // ✅ searchData 업데이트 후 API 호출을 보장하기 위해 useState 활용
      setSearchData(myValue);
      setIsDataReady(true); // searchData 업데이트가 완료되었음을 표시
    } else if (myValue.pageNum !== 1) {
      console.log("페이지값 설정:", myValue.pageNum);
      setCurrentPage(myValue.pageNum);
      setIsDataReady(true); // 페이지 번호가 변경되었음을 표시
    } else {
      console.log("기본값 사용");
      setIsDataReady(true);
    }
  }, []);

  // ✅ isDataReady가 true일 때만 API 호출
  useEffect(() => {
    console.log("렌더링1--------------------------------------");
    console.log("currentPage의 값은", currentPage);
    console.log("myValue.pageNum의 값은", myValue.pageNum);

    if (isDataReady) {
      apiGetConsultList(currentPage, searchData);
      setIsDataReady(false); // API 호출 후 리셋
    }
  }, [isDataReady, currentPage]); // currentPage 변경 시도 반영

  return (
    <div className="lmConsultListWrap consult-wrap">
      <div className="lm-panel lm-panel-listpage lmConsultSearchWrap">
        {isLoading && <div className="lm-loader-10"></div>}
        <div className="lm-panel-title">
          <div className="title">두피고민 상담관리</div>
          <div className="filter"></div>
        </div>
        <div className="lm-line-bottom"></div>
        <div className="lm-contents-list-form">
          {/* 컨텐츠 목록 검색 폼 */}
          <div className="lm-input-layout2">
            <div className="lm-input-box-wrap2">
              <div className="lm-input-box-wrap-title">회원 아이디</div>
              <div className="lm-input-box">
                <input
                  type="text"
                  className="lm-input"
                  placeholder="아이디 입력"
                  name="customerId"
                  value={searchData.customerId}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, handleBtnClick)} // 콜백 전달
                />
              </div>
            </div>

            <div className="lm-input-box-wrap2">
              <div className="lm-input-box-wrap-title">상담글 작성기간</div>
              <div className="lm-input-box">
                <DateRangePicker
                  startDateProp={searchData.startDate}
                  endDateProp={searchData.endDate}
                  setDate={handleDateChange}
                />
              </div>
            </div>
          </div>

          <div className="lm-input-layout2">
            <div className="lm-input-box-wrap2">
              <div className="lm-input-box-wrap-title">상담사</div>
              <div className="lm-input-box">
                <input
                  type="text"
                  className="lm-input"
                  placeholder="이름 또는 아이디를 입력하세요"
                  name="member"
                  value={searchData.member || ""} // memberId 또는 memberName 값 검색
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, handleBtnClick)} // 콜백 전달
                />
              </div>
            </div>

            <div className="lm-input-box-wrap2">
              <div className="lm-input-box-wrap-title">성별</div>
              {/* 성별 체크박스 */}
              <div className="lm-input-box">
                <div className="lm-flex gap-16">
                  {/* NOTE Object.entries()는 객체의 속성(key-value 쌍)을 배열로 변환하는 JavaScript 메서드로써 객체를 반복(iteration)처리 */}
                  {Object.entries(genderOptions).map(([key, value]) => (
                    <label key={key} className="lm-check-box">
                      <input
                        type="checkbox"
                        name="gender"
                        value={value} // FEMALE 또는 MALE 값
                        // NOTE includes()를 이용해 값(value)이 해당 문자열에 포함되어 있는지 확인(쉼표로 구분된 문자열로 관리되기 때문에 배열이 아니어도 사용가능)
                        checked={searchData.gender?.includes(value) || false}
                        onChange={handleCheckboxChange}
                      />
                      <span className="change-d"></span>
                      <span className="text">
                        {key === "FEMALE" ? "여성" : "남성"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lm-input-box-wrap">
            <div className="lm-input-box-wrap-title">나이</div>
            {/* 나이 체크박스 */}
            {/* NOTE Object.entries()는 객체의 속성(key-value 쌍)을 배열로 변환하는 JavaScript 메서드로써 객체를 반복(iteration)처리 */}
            {Object.entries(ageOptions).map(([key, value]) => (
              <label key={key} className="lm-check-box">
                <input
                  type="checkbox"
                  name="age"
                  value={value} // 나이 "A~K"값
                  // NOTE includes()를 이용해 값(value)이 해당 문자열에 포함되어 있는지 확인(쉼표로 구분된 문자열로 관리되기 때문에 배열이 아니어도 사용가능)
                  checked={searchData.age?.includes(value) || false}
                  onChange={handleCheckboxChange}
                />
                <span className="change-d"></span>
                {/* 텍스트 변환 함수 사용 */}
                <span className="text">{getAgeText(key)}</span>
              </label>
            ))}
          </div>

          <div className="-search">
            <button onClick={handleBtnClick}>검색</button>
            {/* 답변 미작성 상담글만 보기 체크박스 */}
            <label className="lm-check-box -checkbox">
              <input
                type="checkbox"
                name="isAnswered"
                // NOTE 체크박스가 단일이라서 value 속성 불필요
                checked={
                  searchData.isAnswered === isAnsweredOptions.INCOMPLETE ||
                  false
                } // isAnswered 값이 "N"일 경우 checked
                onChange={handleCheckboxChange}
              />
              <span className="change-d"></span>
              <span className="text">답변 미작성 상담글만 보기</span>
            </label>
          </div>
        </div>
      </div>

      <div className="lm-panel lm-panel-listpage contentsListPanelWrap">
        <div className="total">총 {pagingData?.totalCount}건</div>

        {/* 리스트 데이터를 렌더링 */}
        {listData ? (
          <table className="lm-board-basic contentsTableBoardWrap">
            <thead>
              <tr>
                {listHeader.map((item, index) => (
                  <th key={index} className={item.class}>
                    {item.text}
                  </th>
                ))}
              </tr>
            </thead>
            <thead style={{ height: "12px" }}>
              <tr></tr>
            </thead>
            <tbody>
              {listData.list?.length > 0 ? (
                listData.list.map((item, index) => (
                  // NOTE 고유한 key값 설정을 위해 id 사용
                  <tr key={item.consultId}>
                    <td className="no num-or-eng">
                      <span>{getRowNo(pagingData, currentPage, index)}</span>
                    </td>
                    <td className="scalp-type">{item.scalpType}</td>
                    <td className="consult-title subject">
                      <button
                        className="lm-table-btn"
                        onClick={() => {
                          handleNavigateView(
                            item.consultId,
                            pagingData.currentPage
                          );
                          setMyValue(searchData);
                        }}
                      >
                        {item.consultTitle}
                      </button>
                    </td>
                    <td className="customer-id num-or-eng">
                      {maskCustomerId(item.customerId)}
                    </td>
                    <td className="member-name num-or-eng">
                      {item.memberName} {item.memberId}
                    </td>
                    <td className="create-at num-or-eng">
                      {dateUtils.dateFormat(item.createAt)}
                    </td>
                    <td
                      className={
                        item.answered === answeredStatus.MODIFY
                          ? "answered-inactive"
                          : "answered-active"
                      }
                    >
                      {/* 삭제 상태이면 버튼 제거 */}
                      {item.status === ExposureStatus.D ? (
                        ""
                      ) : (
                        <span>
                          {item.answered === answeredStatus.MODIFY
                            ? "답변완료"
                            : "답변대기"}
                        </span>
                      )}
                    </td>
                    <td className="answered-button">
                      {/* 삭제 상태이면 버튼 제거 */}
                      {item.status === ExposureStatus.D ? (
                        ""
                      ) : (
                        <button
                          className={
                            item.answered === answeredStatus.MODIFY
                              ? "answered-button-inactive"
                              : "answered-button-active"
                          }
                          onClick={() =>
                            item.answered === answeredStatus.MODIFY
                              ? handleNavigateModify(
                                  item.consultId,
                                  pagingData.currentPage
                                )
                              : handleNavigateWrite(
                                  item.consultId,
                                  pagingData.currentPage
                                )
                          }
                        >
                          <span>
                            {item.answered === answeredStatus.MODIFY
                              ? "답변수정"
                              : "답변작성"}
                          </span>
                        </button>
                      )}
                    </td>
                    <td>
                      {/* TODO 상담글 등록 수정 (경로: consult / WriteModifyForm) 페이지에 공개여부 토글 같은 기능 있음 공통 컴포넌트로 리팩토링 합시다! */}
                      <LmStatusToggle
                        consult={item} // 전체 item 객체 전달
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={listHeader?.length} className="no-results">
                    검색된 상담글이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="lm-loader-10"></div>
        )}

        {/* 페이지네이션 컴포넌트 */}
        {pagingData && pagingData.totalPage >= 0 && (
          <LmPaging
            data={{
              ...pagingData,
              currentPage,
            }}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
};

export default ConsultList;
