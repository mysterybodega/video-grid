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

class GridComponent extends React.Component {
  constructor(props) {
    super(props);
    this.gridCss = {
      display: 'grid',
      height: `${props.dimensions.height * 10}px`,
      width: `${props.dimensions.width * 10}px`,
      gridTemplateColumns: _.repeat('1fr ', props.dimensions.width),
      gridTemplateRows: 'auto',
      gridGap: '1px'
    };
    this.state = {
      data: []
    };
  }

  componentDidMount() {
    window.requestAnimationFrame(this.tick.bind(this));
  }

  tick() {
    let canvas = this.props.canvasRef.current.getContext('2d');
    let video = this.props.videoRef.current;
    let height = this.props.dimensions.height;
    let width = this.props.dimensions.width;

    canvas.drawImage(video, 0, 0, width, height);
    this.updateGrid(canvas.getImageData(0, 0, width, height));

    _.defer(this.tick.bind(this));
  }

  updateGrid(image) {
    let pixels = _.chunk(image.data, 4);
    let data = _.chunk(pixels, image.width);

    this.setState({ data });
  }

  render() {
    return (
      <div id="grid" style={this.gridCss}>
        {this.state.data.map((row, i) => row.map((pixelData, j) =>
          <GridItemComponent key={`${i}-${j}`} pixelData={pixelData} />
        ))}
      </div>
    );
  }
}

GridComponent.propTypes = {
  dimensions: PropTypes.exact({
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
  }).isRequired
};

function GridItemComponent(props) {
  let [r, g, b] = props.pixelData;
  return <span style={{background: `rgb(${r}, ${g}, ${b})`}}></span>;
}

GridItemComponent.propTypes = {
  pixelData: PropTypes.arrayOf(PropTypes.number).isRequired,
};

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert('This browser does not support the Media Devices API.');
} else {
  ReactDOM.render(<App />, document.getElementById('root'));
}
