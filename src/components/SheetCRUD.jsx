import React, { useState } from "react";
import { SHEET_ID } from "../config";

export default function SheetCRUD() {
  const [rows, setRows] = useState([]);
  const RANGE = "Sheet1!A1:C"; // Adjust range

  const fetchData = async () => {
    const res = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });
    setRows(res.result.values);
  };

  const addRow = async () => {
    const res = await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: RANGE,
      valueInputOption: "RAW",
      resource: {
        values: [["John Doe", "john@example.com", new Date().toISOString()]],
      },
    });
    fetchData();
  };

  return (
    <div>
      <h2>Sheet Data</h2>
      <button onClick={fetchData}>Load Rows</button>
      <button onClick={addRow}>Add Row</button>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Date</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
