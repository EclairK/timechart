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
    return paper.path("M" + (x + xa) + " " + (y + ya) + " L" + (x2 + xa) + " " + (y2 + ya));
}

// ----------------------------------------
// 矩形描画 (枠線なし用) x,y:position, w,h:area, r:couner_angle
// ----------------------------------------
function drawRect(paper, x, y, w, h, r) {
    if (h < 0) {
        y = (y + h);
        h = Math.abs(h);
    }
    return paper.rect((Math.floor(x) + 0.00), (Math.floor(y) + 0.00), Math.floor(w), Math.floor(h), r);
}

// ----------------------------------------
// 矩形描画 (枠線あり用) 太線になるだけ
// ----------------------------------------
function drawRectWithFrame(paper, x, y, w, h, r) {
    if (h < 0) {
        y = (y + h);
        h = Math.abs(h);
    }
    return paper.rect((Math.floor(x) + 0.50), (Math.floor(y) + 0.50), Math.floor(w)-1, Math.floor(h)-1, r);
}

function drawText(paper, x, y, str, atr) {
    if (Raphael.type == "VML") {
        var element = document.createElement('span');
        element.innerHTML = str;
        element.style.top = Math.round(y) + "px";
        element.style.left = Math.round(x) + "px";
        element.style.position = "absolute";
        element.style.fontSize = atr['font-size'];
        element.style.marginTop = ((-1 * Math.ceil(getFontSize(atr['font-size']) / 2)) + 1) + "px";
        element.style.fontFamily = atr['font-family'];
        element.style.color=atr['fill'];
        element.noWrap = "true";
        var fontWidth = getFontWidth(atr);
        var width = getBytes(str) * fontWidth;
        element.style.width = width + "px";
        if (atr['text-anchor'] == "start") {
            element.style.textAlign="left";
        } else if (atr['text-anchor'] == "middle") {
            element.style.textAlign="left";
            element.style.marginLeft = (-1 * (width / 2)) + "px";
        } else if (atr['text-anchor'] == "end") {
            element.style.textAlign="right";
            element.style.marginLeft = (-1 * width) + "px";
        }
        var objBody = document.getElementById(plotAreaId);
        objBody.appendChild(element);
        return element;
    } else {
        return paper.text(x, y, str).attr(atr);
    }
}