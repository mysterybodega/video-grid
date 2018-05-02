var button = document.getElementById('button');
var canvas = document.getElementById('canvas');
var grid = document.getElementById('grid');
var video = document.getElementById('video');

function setCSS(elem, style) {
  _.each(style, (v, k) => {
    elem.attributeStyleMap.set(k, v);
  });
}

var x = 0, y = 0, h = 60, w = 80;

setCSS(video, { height: CSS.px(h), width: CSS.px(w) });
setCSS(canvas, { height: CSS.px(h), width: CSS.px(w) });

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.src = window.URL.createObjectURL(stream);
  video.play();
});

function drawGrid(image, grid) {
  var pixels = _.map(_.chunk(image.data, 4), (p) => [p[0], p[1], p[2]]);
  var matrix = _.chunk(pixels, image.width);

  var n = 10;
  var gridCSS = {
    'display': 'grid',
    'height': CSS.px(image.height * n),
    'width': CSS.px(image.width * n),
    'grid-template-columns': _.repeat('1fr ', image.width),
    'grid-template-rows': 'auto'
  };

  setCSS(grid, gridCSS);

  while (grid.hasChildNodes()) {
    grid.removeChild(grid.lastChild);
  }

  _.each(matrix, (row, i) => {
    _.each(row, (pixel) => {
      var span = document.createElement('span');
      var spanCSS = {
        'background': 'rgb(' + _.join(pixel, ', ') + ')'
      };
      setCSS(span, spanCSS);
      grid.appendChild(span);
    });
  });
}

function step() {
  var context = canvas.getContext('2d');
  context.drawImage(video, x, y, w, h);
  var image = context.getImageData(x, y, w, h);
  context.putImageData(image, x, y);
  drawGrid(image, grid);
  _.defer(step);
}

window.requestAnimationFrame(step);
