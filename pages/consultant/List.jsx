// 상담사 관리
import { useEffect, useState } from "react";
import { LmAxios } from "@/axios/LmAxios";
import { LmPaging } from "@/components/board/LmPaging";
import { BaseResponse } from "../../utils/BaseResponse";
import { getRowNo } from "@/utils/getRowNo";
import { handleKeyDown } from "@/common/handleKeyDown";
import { maskCustomerId } from "@/utils/maskCustomerId";
import { useNavigate } from "react-router-dom";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { useRecoilState } from "recoil";
import { counselorFilterStorageValue } from "@/store/storeSearchData";
import { counselorCurrentPageValue } from "@/store/storeSearchData";

// 해당 상담사 계정에 대한 사용여부 // Y: 사용, N: 미사용, D: 삭제
const ConsultantUsageStatus = {
  USED: "Y",
  UN_USED: "N",
  DELETED: "D",
};

// filter sortType 정렬기준
// CD는 생성일 내림차, CA는 생성일 오름차 순으로 정렬됩니다.
// ID는 아이디 내림차, IA는 아이디 오름차 순으로 정렬됩니다.
const sortTypeStatus = {
  CREATED_DESC: "CD",
  CREATED_ASC: "CA",
  ID_DESC: "ID",
  ID_ASC: "IA",
};

// searchData 사용여부
const statusOptions = {
  TOTAL: "Y,N,D",
  USED: "Y",
  UN_USED: "N",
};

