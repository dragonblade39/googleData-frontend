import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";
import axios from "axios";
import PdfComp from "./PdfComp";
import { BACKEND_URL } from "../Constants/Constants";
import { pdfjs } from "react-pdf";
import Modal from "../Modal/Modal";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

function Home() {
  const location = useLocation();
  const email = location.state ? location.state.email : null;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  const [allFiles, setAllFiles] = useState([]);
  // eslint-disable-next-line
  const [pdfFile, setPdfFile] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleLogout = () => {
    setLoading(true);
    navigate("/", { state: null });
    setLoading(false);
  };

  const getPdfFiles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axios.get(`${BACKEND_URL}/PdfDetails/get-files`, {
        params: { email: email },
      });
      setAllFiles(result.data.data);
    } catch (error) {
      setShowModal(true);
      setModalMessage("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(
    () => {
      if (!email) {
        navigate("/");
      }
    }, // eslint-disable-next-line
    [email]
  );

  useEffect(() => {
    if (email) {
      getPdfFiles();
    }
  }, [email, getPdfFiles]);

  const submitFile = async (e) => {
    e.preventDefault();
    setLoading1(true);
    const formData = new FormData();
    formData.append("email", email);
    formData.append("file", file);
    formData.append("title", title);

    try {
      const result = await axios.post(
        `${BACKEND_URL}/PdfDetails/upload-files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (result.data.status === "ok") {
        setShowModal(true);
        setModalMessage("Uploaded Successfully!!!");
        getPdfFiles();
        setTitle("");
        setFile(null);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setShowModal(true);
      setModalMessage(
        "File present already with the same title. Please try again."
      );
    } finally {
      setLoading1(false);
      setTitle("");
      setFile(null);
    }
  };

  const showPdf = (pdf) => {
    setLoading(true);
    window.open(
      `${BACKEND_URL}/PdfDetails/files/${pdf}`,
      "_blank",
      "noreferrer"
    );
    //setPdfFile(`${BACKEND_URL}/PdfDetails/files/${pdf}`);
    setLoading(false);
  };

  const deleteFile = async (fileId) => {
    setLoading(true);
    try {
      const result = await axios.delete(
        `${BACKEND_URL}/PdfDetails/delete-file`,
        {
          data: { filename: fileId },
        }
      );
      if (result.data.status === "ok") {
        setShowModal(true);
        setModalMessage("Deleted Successfully!!!");
        window.location.reload();
        getPdfFiles();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      setShowModal(true);
      setModalMessage("Failed to delete file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Home">
      <div className="header"></div>
      <form className="formStyle" onSubmit={submitFile}>
        <h2>Upload Pdf</h2>
        <br />
        <input
          type="text"
          className="form-control"
          placeholder="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <input
          type="file"
          className="form-control "
          accept="application/pdf"
          required
          onChange={(e) => setFile(e.target.files[0])}
        />

        <br />
        <button className="submit-btn" type="submit" disabled={loading}>
          {loading1 ? "Loading..." : "Submit"}
        </button>
      </form>
      <div className="uploaded">
        <h2>Uploaded PDF:</h2>
        <div className="output-div">
          {loading ? (
            <div className="loader"></div>
          ) : !allFiles || allFiles.length === 0 ? (
            <p>No files found</p>
          ) : (
            allFiles.map((data) => (
              <div className="inner-div" key={data._id}>
                <div className="title-container">
                  <h4>Title:</h4>
                  <span>{data.title}</span>
                </div>
                <button
                  className="btn submit-btn"
                  onClick={() => showPdf(data.pdf)}
                >
                  Show Pdf
                </button>
                <button
                  className="btn logout-btn"
                  onClick={() => deleteFile(data.pdf)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      {pdfFile && <PdfComp pdfFile={pdfFile} />}
      <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
        Logout
      </button>
      <Modal
        show={showModal}
        message={modalMessage}
        onClose={() => {
          setShowModal(false);
        }}
      />
    </div>
  );
}

export default Home;
