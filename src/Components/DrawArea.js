import React, { useState, useEffect, useRef } from 'react'
import Immutable from 'immutable'

function DrawArea(props) {

  const { width, height } = props.pdfDimensions; // Destructure dimensions
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [redoEl, setRedoEl] = useState([]);
  const [isCrosshair, setIsCrosshair] = useState(false);
  const drawAreaEl = useRef(null);
  useEffect(() => {
    const updateBounds = () => {
      if (drawAreaEl.current) {
        const rect = drawAreaEl.current.getBoundingClientRect();
        props.getBounds({
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height, // Include width and height if needed
        });
        console.log("Bounds updated in DrawArea:", rect);
      }
    };

    // Call updateBounds initially
    updateBounds();

    // Add a resize listener to update bounds dynamically
    window.addEventListener("resize", updateBounds);

    // Clean up the event listener
    return () => {
      window.removeEventListener("resize", updateBounds);
    };
  }, []); // Include props if needed

  // Add the mouseup event listener
  useEffect(() => {
    const handleMouseUp = () => {
      setIsCrosshair(false);
      setIsDrawing(false);
    };

    const drawArea = drawAreaEl.current;
    if (drawArea) {
      drawArea.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (drawArea) {
        drawArea.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, []);

  useEffect(() => {
    if (props.flag === "undo") {
      setRedoEl(arr => [...arr, lines.pop()]);
      setLines(lines);
    }
    if (props.flag === "redo") {
      setLines(lines => [...lines, redoEl.pop()]);
    }
    props.changeFlag();
  }, [props.flag])

  useEffect(() => {
    if (props.buttonType === "draw") {
      addMouseDown();
      props.resetButtonType();
    }
  }, [props.buttonType])

  useEffect(() => {
    if (isDrawing === false && lines.length) {
      props.getPaths(lines[lines.length - 1]);
    }
  }, [isDrawing])

  const handleMouseUp = () => {
    setIsCrosshair(false);
    setIsDrawing(false);
  }

  const handleMouseDown = (e) => {

    if (e.button !== 0) {
      return;
    }
    const point = relativeCoordinatesForEvent(e);
    let obj = {
      arr: [point],
      page: props.page,
      type: "freehand",
      color: props.hex, // Store the selected color
    };
    setLines(prevlines => [...prevlines, obj]);
    setIsDrawing(true);
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) {
      return;
    }
    const point = relativeCoordinatesForEvent(e);
    let last = lines.pop();
    last.arr.push(point);
    setLines(prevlines => [...prevlines, last]);
  }


  const relativeCoordinatesForEvent = (e) => {
    const boundingRect = drawAreaEl.current.getBoundingClientRect();
    return new Immutable.Map({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });
  }

  const addMouseDown = () => {
    setIsCrosshair(true);
    document.getElementById("drawArea").addEventListener("mousedown", handleMouseDown, { once: true });
  }

  return (
    <>
      {/*<button onClick = {addMouseDown} style = {{marginBottom: "1%", marginTop: "1%"}}>Draw</button>*/}

      <div
        id="drawArea"
        ref={drawAreaEl}
        style={{
          cursor: isCrosshair ? "crosshair" : props.cursor,
          width: `${width}px`,
          height: `${height}px`,
          border: "1px solid black",
          position: "relative",
          marginLeft: "30%",
        }}
        onMouseMove={handleMouseMove}
      >
        {props.children}
        <Drawing lines={lines} page={props.page} />
      </div>
    </>
  )

}

function Drawing({ lines, page }) {
  return (
    <svg className="drawing" style={{ zIndex: 10 }}>
      {lines.map((line, index) => (
        <DrawingLine key={index} line={line} page={page} />
      ))}
    </svg>
  );
}

function hexToRgb(hex) {
  // Remove the '#' if present
  hex = hex.replace('#', '');

  // Parse the hex color string into RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

function DrawingLine({ line, page }) {
  const pathData = "M " +
    line.arr
      .map(p => {
        return `${p.get('x')},${p.get('y')}`;
      })
      .join(" L ");

  if (line.page === page) {
    const { r, g, b } = hexToRgb(line.color.replace('#', '')); // Convert hex to RGB
    const strokeColor = `rgb(${r}, ${g}, ${b})`; // Generate RGB CSS color
    return <path className="path" d={pathData} style={{ stroke: strokeColor, fill: "none" }}/>;
  }
  return null;
}

export default DrawArea