export const ConsultantList = () => {
  // ---------------------------------------------------------------
  // 초기 변수 설정
  // ---------------------------------------------------------------

  // 상담사 필터 상태관리
  const [counselorFilter, setCounselorFilter] = useRecoilState(
    counselorFilterStorageValue
  );

  const [counselorCurrentPage, setCounselorCurrentPage] = useRecoilState(
    counselorCurrentPageValue
  );

  // 팝업
  const { setLmPop } = HOOK_LM_POP();

  // 검색 상태관리
  const [inputValues, setInputValues] = useState({
    memberName: "",
    memberId: "",
    memberPhone: "",
    phoneNumber0: "",
    phoneNumber1: "",
    phoneNumber2: "",
    status: "Y,N,D", // 초기값
  });
  const [searchData, setSearchData] = useState({
    memberName: "",
    memberId: "",
    memberPhone: "",
    phoneNumber0: "",
    phoneNumber1: "",
    phoneNumber2: "",
    status: "Y,N,D", // 초기값
  });
  // 컨텐츠 리스트, 페이징
  const [listData, setListData] = useState({});
  const [pagingData, setPagingData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태관리
  // 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(false);
  // 초기 정렬 상태
  const [sortType, setSortType] = useState(sortTypeStatus.CREATED_DESC);
  // 휴대폰번호 상태관리
  const [phoneNumber, setPhoneNumber] = useState({
    phoneNumber0: counselorFilter.phoneNumber0 || "",
    phoneNumber1: counselorFilter.phoneNumber1 || "",
    phoneNumber2: counselorFilter.phoneNumber2 || "",
  });
  const [isDataReady, setIsDataReady] = useState(false);

  // List Header Setting
  const listHeader = [
    { text: "NO", class: "no", id: "no" },
    { text: "이름", class: "memberName", id: "memberName" },
    { text: "아이디", class: "memberId", id: "memberId" },
    { text: "생성일 (사용/미사용 전환일)", class: "createAt", id: "createAt" },
    { text: "관리", class: "status", id: "status" },
  ];

  // ---------------------------------------------------------------
  // API
  // ---------------------------------------------------------------
  // 데이터 가져오는 함수
  const apiGetConsultantList = async (page = currentPage) => {
    // NOTE params에 status 키값이 담기면 value가 빈값이면 안되는 정책이므로 기본값 규정
    // const statusFilter = inputValues.status || "Y,N,D"; // 사용여부: 선택하지 않았을 경우 기본값 "Y,N,D"

    try {
      setIsLoading(true); // 로딩 시작
      const res = await LmAxios({
        method: "GET",
        url: "/admin/consultant",
        params: {
          currentPage: page,
          displayRow: 20, // 기본값 20
          sortType: sortType,
          // 검색 필터
          memberName: searchData.memberName.trim() || "",
          memberId: searchData.memberId.trim() || "",
          memberPhone: searchData.memberPhone || "",
          status: searchData.status, // 기본값 적용
        },
      });

      if (res.data.code === BaseResponse.SUCCESS) {
        const { consultants, paging } = res.data.result;

        // 리스트 데이터 업데이트
        setListData({ list: consultants });

        // 페이징 데이터 업데이트
        setPagingData({
          totalCount: paging.totalCount,
          totalPage: paging.totalPage,
          displayRow: paging.displayRow,
          currentPage: paging.currentPage,
        });
      } else {
        console.error("API 호출 실패: 예상하지 못한 응답", res.data);
      }
    } catch (error) {
      console.error("API 호출 실패:", error);
    } finally {
      setIsLoading(false); // 로딩 종료
    }
  };

  // 상담사 사용 여부 수정 API 호출
  const apiPatchConsultantUse = async (memberUid, newStatus) => {
    try {
      const res = await LmAxios({
        method: "PATCH",
        url: `/admin/consultant/${memberUid}/use`,
        data: {
          status: newStatus,
        },
      });

      if (res.data.code === BaseResponse.SUCCESS) {
        // 상태 업데이트
        setListData((prevListData) => {
          const updatedList = prevListData.list.map((consultant) =>
            consultant.memberUid === memberUid
              ? { ...consultant, status: newStatus }
              : consultant
          );
          return { ...prevListData, list: updatedList };
        });
      } else {
        console.error("API 호출 실패: 예상하지 못한 응답", res.data.message);
      }
    } catch (error) {
      console.error("API 호출 실패:", error);
    }
  };

  // ---------------------------------------------------------------
  // Handler
  // ---------------------------------------------------------------
  // 컨텐츠 Data 페이지 변경 핸들러
  const handlePageChange = (page) => {
    if (page > 0 && pagingData?.totalPage && page <= pagingData.totalPage) {
      setCurrentPage(page); // ✅ 상태 업데이트
      setIsDataReady(true); // ✅ useEffect에서 API 호출하도록 트리거 설정
    }
  };

  // input change 이벤트
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber1" || name === "phoneNumber2") {
      // 숫자만 입력 받기
      const numericValue = value.replace(/\D/g, "");

      // 4자리 이상 입력 방지
      if (numericValue.length > 4) return;

      // phoneNumber를 업데이트
      setPhoneNumber((prevPhone) => ({
        ...prevPhone,
        [name]: numericValue,
      }));
    } else if (name === "phoneNumber0") {
      // 전화번호 첫 번째 자리 (010, 011 등)
      setPhoneNumber((prevPhone) => ({
        ...prevPhone,
        [name]: value,
      }));
    } else {
      setInputValues((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // checkbox change 이벤트
  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;

    setInputValues((prev) => {
      let currentStatus = prev.status ? prev.status.split(",") : []; // 쉼표로 분리

      if (value === "Y,N,D") {
        // "전체" 체크박스 클릭 시
        currentStatus = checked ? ["Y", "N", "D"] : []; // 체크: "Y,N,D", 해제: 빈 배열
      } else {
        // "사용" 또는 "미사용" 체크박스 클릭 시
        if (checked) {
          currentStatus.push(value); // 값 추가
        } else {
          // 값과 "D" 제거
          currentStatus = currentStatus.filter((g) => g !== value && g !== "D");
        }

        // "사용"과 "미사용"이 모두 체크되면 "전체"로 변경
        if (currentStatus.includes("Y") && currentStatus.includes("N")) {
          currentStatus = ["Y", "N", "D"];
        }
      }

      return {
        ...prev,
        status: currentStatus.join(","), // 쉼표로 연결된 문자열
      };
    });
  };

  // 정렬 필터링
  const handleSortChange = (columnId) => {
    setSortType((prevSortType) => {
      if (columnId === "memberId") {
        // 아이디
        return prevSortType === sortTypeStatus.ID_DESC
          ? sortTypeStatus.ID_ASC
          : sortTypeStatus.ID_DESC;
      }
      if (columnId === "createAt") {
        // 생성일 (사용/미사용 전환일)
        return prevSortType === sortTypeStatus.CREATED_DESC
          ? sortTypeStatus.CREATED_ASC
          : sortTypeStatus.CREATED_DESC;
      }
      return prevSortType;
    });
  };

  // 사용 <-> 미사용 confirm창
  // 상담사 사용 여부 수정 처리
  const handleUsageStatusBtnClick = (memberUid, currentStatus) => {
    const newStatus =
      currentStatus === ConsultantUsageStatus.USED
        ? ConsultantUsageStatus.UN_USED
        : ConsultantUsageStatus.USED;

    const statusMessage =
      newStatus === ConsultantUsageStatus.UN_USED
        ? "해당 계정을 미사용으로 변경하시겠습니까?"
        : "해당 계정을 사용으로 변경하시겠습니까?";

    // 공통 팝업 띄우기
    setLmPop({
      show: true,
      type: "confirm",
      contents: statusMessage,
      success_title: "확인",
      success_fun: (hidepop) => {
        apiPatchConsultantUse(memberUid, newStatus);
        hidepop(); // 팝업 닫기
      },
    });
  };

  // ---------------------------------------------------------------
  // private methods
  // ---------------------------------------------------------------

  // 페이지 이동
  const navigate = useNavigate();

  const handleNavigateWrite = () => {
    navigate(`/consultant/write/?currentPage=${pagingData.currentPage}`);
  };

  const handleNavigateModify = (memberUid) => {
    navigate(
      `/consultant/modify/${memberUid}?currentPage=${pagingData.currentPage}`
    );
  };

  // 상태가 D일 때 버튼 숨김
  if (listData.status === ConsultantUsageStatus.DELETED) {
    return null; // 버튼을 렌더링하지 않음
  }

  // ---------------------------------------------------------------
  // useEffect
  // ---------------------------------------------------------------
  // 초기 데이터 로드
  useEffect(() => {
    console.log("필터값 조회---------------- : ", counselorFilter.searchState);
    console.log("페이지값 조회---------", counselorCurrentPage.currentPage);

    if (counselorFilter.searchState) {
      console.log("검색 상태가 존재합니다.");
      setCurrentPage(counselorCurrentPage); // 현재 페이지 상태 업데이트

      // 검색 상태가 존재하면 검색 데이터로 초기화
      setSearchData(counselorFilter);
      setInputValues(counselorFilter);
      setPhoneNumber({
        phoneNumber0: counselorFilter.phoneNumber0 || "",
        phoneNumber1: counselorFilter.phoneNumber1 || "",
        phoneNumber2: counselorFilter.phoneNumber2 || "",
      });

      setIsDataReady(true); //
    } else if (counselorCurrentPage.currentPage !== 1) {
      console.log("페이지값 설정:", counselorCurrentPage);
      setCurrentPage(counselorCurrentPage); // 현재 페이지 상태 업데이트
      setIsDataReady(true); // 페이지 번호가 변경되었음을 표시
    } else {
      console.log("초기 데이터 로드");

      // 초기 데이터 로드
      setCurrentPage(1);
      setIsDataReady(true);
    }
  }, [sortType]); // currentPage 변경 시 데이터 로드

  useEffect(() => {
    if (isDataReady) {
      apiGetConsultantList(currentPage);
      setIsDataReady(false); // API 호출 후 리셋
    }
  }, [isDataReady, currentPage, searchData]); // ✅ currentPage를 감지하여 자동 API 호출

  // 휴대폰번호 합치기
  const getFormattedPhoneNumber = () =>
    phoneNumber.phoneNumber0 +
    phoneNumber.phoneNumber1 +
    phoneNumber.phoneNumber2;

  // 검색 버튼 클릭 이벤트
  const handleBtnClick = () => {
    const requestData = {
      ...inputValues,
      phoneNumber0: phoneNumber.phoneNumber0,
      phoneNumber1: phoneNumber.phoneNumber1,
      phoneNumber2: phoneNumber.phoneNumber2,
      memberPhone: getFormattedPhoneNumber(),
    };

    setCurrentPage(1);
    setInputValues(requestData);
    setSearchData(requestData);
    setCounselorFilter(requestData);

    setCounselorFilter((prev) => ({
      ...prev,
      searchState: true,
    }));

    setIsDataReady(true); // ✅ useEffect에서 API 호출하도록 트리거 설정
  };

  return (
    <div className="lmConsultListWrap consult-wrap">
      <div className="lm-panel lm-panel-listpage lmConsultSearchWrap">
        {isLoading && <div className="lm-loader-10"></div>}
        <div className="lm-panel-title">
          <div className="title">상담사 관리</div>
          <div className="filter"></div>
          <button
            className="register-button"
            onClick={() => handleNavigateWrite()}
          >
            상담사 등록
          </button>
        </div>
        <div className="lm-line-bottom"></div>
        <div className="lm-contents-list-form">
          {/* 컨텐츠 목록 검색 폼 */}
          <div className="lm-input-layout2">
            <div className="lm-input-box-wrap2">
              <div className="lm-input-box-wrap-title">이름</div>
              <div className="lm-input-box">
                <input
                  type="text"
                  className="lm-input w-auto"
                  placeholder="이름 입력"
                  value={inputValues.memberName}
                  name="memberName"
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, handleBtnClick)} // 콜백 전달
                />
              </div>
            </div>

            <div className="lm-input-box-wrap2">
              <div className="lm-input-box-wrap-title">아이디</div>
              <div className="lm-input-box">
                <input
                  type="text"
                  className="lm-input"
                  placeholder="아이디 입력"
                  value={inputValues.memberId}
                  name="memberId"
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, handleBtnClick)} // 콜백 전달
                />
              </div>
            </div>
          </div>

          <div className="lm-input-box-wrap">
            <div className="lm-input-box-wrap-title">휴대폰번호</div>
            <div className="lm-input-box">
              {/* 휴대폰번호 입력 */}
              <div className="lm-flex gap-6">
                <select
                  name="phoneNumber0"
                  className="lm-select"
                  value={phoneNumber.phoneNumber0} // 010, 011, 016, 017, 018, 019
                  onChange={handleInputChange}
                >
                  <option value="010">010</option>
                  <option value="011">011</option>
                  <option value="016">016</option>
                  <option value="017">017</option>
                  <option value="018">018</option>
                  <option value="019">019</option>
                </select>
                <input
                  type="text"
                  name="phoneNumber1"
                  className="lm-input"
                  value={phoneNumber.phoneNumber1}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="phoneNumber2"
                  className="lm-input"
                  value={phoneNumber.phoneNumber2}
                  onChange={handleInputChange}
                  onKeyDown={(e) => handleKeyDown(e, handleBtnClick)} // 콜백 전달
                />
              </div>
            </div>
          </div>

          <div className="lm-input-box-wrap">
            <div className="lm-input-box-wrap-title">사용여부</div>
            {/* 사용여부 체크박스 */}
            <div className="lm-flex gap-16">
              {Object.entries(statusOptions).map(([key, value]) => (
                <label key={key} className="lm-check-box">
                  <input
                    type="checkbox"
                    name="status"
                    value={value} // "Y,N,D" 또는 "Y" 또는 "N"
                    checked={(() => {
                      const currentStatus = inputValues.status.split(",");

                      if (value === "Y,N,D") {
                        // "전체" 체크박스는 "사용"(Y)과 "미사용"(N)이 모두 체크된 경우 체크됨
                        return (
                          currentStatus.includes("Y") &&
                          currentStatus.includes("N")
                        );
                      }
                      // 개별 체크박스의 경우 자신의 값이 currentStatus에 포함되어 있으면 체크
                      return currentStatus.includes(value);
                    })()}
                    onChange={handleCheckboxChange}
                  />
                  <span className="change-d"></span>
                  <span className="text">
                    {/* key 값에 따라 해당 checkbox의 텍스트를 렌더링 */}
                    {
                      {
                        TOTAL: "전체",
                        USED: "사용",
                        UN_USED: "미사용",
                      }[key]
                    }
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="-search">
            <button onClick={handleBtnClick}>검색</button>
          </div>
        </div>
      </div>

      <div className="lm-panel lm-panel-listpage consultListPanelWrap">
        <div className="total">총 {pagingData?.totalCount}건</div>

        {/* 리스트 데이터를 렌더링 */}
        {listData ? (
          <table className="lm-board-basic consultTableBoardWrap">
            <thead>
              <tr>
                {listHeader.map((item, index) => (
                  <th key={index} className={item.class}>
                    {item.text}
                    {(item.id === "memberId" || item.id === "createAt") && (
                      <span
                        className="lm-icon-list-filter-arrow size-8 "
                        onClick={() => handleSortChange(item.id)}
                        style={{
                          transform:
                            (item.id === "memberId" &&
                              sortType === sortTypeStatus.ID_ASC) ||
                            (item.id === "createAt" &&
                              sortType === sortTypeStatus.CREATED_ASC)
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                        }}
                      />
                    )}
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
                  <tr
                    key={item.memeberUid}
                    onClick={() => {
                      setCounselorCurrentPage(currentPage);
                    }}
                  >
                    <td className="no num-or-eng">
                      <span>{getRowNo(pagingData, currentPage, index)}</span>
                    </td>
                    {item.status === ConsultantUsageStatus.DELETED ? (
                      <td className="member-name">{item.memberName}</td>
                    ) : (
                      <td
                        className="member-name link-text"
                        onClick={() => handleNavigateModify(item.memberUid)}
                      >
                        {item.memberName}
                      </td>
                    )}
                    {item.status === ConsultantUsageStatus.DELETED ? (
                      <td className="member-name">
                        <span>[삭제]</span>
                        {maskCustomerId(item.memberId)}
                      </td>
                    ) : (
                      <td
                        className="member-id link-text-num-or-eng"
                        onClick={() => handleNavigateModify(item.memberUid)}
                      >
                        {maskCustomerId(item.memberId)}
                      </td>
                    )}

                    {/* 생성일 YYYY-MM-DD 까지 */}
                    <td className="temporary num-or-eng">
                      {item.createAt.split(" ")[0]}
                    </td>
                    <td className="status-button">
                      <button
                        className={
                          item.status === ConsultantUsageStatus.USED
                            ? "status-button-active"
                            : "status-button-inactive"
                        }
                        style={{
                          display:
                            item.status === ConsultantUsageStatus.DELETED
                              ? "none"
                              : "",
                        }} // 버튼 숨김 처리
                        onClick={() =>
                          handleUsageStatusBtnClick(item.memberUid, item.status)
                        }
                      >
                        <span>
                          {item.status === ConsultantUsageStatus.USED
                            ? "사용"
                            : "미사용"}
                        </span>
                      </button>
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
