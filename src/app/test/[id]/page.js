import React from "react";

export default function Page(props) {
  try {
    console.log("Test page props keys:", Object.keys(props || {}));
    try {
      console.log("Test page props (json):", JSON.stringify(props));
    } catch (e) {
      console.log("Test page props (inspect):", props);
    }
  } catch (e) {}

  const id = props?.params?.id;

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Page</h1>
      <p>Param id: {String(id)}</p>
    </div>
  );
}
