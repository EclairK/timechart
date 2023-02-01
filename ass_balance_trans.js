// ================================================================================
// 資産の推移グラフ
// ================================================================================
function drawAssBalansTransGraph(plotAreaId, toolTipDesc1, data1, ToolTipDesc2, data2, isAnimate, isAccManage) {

	// 描画領域
	var paper;

	// 描画領域の大きさ
	var sx = 924;
	var sy = 340;

	// 上マージン (凡例用の空間)
	var tm = 40;

	// 下マージン (表との隙間)
	var bm = 20;

	// 右マージン (目盛用の空間)
	var rm = 80;

	// 左マージン (目盛用の空間)
	var lm = 80;

	// 枠線の色
	var lineColor = "#d6d6d6";

	// 0円のところの横線(オレンジ線)
	var lineColor2 = "#ff7500";

	// 凡例を囲む色、0円のところの横線
	var lineColor3 = "#999999";

	// 資産総額の色
	var color1 = "#bdcfea";

	// 資産総額の色(ハイライト)
	var color1high = "#cedeff";

	// 評価損益の線の色
	var color2 = "#d52b55";

	// 資産総額の色(文字)
	var labelColor1 = "#7188b6";

	// 評価損益の色(文字)
	var labelColor2 = "#d52b55";


	// ツールチップ枠
	var toolTipRect;

	// ツールチップテキスト
	var toolTipText = new Array(toolTipDesc1.length + 1);	// +1は評価損益の分

	// 描画した棒グラフの棒を保存しておく配列
	var objBar;

	// 縦棒
	var vLine;

	// ポイントの円
	var pointCircle;

	// ハイライトにした棒のインデックス
	var hilightBar;

	// イベント再入フラグ
	var reFlg = false;

	// 棒の太さ
	var bw;

	// 棒と棒の間隔
	var bp;

	// 折れ線グラフのxyピッチ
	var xPitchC;
	var yPitchC;

	// 折れ線グラフの目盛り情報
	var yAxis2;

	// ----------------------------------------
	// 資産の推移グラフの描画
	// ----------------------------------------
	function init() {

		if (Raphael.type == "VML"){
			isAnimate = false;
		}
		
		// 描画領域
		paper = Raphael(plotAreaId, sx, sy);
		document.getElementById(plotAreaId).style.position = 'relative';

		// 棒の太さ(この値の2倍が実際の幅)
		bw = ((sx - rm - lm) / data1.length) * 0.5 / 2;

		// 棒と棒の間隔(1本目以降)
		bp = ((sx - rm - lm) / data1.length) * 0.5;

		// 棒グラフの棒保存配列初期化
		objBar = new Array(data1.length);

		// ツールチップ初期化
		initToolTip();

		// 縦棒初期化
		initVLine(plotAreaId);

		// 引数の値を数値変換
		for (var i = 0; i < data1.length; i++) {
			for (var j = 0; j < data1[i].length; j++) {
				if (j != 0) {
					if (data1[i][j] == "") {
						data1[i][j] = null;
					} else {
						data1[i][j] = parseFloat(data1[i][j]);
					}
				}
			}
		}
		for (var i=0; i<data2.length; i++) {
			if (data2[i] == "") {
				data2[i] = 0;
			} else {
				data2[i] = parseFloat(data2[i]);
			}
		}

		// 棒グラフ、折れ線グラフ、それぞれの最大値を探す
		var max1 = -999999999999;	//Number.MIN_VALUE;	// 棒グラフの最大値
		var max2 = -999999999999;	//Number.MIN_VALUE;	// 折れ線グラフの最大値
		for (var i = 0; i < data1.length; i++) {
			if (data1[i][1] != null) {
				if (max1 < data1[i][1]) {
					max1 = data1[i][1];
				}
			}
			if (data2[i] != null) {
				if (max2 < data2[i]) {
					max2 = data2[i];
				}
			}
		}

		// 棒グラフ、折れ線グラフ、それぞれの最小値を探す
		var min1 = 999999999999;	//Number.MAX_VALUE;
		var min2 = 999999999999;	//Number.MAX_VALUE;
		for (var i = 0; i < data1.length; i++) {
			if (data1[i][1] != null) {
				if (min1 > data1[i][1]) {
					min1 = data1[i][1];
				}
			}
			if (data2[i] != null) {
				if (min2 > data2[i]) {
					min2 = data2[i];
				}
			}
		}
		// 最小値がプラスなら、通常の0～のグラフとする
		if (min1 > 0) {
			min1 = 0;
		}
		if (min2 > 0) {
			min2 = 0;
		}
		// 最小値も最大値もマイナスなら、通常の0～のグラフとする
		if (min1 < 0 && max1 < 0) {
			max1 = 0;
		}
		if (min2 < 0 && max2 < 0) {
			max2 = 0;
		}

		// 凡例を囲む枠線
		drawRectWithFrame(paper, 0,  0, 80, 27, 4).attr({"stroke-width": "1", "stroke": lineColor3});

		// 凡例
		drawRect(paper, 0 + 5, 7, 16, 12, 2).attr({"stroke": "none", "stroke-width":"0", "fill": color1});


		// 凡例文字列
		var txtSta1 = {"font-size": "12px", "font-family": "MS Gothic, Helvetica", "fill": labelColor1, "font-weight": "normal", "text-anchor": "start"};
		drawText(paper,       0 + 24, 13, toolTipDesc1[1], txtSta1);


		// ----------------------------------------
		// 棒グラフ描画
		// ----------------------------------------

		// 縦軸を描画する為の情報を算出
		var yAxis = getYAxisInfoDelta(max1, min1);

		// 縦軸情報を元に最大値変更

		// y軸倍率
		var yPitch = (sy - tm - bm) / (yAxis.start - yAxis.end);

		// Y軸補正値
		var yAdjust = yAxis.end * yPitch;

		// 縦軸ラベル(左)文字列の書式
		var txtAxis = {"font-size": "12px", "font-family": "MS PGothic, Helvetica", "fill": labelColor1, "font-weight": "normal", "text-anchor": "end"};
		var txtAxis2 = {"font-size": "12px", "font-family": "MS PGothic, Helvetica", "fill": labelColor1, "font-weight": "normal", "text-anchor": "start"};	// 評価損益を表示するようになったら削除

		// 縦軸描画
		for (var i = yAxis.start; i >= yAxis.end; i -= yAxis.step) {
			// Y軸線
			if (i == 0) {
				////一番下の横線を書く場所
				drawRectWithFrame(paper, lm, sy - Math.floor(i * yPitch) - bm + yAdjust, sx - lm - rm, 2).attr({"stroke": lineColor3, "stroke-width": "1"});
			} else {
				//横線を書く場所
				drawLine(paper, lm, sy - Math.floor(i * yPitch) - bm + yAdjust, sx - rm, sy - Math.floor(i * yPitch) - bm + yAdjust).attr({"stroke": lineColor, "stroke-width": "1"});
			}
			// 目盛文字左
			drawText(paper, lm - 8, sy - Math.floor(i * yPitch) - bm + yAdjust, addFigure2(i), txtAxis);
			// 目盛文字右
			drawText(paper, sx - rm + 8, sy - Math.floor(i * yPitch) - bm + yAdjust, addFigure2(i), txtAxis2);	// 評価損益を表示するようになったら削除
		}


		// 横軸ラベル文字列の書式
		var txtAtr = {"font-size": "11px", "font-family": "MS PGothic, Helvetica", "fill": "#333333", "font-weight": "normal", "text-anchor": "middle"};

		// 何回に１回凡例を描画するか
		var xlp = getPicth(txtAtr);
		// 凡例を描画カウンタ
		var xlpc = xlp - 1;

		// 資産総額の描画
		for (var i = 0; i < data1.length; i++) {
			if (xlpc == 0) {
				// x軸短い縦線
				drawLine(paper, i * (bw * 2 + bp) + lm + (bp / 2) + bw, sy - bm, i * (bw * 2 + bp) + lm + (bp / 2) + bw, sy - bm + 4).attr({"stroke": lineColor3, "stroke-width": "1"});

				// x軸文字列
				drawText(paper, i * (bw * 2 + bp) + lm + (bp / 2) + bw, sy - 9, data1[i][0], txtAtr);
			}
			xlpc++;
			if (xlpc >= xlp) {
				xlpc = 0;
			}

			if (data1[i][1] != null) {
				if (!isAnimate) {
					// 棒
					objBar[i] = drawRect(paper, i * (bw * 2 + bp) + lm + (bp / 2), sy - Math.floor(data1[i][1] * yPitch) - bm + yAdjust, bw * 2, Math.floor(data1[i][1] * yPitch)).attr({"stroke": "none", "stroke-width": "0", "fill": color1});
				} else {
					// 棒
					objBar[i] = drawRect(paper, i * (bw * 2 + bp) + lm + (bp / 2), sy - bm + yAdjust, bw * 2, 1).attr({"stroke": "none", "stroke-width": "0", "fill": color1});
					if (data1[i][1] * yPitch > 0) {
						objBar[i].animate({
							height: Math.abs(Math.floor(data1[i][1] * yPitch)),
							y: (sy - Math.floor(data1[i][1] * yPitch) - bm) + yAdjust
						}, 800);
					} else {
						objBar[i].animate({
							height: Math.abs(Math.floor(data1[i][1] * yPitch)),
							y: (sy - Math.floor(0 * yPitch) - bm) + yAdjust
						}, 800);
					}
				}
			}
		}

		xPitchC = (bw * 2 + bp);	// この行大事

	}

	// ----------------------------------------
	// 縦軸を描画する為の情報を算出
	// ----------------------------------------
	function getYAxisInfoDelta(yMax, yMin) {

		// yの最大、最小が共に0のとき
		if (yMax == 0 && yMin == 0) {
			var obj = new Object();
			obj.start = 1;
			obj.step = 1;
			obj.end = 0;
			return obj;
		}

		// 差
		var delta = yMax - yMin;
		var sn = 0;
		var tn = 0;

		// yの最大と最小の差が0の場合(yMax と yMin が等しい場合)
		if (delta == 0) {
			sn = yMax;
		} else {
			sn = delta;
		}
		//alert("ymax:" + yMax + " ymin:" + yMin);
		//alert("delta:" + delta);

		// delta の最初の桁    sn を求める (例: 270 →2、 3800 → 3)
		// delta の最大の10^n  tn を求める (例: 270 → 100、 3800 → 1000)
		tn = 1;
		while (sn >= 10) {
			sn /= 10;
			tn *= 10;
		}
		while (sn < 1) {
			sn *= 10;
			tn /= 10;
		}
		sn = Math.floor(sn);

		// ステップの算出
		var step = 0;
		if (sn >= 7) {
			step = 2   * tn;
		} else if (sn >= 5) {
			step = 1.5   * tn;
		} else if (sn >= 2) {
			step = 1   * tn;
		} else {
			step = 0.5 * tn;
		}

		var start = 0;
		var end = 0;

		// 最小値が0以下の場合
		if (yMin < 0) {

			// 最小値を1回だけ超えた、最小のステップ * n を求める
			end = 0;
			while (end >= Number(yMin)) {
				end -= step;
			}

			// 横軸の線の開始位置 (ステップの6倍固定)
			start = end + (step * 6);

		} else {

			// 横軸の線の開始位置 (ステップの6倍固定)
			start = step * 6;

		}
		//alert("yMax:" + yMax + " " + "delta:" + delta + " " + "sn:" + sn + " " + "tn:" + tn + " " + "step:" + step + " " + "start:" + start);

		// 戻り値作成
		var obj = new Object();
		obj.start = start;
		obj.step = step;
		obj.end = end;
		return obj;
	}

	// ----------------------------------------
	// ツールチップ初期化
	// ----------------------------------------
	function initToolTip() {

		// ツールチップ枠
		toolTipRect = document.createElement("div");
		toolTipRect.id = "toolTipRect";
		if (Raphael.type == "VML") {
			toolTipRect.style.cssText = "border: solid 1px #bdcfea; padding: 6px 0px 6px 0px; background : #ffffff; filter:alpha(opacity=85); border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px;";
		} else {
			toolTipRect.style.cssText = "border: solid 1px #bdcfea; padding: 6px 0px 6px 0px; background-color: rgba(255,255,255,0.85); border-radius: 4px; -webkit-border-radius: 4px; -moz-border-radius: 4px;";
		}
		toolTipRect.style.position = 'absolute';
		toolTipRect.style.zIndex = "50000";
		toolTipRect.style.display = "none";
		document.getElementById(plotAreaId).appendChild(toolTipRect);

		// 行の書式
		var trAtr;
		if(isAccManage){
			if (Raphael.type == "VML") {
				trAtr = new Array(
					"line-height: 18px;",
					"line-height: 18px; background-color: #bdcfea;",
					"line-height: 18px; background-color: #e5e7f7;",
					"line-height: 18px; background-color: #ffffce;"
				);
			} else {
				trAtr = new Array(
					"line-height: 18px;",
					"line-height: 18px; background-color: rgba(189,207,234,0.70);",
					"line-height: 18px; background-color: rgba(229,231,247,0.70);",
					"line-height: 18px; background-color: rgba(255,255,206,0.70);"
				);
			}
		}else{
			if (Raphael.type == "VML") {
				trAtr = new Array(
					"line-height: 18px;",
					"line-height: 18px; background-color: #bdcfea;",
					"line-height: 18px; background-color: #e5e7f7;",
					"line-height: 18px; background-color: #ffffce;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;"
				);
			} else {
				trAtr = new Array(
					"line-height: 18px;",
					"line-height: 18px; background-color: rgba(189,207,234,0.70);",
					"line-height: 18px; background-color: rgba(229,231,247,0.70);",
					"line-height: 18px; background-color: rgba(255,255,206,0.70);",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;",
					"line-height: 18px;"
				);
			}
		}
		// ラベルの書式 // font-family: MS PGothic, Helvetica;
		if(isAccManage){
			var labelAtr = new Array(
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: bold;   padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: bold;   padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: bold;   padding-left:6px;"
				);
				// 値(金額)の書式
				var txtAtr = new Array(
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;"
				);
		}else{
			var labelAtr = new Array(
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: bold;   padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: bold;   padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: bold;   padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;",
					"font-size: 12px; color: #333333; font-weight: normal; padding-left:6px;"
				);
				// 値(金額)の書式
				var txtAtr = new Array(
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;",
					"font-size: 13px; color: #333333; font-weight: bold; padding-right:6px;"
				);
		}

		var html = "";
		html = html + '<table border="0" cellpadding="0" cellspacing="0">';
		for (var i = 0; i < toolTipDesc1.length; i++) {
			html = html + '<tr style="' + trAtr[i] + '">';
			if (toolTipDesc1[i] == "") {
				// 値
				html = html + '<td colspan="2" id="graphToolTipText' + i + '" style="' + labelAtr[i] + '">';
			} else {
				// ラベル
				html = html + '<td style="' + labelAtr[i] + '">' + toolTipDesc1[i] + '：' + '</td>';
				// 値
				html = html + '<td id="graphToolTipText' + i + '" style="' + txtAtr[i] + '" align="right"></td>';
			}
			html = html + '</tr>';
		}
		html = html + '</table>'
		//alert(html);

		var o = document.createElement("div");
		o.innerHTML = html;
		toolTipRect.appendChild(o);

		for (var i = 0; i < toolTipDesc1.length; i++) {
			toolTipText[i] = $("#graphToolTipText" + i);
		}
	}

	// ----------------------------------------
	// 縦線初期化
	// ----------------------------------------
	function initVLine(plotAreaId) {
		// 縦線
		vLine = drawLine(paper, 0, tm, 0, (sy - bm)).attr({stroke:lineColor}).hide();

		// 評価損益の強調●
//		pointCircle = paper.circle(0, 0, 5).attr({fill: color2, stroke: "#ffffff", "stroke-width": 1.3}).hide();

		// マウス移動イベント設定
		var area = document.getElementById(plotAreaId);
		area.onmousemove = function(e){
			if (reFlg == false) {
				reFlg = true;
			} else {
				return;
			}
			if (!e) e = window.event;
			var mouseY = e.clientY - area.getBoundingClientRect().top;
			var mouseX = e.clientX - area.getBoundingClientRect().left;
			moveLineAndShowToolTip(mouseX, mouseY);
			reFlg = false;
		};
	}

	// ----------------------------------------
	// マウスカーソル移動時の処理
	// ----------------------------------------
	function moveLineAndShowToolTip(mouseX, mouseY) {

		// マウスカーソルがグラフ内に入っていない場合
		if (mouseY < (tm) || mouseY > (sy - bm) || mouseX > (sx - rm) || mouseX < lm) {
			// ツールチップの枠、縦線、強調●を非表示
			toolTipRect.style.display = "none";
			vLine.hide();
//			pointCircle.hide();

			// 棒のハイライトを元に戻す
			if (hilightBar != null) {
				hilightBar.attr({"fill": color1});
				hilightBar = null;
			}

			return;
		}

		// ツールチップの枠、縦線、強調●を非表示
		toolTipRect.style.display = "none";
		vLine.hide();
//		pointCircle.hide();

		// 棒のハイライトを元に戻す
		if (hilightBar != null) {
			hilightBar.attr({"fill": color1});
			hilightBar = null;
		}

		// マウスカーソル位置に対応する要素を求める
		p = Math.round((mouseX - lm - (xPitchC / 2)) / xPitchC);

		if (p < 0 || p > data1.length-1) {
			return;
		}

		x = p * xPitchC + lm + (xPitchC / 2);
//		y = sy - ((data2[p] - yAxis2.end) * yPitchC) - bm;

		// 縦線の移動
		vLine.transform("t" + Math.floor(x) + "," + "0");

		// 強調●の移動
//		pointCircle.transform("t" + x + "," + y);

		// 棒のハイライト
		objBar[p].attr({"fill": color1high});
		hilightBar = objBar[p];	// ハイライトした棒を記憶

		// ツールチップの値を書き換え
		var str;
		for (var i = 0; i < toolTipDesc1.length; i++) {
			if (i == 0) {
				str = formatDate(data1[p][i]);
			} else {
				if (data1[p][i] == null) {
					str = "-";
				} else {
					str = addFigure(data1[p][i]) + "円";
				}
			}
			toolTipText[i].html(str);
		}

		// ツールチップのXYはマウス座標で置き換え
		y = mouseY;
		x = mouseX;

		var toolTipWidth = $("#toolTipRect").width();
		var toolTipHeight = $("#toolTipRect").height();

		var tx;
		if (x < toolTipWidth + 16) {
			tx = x + 16;
		} else {
			tx = x -1 * (toolTipWidth + 16);
		}
		var ty = y - ((toolTipHeight + 14) / 2);		// +14は枠のマージン分
		if (ty < 0) {
			ty = 0;
		}
		if (ty + (toolTipHeight + 14) > sy) {			// +14は枠のマージン分
			ty = sy - (toolTipHeight + 14);				// +14は枠のマージン分
		}
		toolTipRect.style.left = tx + "px";
		toolTipRect.style.top = ty + "px";

		toolTipRect.style.display = "block";
		vLine.show();
//		pointCircle.toFront().show();
	}


	// ================================================================================
	// 共通ルーチン
	// ================================================================================

	// ----------------------------------------
	// 線分描画
	// ----------------------------------------
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
	// 矩形描画 (枠線なし用)
	// ----------------------------------------
	function drawRect(paper, x, y, w, h, r) {
		if (h < 0) {
			y = (y + h);
			h = Math.abs(h);
		}
		return paper.rect((Math.floor(x) + 0.00), (Math.floor(y) + 0.00), Math.floor(w), Math.floor(h), r);
	}

	// ----------------------------------------
	// 矩形描画 (枠線あり用)
	// ----------------------------------------
	function drawRectWithFrame(paper, x, y, w, h, r) {
		if (h < 0) {
			y = (y + h);
			h = Math.abs(h);
		}
		return paper.rect((Math.floor(x) + 0.50), (Math.floor(y) + 0.50), Math.floor(w)-1, Math.floor(h)-1, r);
	}

	// ----------------------------------------
	// 数値のカンマ区切りフォーマット
	// ----------------------------------------
	function addFigure(str) {
		var num = new String(str).replace(/,/g, "");
		while(num != (num = num.replace(/^(-?\d+)(\d{3})/, "$1,$2")));
		return num;
	}

	// ----------------------------------------
	// 数値の万、千万、億フォーマット
	// ----------------------------------------
	function addFigure2(num) {
		// 1万以下はそのまま
		if (Math.abs(num) < 10000) {
			return addFigure(num);
		}
		num = num / 10000;
		if (Math.abs(num) >= 10000) {
			num = num / 10000;
			return addFigure(num) + "億";
		} else {
			return addFigure(num) + "万";
		}
	}

	// ----------------------------------------
	// テキストの描画
	// ----------------------------------------
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

	function getFontSize(size) {
		return Number(size.replace("px",""));
	}

	function getFontWidth(atr) {
		return Math.round(getFontSize(atr['font-size']) / 1.8);
	}

	// ----------------------------------------
	// 何個に１回凡例がかけるか返す
	// ----------------------------------------
	function getPicth(atr) {

		// 一番長い凡例のバイト数
		var maxlen = 0;
		for (var i=0; i < data1.length; i++) {
			var len = getBytes(data1[i][0]);
			if (maxlen < len) {
				maxlen = len;
			}
		}

		// 一番長い凡例のドット数
		maxlen = maxlen * getFontWidth(atr);
		maxlen = maxlen + 8;	// ぴっちりは厳しいので少し余裕

		// 横幅にいくつ凡例がならべられるか (描画に使える横幅 / 一番長い凡例の横幅)
		var c = (sx - lm - rm) / maxlen;

		// 凡例を何回に１回描画するか
		var p = Math.ceil(data1.length);
		if (p < 1) {
			p = 1;
		}
		p=1;
		console.log(p);
		return p;
	}

	// ----------------------------------------
	// 文字列のバイト数を求める(半角1、全角2)
	// ----------------------------------------
	function getBytes(str) {
		var cnt = 0;
		for (var i = 0; i < str.length; i++) {
			var n = escape(str.charAt(i));
			if (n.length < 4) {
				cnt++;
			} else {
				cnt += 2;
			}
		}
		return cnt;
	}

	// ----------------------------------------
	// 日付のフォーマット
	// ----------------------------------------
	function formatDate(date) {
		var d = date.split("/");
		if (d.length == 3) {
			return d[0] + "年" + d[1] + "月" + d[2] + "日";
		} else if (d.length == 2) {
			return d[0] + "年" + d[1] + "月";
		} else if (d.length == 1) {
			return d[0] + "年";
		}
	}

	// 初期表示処理呼び出し
	init();
}
