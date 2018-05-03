var css = {
  px: function(n) {
    return n + 'px';
  },
  rgb: function(colors) {
    return 'rgb(' + _.join(colors, ', ') + ')';
  },
  set: function(e, rules) {
    _.each(rules, (v, k) => e.style[k] = v);
  }
};

function drawGrid(image) {
  var grid = document.getElementById('grid');
  var pixels = _.map(_.chunk(image.data, 4), (p) => [p[0], p[1], p[2]]);
  var matrix = _.chunk(pixels, image.width);
  var n = 10;
  var gridCSS = {
    'height': css.px(image.height * n),
    'width': css.px(image.width * n),
    'grid-template-columns': _.repeat('1fr ', image.width)
  };

  css.set(grid, gridCSS);

  if (grid.hasChildNodes()) {
    var i = 0;
    _.each(matrix, row => {
      _.each(row, pixel => {
        css.set(grid.childNodes[i], { 'background': css.rgb(pixel) });
        i += 1;
      });
    });
  } else {
    var gridChildren = document.createDocumentFragment();
    _.each(matrix, row => {
      _.each(row, pixel => {
        var span = document.createElement('span');
        css.set(span, { 'background': css.rgb(pixel) });
        gridChildren.append(span);
      });
    });
    grid.appendChild(gridChildren);
  }
}

function step(height, width) {
  var canvas = document.getElementById('canvas').getContext('2d');
  var video = document.getElementById('video');

  canvas.drawImage(video, 0, 0, width, height);
  drawGrid(canvas.getImageData(0, 0, width, height));

  _.defer(() => step(height, width));
}

function initGrid(height, width) {
  window.requestAnimationFrame(() => step(height, width));
}

function initCanvas(height, width) {
  var canvas = document.getElementById('canvas');
  var canvasCSS = {
    height: css.px(height * 2 - 1),
    width: css.px(width * 2 - 1)
  };

  css.set(canvas, canvasCSS);
}

function initVideo(height, width) {
  var video = document.getElementById('video');
  var videoCSS = {
    height: css.px(height * 2 - 1),
    width: css.px(width * 2 - 1)
  };

  css.set(video, videoCSS);

  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.src = window.URL.createObjectURL(stream);
    video.play();
  });
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  var height = 60;
  var width = 80;

  initCanvas(height, width);
  initVideo(height, width);
  initGrid(height, width);
} else {
  alert(
    'Error accessing camera API. ' +
    'Try using the latest version of Chrome or Firefox.'
  );
}
