import React, { useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function hexToRgb(hex) {
    // Remove the '#' if present
    hex = hex.replace('#', '');
  
    // Handle shorthand hex color (e.g. #fff -> #ffffff)
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }
  
    // Parse the hex color string into RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    // Normalize RGB values to be between 0 and 1
    return { r: r / 255, g: g / 255, b: b / 255 };
}

function ModifyPage(props) {

    const selectedColor = props.hex;
    const { r, g, b } = hexToRgb(selectedColor); // Convert hex to RGB

    useEffect(() => {
        if(props.buttonType === "download")
        {
            modifyPdf();
            props.resetButtonType();
        }
    },[props.buttonType])
    
    async function modifyPdf()
    {
          const existingPdfBytes = await fetch(props.pdf).then(res => 
            {
                return(res.arrayBuffer());
            })

        const pdfDoc = await PDFDocument.load(existingPdfBytes)
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
        const pages = pdfDoc.getPages()
        const textSize = 16

        props.result.forEach((res) => {
            if(res.type === "text")
            {
                console.log(res.x,res.y,res.ref.current.offsetLeft,res.ref.current.offsetTop);
                console.log("Width",res.ref.current.getBoundingClientRect().width, res.ref.current.offsetWidth);
                pages[res.page - 1].drawText(res.text, {
                    x: res.ref.current.offsetLeft - props.bounds.x,
                    y: props.bounds.y - res.ref.current.offsetTop -17,
                    size: textSize,
                    font: helveticaFont,
                    color: rgb(0.95, 0.1, 0.1),
                    maxWidth: res.ref.current.getBoundingClientRect().width,
                    lineHeight: 15
                })
            }
            if(res.type === "freehand")
            {
                const pathData = "M " +
                res.arr
                .map(p => {
                    return `${p.get('x')},${p.get('y')}`;
                })
                .join(" L ");
                pages[res.page-1].moveTo(0, pages[0].getHeight());
                pages[res.page-1].drawSvgPath(pathData,{
                    borderColor: rgb(r, g, b),
                });
            }
        })
        
        const pdfBytes = await pdfDoc.save()

        let blob = new Blob([pdfBytes], {type: "application/pdf"});
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        let fileName = "generated_File";
        link.download = fileName;
        link.click();

    }

    return (
        <div>
            {/*<button style = {{marginTop: "1%"}} onClick = {modifyPdf}>Download PDF</button>*/}
        </div>
    )
}

export default ModifyPage
