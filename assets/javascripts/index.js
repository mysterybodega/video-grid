const dimensions = {
  height: 60,
  width: 80
};

const DimensionsContext = React.createContext(dimensions);

function App(props) {
  let css = {
    position: 'relative'
  };
  let canvasRef = React.useRef(null);
  let videoRef = React.useRef(null);

  return (
    <div style={css}>
      <DimensionsContext.Provider value={dimensions}>
        <CanvasComponent ref={canvasRef} />
        <VideoComponent ref={videoRef} />
        <GridComponent canvasRef={canvasRef} videoRef={videoRef} />
      </DimensionsContext.Provider>
    </div>
  );
}

const CanvasComponent = React.forwardRef((props, ref) => {
  let { height, width } = React.useContext(DimensionsContext);
  let css = {
    position: 'absolute',
    visibility: 'hidden',
    height: `${height * 2 - 1}px`,
    width: `${width * 2 - 1}px`,
  };

  return <canvas ref={ref} style={css}></canvas>;
});

const VideoComponent = React.forwardRef((props, ref) => {
  let { height, width } = React.useContext(DimensionsContext);
  let css = {
    position: 'absolute',
    top: '19px',
    left: '19px',
    zIndex: 10,
    height: `${height * 2 - 1}px`,
    width: `${width * 2 - 1}px`,
    border: '1px solid black',
  };
  let userMediaConfig = { audio: false, video: true };

  navigator.mediaDevices.getUserMedia(userMediaConfig).then(stream => {
    let video = ref.current;
    video.srcObject = stream;
    video.play();
  }, alert);

  return <video ref={ref} autoPlay style={css}></video>;
});

function GridComponent(props) {
  let { height, width } = React.useContext(DimensionsContext);
  let gridCss = {
    display: 'grid',
    height: `${height * 10}px`,
    width: `${width * 10}px`,
    gridTemplateColumns: _.repeat('1fr ', width),
    gridTemplateRows: 'auto',
    gridGap: '1px'
  };
  let [data, setData] = React.useState([]);

  React.useEffect(() => updateData());

  function updateData() {
    let canvas = props.canvasRef.current.getContext('2d');
    let video = props.videoRef.current;
    canvas.drawImage(video, 0, 0, width, height);
    let image = canvas.getImageData(0, 0, width, height);
    let pixels = _.chunk(image.data, 4);
    let data = _.chunk(pixels, image.width);
    setData(data);
  }

  return (
    <div id="grid" style={gridCss}>
      {data.map((row, i) => row.map((pixelData, j) =>
        <span key={`${i}-${j}`} style={{background: `rgb(${pixelData})`}}></span>
      ))}
    </div>
  );
}

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert('This browser does not support the Media Devices API.');
} else {
  ReactDOM.render(<App />, document.getElementById('root'));
}
