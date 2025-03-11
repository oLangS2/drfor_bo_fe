const dateUtils = {
	dateFormat: (targetDate, options = {}) => {
		// 날짜 포멧 변경
		if (!targetDate) {
			return false;
		}
		let reqDate = new Date(targetDate);
		const {
			dateSeparator = "-",
			timeSeparator = ":",
			showYear = true,
			showMonth = true,
			showDay = true,
			showHours = false,
			showMinutes = false,
			showSeconds = false,
		} = options;

		const padZero = (num) => (num < 10 ? `0${num}` : num);

		const year = showYear ? reqDate.getFullYear() : "";
		const month = showMonth ? padZero(reqDate.getMonth() + 1) : "";
		const day = showDay ? padZero(reqDate.getDate()) : "";
		const hours = showHours ? padZero(reqDate.getHours()) : "";
		const minutes = showMinutes ? padZero(reqDate.getMinutes()) : "";
		const seconds = showSeconds ? padZero(reqDate.getSeconds()) : "";

		const dateParts = [year, month, day].filter((part) => part).join(dateSeparator);
		const timeParts = [hours, minutes, seconds].filter((part) => part).join(timeSeparator);

		return [dateParts, timeParts].filter((part) => part).join(" ");
	},
	dateDday: (targetDate) => {
		// 당일기준 남은 일정 계산
		if (!targetDate) {
			return false;
		}
		const today = new Date();
		const timeDiff = new Date(targetDate).getTime() - today.getTime();
		const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
		return targetDate ? daysRemaining : 0;
	},
	dateBetween: (startDate, endDate) => {
		// 두일정 사이 계산
		if (!startDate || !endDate) {
			return false;
		}
		const timeDiff = new Date(endDate).getTime() - new Date(startDate).getTime();
		const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
		return startDate && endDate ? daysDiff : 0;
	},
	dateInCheck: (startDate, endDate, checkDate) => {
		// 두일정 사이 포함 여부
		if (!startDate || !endDate || !checkDate) {
			return false;
		}
		const startMs = new Date(startDate).getTime() || new Date();
		const endMs = new Date(endDate).getTime() || new Date();
		const checkMs = new Date(checkDate).getTime() || new Date();
		return checkMs >= startMs && checkMs <= endMs;
	},
	dateByOffset: (offset, unit = "day", baseDate = new Date()) => {
		// 일정 전,후 일
		if (!offset) {
			return false;
		}
		const dateUnits = {
			day: "Date",
			month: "Month",
			year: "FullYear",
		};

		const currentDate = new Date(baseDate);
		const resultDate = new Date(currentDate);

		if (!unit) {
			unit = "day";
		}

		const setter = `set${dateUnits[unit]}`;
		const getter = `get${dateUnits[unit]}`;

		resultDate[setter](currentDate[getter]() + offset);

		return dateUtils.dateFormat(resultDate);
	},
};

export { dateUtils };
