import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ startDateProp, endDateProp, setDate }) => {
  const [startDate, setStartDate] = useState(""); // 시작 날짜
  const [endDate, setEndDate] = useState(""); // 종료 날짜
  const [CalendarOpen, setCalendarOpen] = useState(false); // 캘린더 열림 상태

  // 날짜 변경 이벤트
  // 1. 첫번째 선택되는 날짜는 startDate
  // 2. 두번째 선택되는 날짜는 endDate
  // 3. startDate가 endDate보다 클 경우 startDate를 endDate로 변경
  // 4. endDate가 startDate보다 작을 경우 endDate를 startDate로 변경
  // 5. startDate와 endDate가 같을 경우 startDate를 변경

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    if (!start) {
      setStartDate("");
      setEndDate("");
    } else if (start && !end) {
      setStartDate(start);
      setEndDate("");
    } else if (start && end) {
      if (start > end) {
        setStartDate(end);
        setEndDate(start);
      } else {
        setStartDate(start);
        setEndDate(end);
      }
    }
  };

  const handleCalendarClick = () => {
    setCalendarOpen(true); // 캘린더를 열기
  };

  // 날짜가 바뀔때 부모컴포넌트에서 반영
  useEffect(() => {
    setDate(startDate, endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    if (startDateProp && endDateProp) {
      setStartDate(startDateProp);
      setEndDate(endDateProp);
    }
  }, [startDateProp, endDateProp]);

  return (
    <div className="date-range-picker">
      <div className="date-inputs">
        <div className="date-inputs-box" onClick={handleCalendarClick}>
          <DatePicker
            className="lm-input"
            selected={startDate}
            onChange={(update) => handleDateChange(update)}
            startDate={startDate}
            endDate={endDate}
            selectsRange={true}
            dateFormat="yyyy.MM.dd"
            placeholderText="날짜를 선택해주세요"
            open={CalendarOpen}
            onClickOutside={() => setCalendarOpen(false)} // 캘린더 외부 클릭 시 닫기
          />
          <span className="lm-icon-date"></span>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
