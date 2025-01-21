import React, { useState, useEffect, useRef } from "react";
import DrawArea from "./DrawArea"
import { Document, Page, pdfjs } from 'react-pdf';
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";
import * as fp from "fingerpose";
import * as tf from "@tensorflow/tfjs";
import PointRightGesture from "../gestures/PointRight.js";
import PointLeftGesture from "../gestures/PointLeft.js";
import thumbs_up from "../img/thumbs_up.png";
import point_left from "../img/point_left.png";
import point_right from "../img/point_right.png";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function SinglePage(props) {

  tf.setBackend('webgl');
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [emoji, setEmoji] = useState(null);
  const images = {
    thumbs_up: thumbs_up,
    point_left: point_left,
    point_right: point_right
  };

  const detectHandPose = async (net) => {
    if (typeof webcamRef.current !== "undefined" && webcamRef.current != null && webcamRef.current.video.readyState === 4) {
      // get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      // set video width and height
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      // set canvas width and height
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      // make detection
      const hand = await net.estimateHands(video);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.ThumbsUpGesture,
          PointRightGesture,
          PointLeftGesture,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 8);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map(
            (prediction) => prediction.score
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          setEmoji(gesture.gestures[maxConfidence].name);
          const detectedGesture = gesture.gestures[maxConfidence].name;

          // Detect "PointRight" gesture and move to the next page
          if (detectedGesture === PointRightGesture) {
            changePage(1); // Move to the next page
          }

          if (detectedGesture === PointLeftGesture) {
            changePage(-1); // Move to the previous page
          }
        }
      }
    }
  };

  useEffect(() => {
    const loadHandpose = async () => {
      try {
        const net = await handpose.load();
        // Start the handpose detection loop
        const loopDetection = () => {
          detectHandPose(net);
          requestAnimationFrame(loopDetection); // Request the next animation frame for continuous loop
        };
        loopDetection(); // Start the loop
      } catch (error) {
        console.error("Error loading handpose model:", error);
      }
    };
  
    loadHandpose(); // Load the handpose model when the component mounts
  
    // Clean up on component unmount
    return () => {
      // no need to cancel requestAnimationFrame since it's managed by itself
    };
  }, []); // Empty dependency array ensures this runs only once on mount
  

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);   

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  useEffect(()=>{
    props.pageChange(pageNumber);    
  });

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
      
      <DrawArea getPaths = {props.getPaths} page = {pageNumber} flag = {props.flag} getBounds = {props.bounds} changeFlag = {props.changeFlag} cursor = {props.cursor} buttonType = {props.buttonType} resetButtonType = {props.resetButtonType} pdfDimensions={props.pdfDimensions} hex={props.hex}>
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
      <header className="App-header">
        <Webcam ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 320,
            height: 240
          }} />
        <canvas ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 320,
            height: 240
          }} />

        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 400,
              bottom: 500,
              right: 0,
              textAlign: "center",
              height: 100,
            }}
          />
        ) : (
          ""
        )}
      </header>
    </>
  );
}