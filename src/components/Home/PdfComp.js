import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

function PdfComp({ pdfFile }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    setNumPages(null); // Reset numPages when pdfFile changes
  }, [pdfFile]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1); // Reset pageNumber when a new document is loaded
  }

  function onPageLoadSuccess(page) {
    console.log("Page loaded", page);
  }

  function onPageLoadError(error) {
    console.error("Error loading page", error);
  }

  return (
    <div className="pdf-div">
      {pdfFile && (
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) =>
            console.error("Error loading document", error)
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              onLoadSuccess={onPageLoadSuccess}
              onLoadError={onPageLoadError}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          ))}
        </Document>
      )}
      {!pdfFile && <p>No PDF file selected.</p>}
      {pdfFile && numPages === null && <p>Loading...</p>}
    </div>
  );
}

export default PdfComp;
