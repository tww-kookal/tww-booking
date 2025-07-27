import React, { useState } from "react";
import { FOLDER_ID } from "../config";

export default function DriveCRUD() {
  const [files, setFiles] = useState([]);

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    const metadata = {
      name: file.name,
      mimeType: file.type,
      parents: FOLDER_ID ? [FOLDER_ID] : [],
    };

    const accessToken = gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id", {
      method: "POST",
      headers: new Headers({ Authorization: "Bearer " + accessToken }),
      body: form,
    });

    const data = await res.json();
    alert(`Uploaded File ID: ${data.id}`);
  };

  const listFiles = async () => {
    const response = await gapi.client.drive.files.list({
      q: FOLDER_ID ? `'${FOLDER_ID}' in parents` : "",
      fields: "files(id, name, webViewLink)",
    });
    setFiles(response.result.files);
  };

  return (
    <div>
      <h2>Drive Files</h2>
      <input type="file" onChange={uploadFile} />
      <button onClick={listFiles}>List Files</button>
      <ul>
        {files.map(f => (
          <li key={f.id}>
            <a href={f.webViewLink} target="_blank" rel="noopener noreferrer">{f.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
