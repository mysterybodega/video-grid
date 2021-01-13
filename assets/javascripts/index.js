class App extends React.Component {
  constructor(props) {
    super(props);
    this.css = {
      position: 'relative'
    };
    this.dimensions = {
      height: 60,
      width: 80,
    };
    this.canvasRef = React.createRef();
    this.videoRef = React.createRef();
  }

  render() {
    let canvas = <CanvasComponent ref={this.canvasRef} dimensions={this.dimensions} />
    let video = <VideoComponent ref={this.videoRef} dimensions={this.dimensions} />

    return (
      <div style={this.css}>
        {canvas}
        {video}
        <GridComponent canvas={canvas} video={video} dimensions={this.dimensions} />
      </div>
    );
  }
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
    let canvas = this.props.canvas.ref.current.getContext('2d');
    let video = this.props.video.ref.current;
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

function GridItemComponent(props) {
  let [r, g, b] = props.pixelData;
  return <span style={{background: `rgb(${r}, ${g}, ${b})`}}></span>;
}

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert('This browser does not support the Media Devices API.');
} else {
  ReactDOM.render(<App />, document.getElementById('root'));
}
