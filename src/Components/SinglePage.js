import React, { useState, useEffect, useRef } from "react";
import DrawArea from "./DrawArea";
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
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const cooldownRef = useRef(false); // Use a ref for cooldown instead of state
  const images = {
    thumbs_up: thumbs_up,
    point_left: point_left,
    point_right: point_right
  };

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const detectHandPose = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current != null &&
      webcamRef.current.video.readyState === 4 &&
      !cooldownRef.current // Check cooldown status using ref
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
  
      // Set video and canvas dimensions
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
  
      // Make detection
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
            Math.max(...confidence)
          );
          setEmoji(gesture.gestures[maxConfidence].name);
          const detectedGesture = gesture.gestures[maxConfidence].name;
  
          // Handle page navigation
          if (detectedGesture === "point_left" && pageNumber < numPages) {
            setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages)); // Increment and ensure we don't exceed numPages
          } else if (detectedGesture === "point_right" && pageNumber >= 1) {
            setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1)); // Decrement and ensure we don't go below 1
          }

          // Start cooldown using ref
          cooldownRef.current = true;
          setTimeout(() => {
            cooldownRef.current = false; // Reset cooldown after 8 seconds
          }, 600); // Adjust cooldown duration as needed
        }
      }
    }
  };

  useEffect(() => {
    props.pageChange(pageNumber);
  });

  useEffect(() => {
    const loadHandpose = async () => {
      try {
        const net = await handpose.load();
  
        if (numPages) { // Ensure numPages is set before starting detection
          const loopDetection = () => {
            detectHandPose(net);
            requestAnimationFrame(loopDetection);
          };
          loopDetection();
        }
      } catch (error) {
        console.error("Error loading handpose model:", error);
      }
    };
  
    loadHandpose();
  }, [numPages]); // Run only after numPages is updated

  function changePage(offset) {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  function previousPage() {
    changePage(-1);
  }

  function nextPage() {
    changePage(1);
  }

  // Load PDF
  const { pdf } = props;

  return (
    <>
      <div>
        <Document
          file={pdf}
          options={{ workerSrc: "/pdf.worker.js" }}
          onSourceError={(err) => console.log(err)}
          onSourceSuccess={() => console.log("SUCCESS")}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={() => console.log("ERR")}
        >
          <DrawArea
            getPaths={props.getPaths}
            page={pageNumber}
            flag={props.flag}
            getBounds={props.bounds}
            changeFlag={props.changeFlag}
            cursor={props.cursor}
            buttonType={props.buttonType}
            resetButtonType={props.resetButtonType}
            pdfDimensions={props.pdfDimensions}
            hex={props.hex}
          >
            <Page pageNumber={pageNumber} />
          </DrawArea>
        </Document>
      </div>
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
        </p>
        <button type="button" disabled={pageNumber <= 1} onClick={previousPage}>
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-arrow-left"></i>
        </button>
        <button
          type="button"
          disabled={pageNumber >= numPages}
          onClick={nextPage}
        >
          <i style={{ fontSize: 25 }} className="fa fa-fw fa-arrow-right"></i>
        </button>
      </div>
      <header className="App-header2">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 320,
            height: 420,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 320,
            height: 240,
          }}
        />

        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
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