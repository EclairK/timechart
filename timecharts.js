function graph_Description(data) {
  var times = [
    "6:30",
    "7:30",
    "8:30",
    "9:30",
    "10:30",
    "11:30",
    "12:30",
    "13:30",
    "14:30",
    "15:30",
    "16:30",
    "17:30",
    "18:30",
    "19:30",
    "20:30",
    "21:30",
    "22:30",
    "23:30",
    "0:30",
    "1:30",
    "2:30",
    "3:30",
    "4:30",
    "5:30",
    "6:30",
    "7:30",
    "8:30",
    "9:30",
    "10:30",
    "11:30",
    "12:30",
    "13:30",
    "14:30",
    "15:30",
    "16:30",
    "17:30",
    "18:30",
    "19:30",
    "20:30",
    "21:30",
    "22:30",
  ];

  var maxtextLength = maxTextLength(data);
  var paper;
  var tm = 30;
  var sy = tm + 500;
  // 上マージン (凡例用の空間)
  // // 下マージン (表との隙間)
  var bm = 10;
  var pos_text = tm + bm;
  var pos_first_bar = tm + 3;

  // // 右マージン (目盛用の空間)
  var rm = 80;

  // // 左マージン (目盛用の空間)
  var lm = 80;
  var width_Rect_legend = maxtextLength;
  var pos_start_graph = lm + width_Rect_legend + 20;
  var width_graph = 1500;
  var yPitch = Math.ceil(width_graph / times.length);
  var textPitch = (sy - tm - bm) / data.length;
  console.log(textPitch);
  var lineColor = "#d6d6d6";
  var color_of_bar = ["#4472C4", "#FF0000", "#00B050", "#FFC000"];
  var labelColor1 = "#7188b6";
  var txtAxis = {
    "font-size": "12px",
    "font-family": "MS PGothic, Helvetica",
    fill: labelColor1,
    "font-weight": "normal",
    "text-anchor": "middle",
  };
  var txtAxis2 = {
    "font-size": "12px",
    "font-family": "MS PGothic, Helvetica",
    "font-weight": "normal",
    "text-anchor": "start",
  };
  var lt = 0;
  var lt_offset = [0, 230, 560, 830];
  var scale_adjust_rate = yPitch / 60;
  var sx = lm + width_graph + width_Rect_legend + 20;
  var width_bar = setBarWidth(textPitch);


  paper = Raphael("svg", sx, sy);
  drawRect(paper, lm - 20, tm, maxtextLength + 40, sy - tm - 1);

  for (var i = 0; i <= data.length - 1; i += 1) {
    drawText(paper, lm, pos_text + i * textPitch, data[i][0], txtAxis2);
  }

  for (var i = 0; i <= 40; i += 1) {
    drawLine(
      paper,
      pos_start_graph + i * yPitch,
      tm,
      pos_start_graph + i * yPitch,
      sy
    ).attr({ stroke: lineColor, "stroke-width": "1" });
    drawText(paper, pos_start_graph + i * yPitch, tm - 8, times[i], txtAxis);
  }
  drawRect(paper, pos_start_graph, tm, width_graph, sy - tm - 1);

  for (var j = 1; j <= data[0].length; j += 1) {
    var pos_bar = pos_start_graph;
    lt = 0;
    for (var i = 0; i <= data.length - 1; i += 1) {
      if (data[i][j] <= 3) {
        lt = 3;
      } else {
        lt = data[i][j] * scale_adjust_rate;
      }
      drawRect(
        paper,
        pos_bar + lt_offset[j - 1] * scale_adjust_rate,
        pos_first_bar + i * textPitch + (j - 1) * width_bar,
        lt,
        width_bar
      ).attr({
        stroke: "none",
        "stroke-width": "0",
        fill: color_of_bar[j - 1],
      });
      pos_bar += lt;
    }
  }
}

function drawLine(paper, x, y, x2, y2) {
  x = Math.floor(x);
  y = Math.floor(y);
  x2 = Math.floor(x2);
  y2 = Math.floor(y2);
  var xa = 0;
  var ya = 0;
  if (x == x2) {
    ya = 0;
  } else {
    ya = 0.5;
  }
  if (y == y2) {
    xa = 0;
  } else {
    xa = 0.5;
  }
  return paper.path(
    "M" + (x + xa) + " " + (y + ya) + " L" + (x2 + xa) + " " + (y2 + ya)
  );
}

// ----------------------------------------
// 矩形描画 (枠線なし用) x,y:position, w,h:area, r:couner_angle
// ----------------------------------------
function drawRect(paper, x, y, w, h, r) {
  if (h < 0) {
    y = y + h;
    h = Math.abs(h);
  }
  return paper.rect(
    Math.floor(x) + 0.0,
    Math.floor(y) + 0.0,
    Math.floor(w),
    Math.floor(h),
    r
  );
}

function drawText(paper, x, y, str, atr) {
  if (Raphael.type == "VML") {
    var element = document.createElement("span");
    element.innerHTML = str;
    element.style.top = Math.round(y) + "px";
    element.style.left = Math.round(x) + "px";
    element.style.position = "absolute";
    element.style.fontSize = atr["font-size"];
    element.style.marginTop =
      -1 * Math.ceil(getFontSize(atr["font-size"]) / 2) + 1 + "px";
    element.style.fontFamily = atr["font-family"];
    element.style.color = atr["fill"];
    element.noWrap = "true";
    var fontWidth = getFontWidth(atr);
    var width = getBytes(str) * fontWidth;
    element.style.width = width + "px";
    if (atr["text-anchor"] == "start") {
      element.style.textAlign = "left";
    } else if (atr["text-anchor"] == "middle") {
      element.style.textAlign = "left";
      element.style.marginLeft = -1 * (width / 2) + "px";
    } else if (atr["text-anchor"] == "end") {
      element.style.textAlign = "right";
      element.style.marginLeft = -1 * width + "px";
    }
    var objBody = document.getElementById(plotAreaId);
    objBody.appendChild(element);
    return element;
  } else {
    return paper.text(x, y, str).attr(atr);
  }
}

function maxTextLength(data_array) {
  var textWidth = 0;
  for (var i = 0; i <= data_array.length - 1; i++) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    ctx.font = "12px MS PGothic, Helvetica";
    if (textWidth < ctx.measureText(data_array[i][0]).width) {
      textWidth = ctx.measureText(data_array[i][0]).width;
    }
  }
  return textWidth;
}

function setBarWidth(textPitch) {
  for (var width_bar = 10; width_bar > 1; width_bar--) {
    if (width_bar * 4 <= textPitch) {
      return width_bar;
    }

    if (width_bar == 1) {
      console.log("これ以上は線幅を小さくできません");
      return width_bar;
    }
  }
}
