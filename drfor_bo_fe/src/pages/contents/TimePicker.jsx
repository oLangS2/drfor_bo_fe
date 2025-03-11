import React from "react";

const TimePicker = ({ label, onChange, value = { hour: "00", minute: "00" } }) => {
	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
	const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

	const handleChange = (type, newValue) => {
		const updatedValue = { ...value, [type]: newValue };
		onChange(updatedValue);
	};

	return (
		<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
			{label && <label>{label}</label>}
			<select
				className="lm-select"
				value={value.hour}
				onChange={(e) => handleChange("hour", e.target.value)}
			>
				{hours.map((hour) => (
					<option key={hour} value={hour}>
						{hour}
					</option>
				))}
			</select>
			<span>시</span>
			<select
				className="lm-select"
				value={value.minute}
				onChange={(e) => handleChange("minute", e.target.value)}
			>
				{minutes.map((minute) => (
					<option key={minute} value={minute}>
						{minute}
					</option>
				))}
			</select>
			<span>분</span>
		</div>
	);
};

export default TimePicker;
