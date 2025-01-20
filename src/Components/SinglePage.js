import React, { useState, useEffect } from "react";
import DrawArea from "./DrawArea"
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function SinglePage(props) {

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1); 
  const [bounds, setBounds] = useState({ x: 0, y: 0, width: 0, height: 0 });
  

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  useEffect(()=>{
    props.pageChange(pageNumber);    
  });

  const handleGetBounds = (newBounds) => {
    setBounds(newBounds); // Update local state with new bounds
    props.getBounds(newBounds); // Pass updated bounds to parent
    console.log("Updated Drawable Area Bounds:", newBounds);
  };

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  //Load PDF
  const { pdf } = props;

  return (
    <>
   <div >
      <Document
        file={pdf}
        options={{ workerSrc: "/pdf.worker.js" }}
        onSourceError={(err) => console.log(err)}
        onSourceSuccess={() => console.log("SUCCESS")}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={()=>console.log("ERR")}
      >
      
      <DrawArea getPaths = {props.getPaths} page = {pageNumber} flag = {props.flag} getBounds = {handleGetBounds} changeFlag = {props.changeFlag} cursor = {props.cursor} buttonType = {props.buttonType} resetButtonType = {props.resetButtonType} pdfDimensions={props.pdfDimensions} hex={props.hex}>
      <Page 
            pageNumber={pageNumber}
          />
      </DrawArea>
      </Document>
      </div>
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
        </p>
        <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
        <i style ={{fontSize: 25}} className="fa fa-fw fa-arrow-left"></i>
        </button>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
        <i style ={{fontSize: 25}} className="fa fa-fw fa-arrow-right"></i>
        </button>
      </div>
    </>
  );
}