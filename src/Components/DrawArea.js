import React, { useState, useEffect, useRef } from 'react';
import Immutable from 'immutable';

function DrawArea(props) {
  const { width, height } = props.pdfDimensions; // Destructure dimensions
  const [lines, setLines] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [redoEl, setRedoEl] = useState([]);
  const [isCrosshair, setIsCrosshair] = useState(false);
  const drawAreaEl = useRef(null);

  useEffect(() => {
    const handlePointerUp = () => {
      setIsCrosshair(false);
      setIsDrawing(false);
    };

    const drawArea = drawAreaEl.current;
    if (drawArea) {
      drawArea.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      if (drawArea) {
        drawArea.removeEventListener('pointerup', handlePointerUp);
      }
    };
  }, []);

  useEffect(() => {
    if (props.flag === 'undo') {
      setRedoEl((arr) => [...arr, lines.pop()]);
      setLines(lines);
    }
    if (props.flag === 'redo') {
      setLines((lines) => [...lines, redoEl.pop()]);
    }
    props.changeFlag();
  }, [props.flag]);

  useEffect(() => {
    if (props.buttonType === 'draw') {
      addPointerDown();
      props.resetButtonType();
    }
  }, [props.buttonType]);

  useEffect(() => {
    if (!isDrawing && lines.length) {
      props.getPaths(lines[lines.length - 1]);
    }
  }, [isDrawing]);

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType !== 'touch') {
      return;
    }
    const point = relativeCoordinatesForEvent(e);
    const obj = {
      arr: [point],
      page: props.page,
      type: 'freehand',
      color: props.hex,
    };
    setLines((prevLines) => [...prevLines, obj]);
    setIsDrawing(true);
    setIsCrosshair(true);

    // Capture the pointer to ensure tracking outside the element
    drawAreaEl.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) {
      return;
    }
    const point = relativeCoordinatesForEvent(e);
    const last = lines.pop();
    last.arr.push(point);
    setLines((prevLines) => [...prevLines, last]);
  };

  const relativeCoordinatesForEvent = (e) => {
    const boundingRect = drawAreaEl.current.getBoundingClientRect();
    return new Immutable.Map({
      x: e.clientX - boundingRect.left,
      y: e.clientY - boundingRect.top,
    });
  };

  const addPointerDown = () => {
    setIsCrosshair(true);
    drawAreaEl.current.addEventListener('pointerdown', handlePointerDown, { once: true });
  };

  return (
    <>
      <div
        id="drawArea"
        ref={drawAreaEl}
        style={{
          cursor: isCrosshair ? 'crosshair' : props.cursor,
          width: `${width}px`,
          height: `${height}px`,
          border: '1px solid black',
          position: 'relative',
          marginLeft: '30%',
          touchAction: 'none', // Disable touch gestures like scrolling or zooming
        }}
        onPointerMove={handlePointerMove}
      >
        {props.children}
        <Drawing lines={lines} page={props.page} />
      </div>
    </>
  );
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
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

function DrawingLine({ line, page }) {
  const pathData =
    'M ' +
    line.arr
      .map((p) => `${p.get('x')},${p.get('y')}`)
      .join(' L ');

  if (line.page === page) {
    const { r, g, b } = hexToRgb(line.color.replace('#', ''));
    const strokeColor = `rgb(${r}, ${g}, ${b})`;
    return <path className="path" d={pathData} style={{ stroke: strokeColor, fill: 'none' }} />;
  }
  return null;
}

export default DrawArea;