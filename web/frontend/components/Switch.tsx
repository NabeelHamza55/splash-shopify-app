import React, { useState } from "react";

const ToggleSwitch = (props: {
  id: any;
  value: any;
  handleVariantChange: any;
}) => {
  let { id, value, handleVariantChange } = props;

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        className="sr-only peer"
        checked={value}
        onChange={() => handleVariantChange(id, "state", !value)}
      />
      <div className="relative w-8 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-black-300 dark:peer-focus:ring-black-800 rounded peer light:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-gray-800"></div>
    </label>
  );
};

export default ToggleSwitch;
