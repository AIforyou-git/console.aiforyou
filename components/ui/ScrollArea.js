// components/ui/ScrollArea.js
import React from "react";

const ScrollArea = ({ children, height = "300px" }) => {
  return (
    <div style={{ overflowY: "auto", maxHeight: height }}>
      {children}
    </div>
  );
};

export default ScrollArea;
