import api from "@/config/api";
import React from "react";

const General = () => {
  const response = api.get("/company/read/");

  return <div>General</div>;
};

export default General;
