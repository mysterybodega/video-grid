function App(props) {
  let css = {
    position: 'relative'
  };
  let dimensions = {
    height: 60,
    width: 80,
  };
  let canvasRef = React.useRef(null);
  let videoRef = React.useRef(null);

  return (
    <div style={css}>
      <CanvasComponent ref={canvasRef} dimensions={dimensions} />
      <VideoComponent ref={videoRef} dimensions={dimensions} />
      <GridComponent canvasRef={canvasRef} videoRef={videoRef} dimensions={dimensions} />
    </div>
  );
}

const CanvasComponent = React.forwardRef((props, ref) => {
  let css = {
    position: 'absolute',
    visibility: 'hidden',
    height: `${props.dimensions.height * 2 - 1}px`,
    width: `${props.dimensions.width * 2 - 1}px`,
  };

  return <canvas ref={ref} style={css}></canvas>;
});

CanvasComponent.propTypes = {
  dimensions: PropTypes.exact({
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }).isRequired
};

const VideoComponent = React.forwardRef((props, ref) => {
  let css = {
    position: 'absolute',
    top: '19px',
    left: '19px',
    zIndex: 10,
    height: `${props.dimensions.height * 2 - 1}px`,
    width: `${props.dimensions.width * 2 - 1}px`,
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

VideoComponent.propTypes = {
  dimensions: PropTypes.exact({
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }).isRequired
};

function GridComponent(props) {
  let gridCss = {
    display: 'grid',
    height: `${props.dimensions.height * 10}px`,
    width: `${props.dimensions.width * 10}px`,
    gridTemplateColumns: _.repeat('1fr ', props.dimensions.width),
    gridTemplateRows: 'auto',
    gridGap: '1px'
  };
  let [data, setData] = React.useState([]);

  React.useEffect(() => updateData());

  function updateData() {
    let { height, width } = props.dimensions;
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

GridComponent.propTypes = {
  dimensions: PropTypes.exact({
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }).isRequired
};

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert('This browser does not support the Media Devices API.');
} else {
  ReactDOM.render(<App />, document.getElementById('root'));
}
