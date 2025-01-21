# Leap Presentation

Leap Presentation is a web-based project that combines the power of Ultraleap's **TouchFree Tooling** and HTML5 Canvas to create an interactive environment where users can:

1. Upload and view your PDF document using hand motion.
2. Control and draw on the presentation using Leap Motion's touch-free pointer control using different colors.
3. Download the newly updated presentation

This project is ideal for presentations, annotations, or educational tools, offering a futuristic way to interact with digital content.

## Features

- **PDF Display**: Embed and display PDF files using an `<iframe>`.
- **Interactive Drawing**: Draw on a canvas overlay with Leap Motion pointer controls.
- **Touch-Free Control**: Fully touch-free interaction using Leap Motion's TouchFree tooling.
- **Customizable Drawing**: Change drawing color.

## Prerequisites

1. **Leap Motion Controller**: Ensure you have a Leap Motion device.
2. **TouchFree Application**: Install and configure the Ultraleap TouchFree application.
   - Download: [TouchFree Application](https://developer.leapmotion.com/touchfree)
3. **Web Server**: Use a local or remote web server to serve the project files (e.g., `localhost`).
   
## Run project

Clone the project and run the following command to install the necessary packages:

``` 
npm install 
```

Run the following command to start the application:

``` 
npm start
```

Then, navigate to `http://localhost:8000` in your browser.

### Error: `error:0308010C:digital envelope routines::unsupported`

If the following error is encountered, Use the following command:

```
set NODE_OPTIONS=--openssl-legacy-provider
```

## Usage

1. Connect your Leap Motion device and start the TouchFree application.
2. Open the web page served by your local server.
3. Replace the placeholder PDF in the `<iframe>` (`your-pdf-file.pdf`) with your own PDF file.
4. Use the Leap Motion pointer to interact with the canvas:
   - **Pointer Move**: Move the pointer across the canvas.
   - **Pointer Down**: Start drawing on the canvas.
   - **Pointer Up**: Stop drawing.

## Known Issues

- Ensure the TouchFree application is running; otherwise, pointer events will not work.
- The project requires a web server to serve the files correctly.

## Tools used

### ultraleap
Allows for controlling the presentation using hand gestures
[Chek it out here](https://developer.leapmotion.com/touchfree)
### react-pdf
Aids to display PDFs in your React app as easily as if they were images.
[Chek it out here](https://projects.wojtekmaj.pl/react-pdf/)
### pdf-lib
Supports modification (editing) of existing documents.
[Chek it out here](https://pdf-lib.js.org/)

### Recognition
Web-based real-time hand gesture recognition with React.js, Tensorflow.js and Fingerpose
[Chek it out here](https://github.com/Johnsuuuu/gesture-recognition)