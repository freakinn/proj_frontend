import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const DatePickerWrapper = ({ selected, onChange }) => {
  return <ReactDatePicker selected={selected} onChange={onChange} />;
};
