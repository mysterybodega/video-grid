class App extends React.Component {
  render() {
    let height = 60
    let width = 80

    return (
      <div style={{position: 'relative'}}>
        <CanvasComponent height={height} width={width} />
        <VideoComponent height={height} width={width} />
        <GridComponent height={height} width={width} />
      </div>
    );
  }
}

function CanvasComponent(props) {
  let css = {
    position: 'absolute',
    visibility: 'hidden',
    height: `${props.height * 2 - 1}px`,
    width: `${props.width * 2 - 1}px`,
  };

  return <canvas id="canvas" style={css}></canvas>;
}

function VideoComponent(props) {
  let css = {
    position: 'absolute',
    top: '19px',
    left: '19px',
    zIndex: 10,
    height: `${props.height * 2 - 1}px`,
    width: `${props.width * 2 - 1}px`,
    border: '1px solid black',
  };
  let userMediaConfig = { audio: false, video: true };

  navigator.mediaDevices.getUserMedia(userMediaConfig).then(stream => {
    video.srcObject = stream;
    video.play();
  }, alert);

  return <video id="video" autoPlay style={css}></video>;
}

class GridComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: props.height,
      width: props.width,
      gridCss: {
        display: 'grid',
        height: `${props.height * 10}px`,
        width: `${props.width * 10}px`,
        gridTemplateColumns: _.repeat('1fr ', props.width),
        gridTemplateRows: 'auto',
        gridGap: '1px'
      },
      data: [],
    };
  }

  componentDidMount() {
    window.requestAnimationFrame(this.tick.bind(this));
  }

  tick() {
    let canvas = document.getElementById('canvas').getContext('2d');
    let video = document.getElementById('video');

    canvas.drawImage(video, 0, 0, this.state.width, this.state.height);
    this.updateGrid(canvas.getImageData(0, 0, this.state.width, this.state.height));

    _.defer(this.tick.bind(this));
  }

  updateGrid(image) {
    let pixels = _.chunk(image.data, 4);
    let data = _.chunk(pixels, image.width);

    this.setState({ data });
  }

  render() {
    let gridItems = this.state.data.map((row, i) =>
      row.map((pixel, j) => {
        let key = `${i}-${j}`;
        let [r, g, b] = pixel;
        let css = { background: `rgb(${r}, ${g}, ${b})` };
        return <span key={key} style={css}></span>;
      })
    );

    return <div id="grid" style={this.state.gridCss}>{gridItems}</div>;
  }
}

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  alert('This browser does not support the Media Devices API.');
} else {
  ReactDOM.render(<App />, document.getElementById('root'));
}
