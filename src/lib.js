"use strict";

const PI = Math.PI;
const PI2 = 2 * PI;
// const PI2 = 6.283;

var _raf = window.requestAnimationFrame;

function _scale(x)
{
	return x * _windowScale;
}

function _x(x)
{
	return _windowWidth / 2 + _scale(x);
}

function _y(y)
{
	return _windowHeight / 2 + _scale(y);
}

function _rscale(x)
{
	return x / _windowScale;
}

function _rx(x)
{
	return _rscale(x) - _rscale(_windowWidth / 2);
}

function _ry(y)
{
	return _rscale(y) - _rscale(_windowHeight / 2);
}


function _parallax(x, distance, weight)
{
//	return x + 1000 * Math.pow(1, -distance) * (1-_p);
	return x + (weight ? weight : 400) * (1 / (distance)) * (1 - _p);
}

function _parallaxPosition(p, distance, weight)
{
	return {
		x: p.x,
		y: _parallax(p.y, distance, weight)
	};
}

function screenCoordinates(p)
{
	return [ _x(p[0]), _y(p[1]) ];
}

function clamp(x, min, max)
{
	if (x < min)
	{
		return min;
	}
	
	if (x > max)
	{
		return max;
	}
	
	return x;
}

function sin(x)
{
	return Math.sin(x * PI2);
}

function cos(x)
{
	return Math.cos(x * PI2);
}

function randFloat()
{
	return Math.random();
}

function randPlusMinus(x)
{
	return (randFloat() - 0.5) * x * 2;
}

function goFullScreen()
{
	// based on https://developers.google.com/web/fundamentals/native-hardware/fullscreen/
/*
	let documentElement = window.document.documentElement;
	let request = documentElement.requestFullscreen || documentElement.mozRequestFullScreen || documentElement.webkitRequestFullScreen || documentElement.msRequestFullscreen;
	request.call(documentElement);
*/
	let d = window.document.documentElement;
	(d.requestFullscreen || d.mozRequestFullScreen || d.webkitRequestFullScreen || d.msRequestFullscreen).call(d);
}

function arrayPick(a)
{
	return a[Math.floor(randFloat() * a.length)];
}

function _arc(p, r, a, b, fill, stroke)
{
	ctx.beginPath();
	ctx.arc(_x(p.x), _y(p.y), _scale(r), a * PI2, b * PI2);
	if (fill)
	{
		ctx.fill();
	}
	
	if (stroke)
	{
		ctx.stroke();
	}
}



//// landscape
function hslaConvert(p, q, t)
{
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1/6) return p + (q - p) * 6 * t;
	if (t < 3/6) return q;
	if (t < 4/6) return p + (q - p) * 6 * (4/6 - t);
	return p
}

function hsla2rgba(h, s, l, a)
{
	// thanks Mohsen! https://stackoverflow.com/a/9493060/460571
	let p, q, r, g, b;
	
	if (l < 0.5)
	{
		q = l * (1 + s);
	}
	else
	{
		q = l + s - l * s;
	}
	
	p = 2 * l - q;
	
	r = Math.floor(hslaConvert(p, q, h + 1/3) * 255);
	g = Math.floor(hslaConvert(p, q, h) * 255);
	b = Math.floor(hslaConvert(p, q, h - 1/3) * 255);
	
	return [ r, g, b, a ];
}

function hsla2rgba_(h, s, l, a)
{
	let c;
	
	c = hsla2rgba(h, s, l, a);
	
	return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + c[3] + ")";
}



//// 3drotate
function pos2(x, y, z, a, b)
{
	let s = sin(b);
	let c = cos(b);
	let s2 = sin(a);
	let c2 = cos(a);
	let p, x2, y2, w;
	
	w = Math.pow(10, z / 10);
	
	x2 = c2 * x + s2 * y;
	y2 = s2 * x - c2 * y;
	
	return [
		(x2 * c) * w,
		(y2 + s * x2 * y2 * settings.distortion) * w
	];
}

function getDistance(p1, p2)
{
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getAngle(p1, p2)
{
	return Math.atan2(p1.y - p2.y, p2.x - p1.x) / PI2;
}

//// event handling
function eventMouseDown(e)
{
	eventMouseMove(e);
	_cursor.clicked = true;
}

function eventMouseMove(e)
{
	e.preventDefault();
	_cursor.x = _rx(e.clientX * window.devicePixelRatio);
	_cursor.y = _ry(e.clientY * window.devicePixelRatio);
}

function eventResize()
{
	let i;
	
	_windowWidth = window.innerWidth * window.devicePixelRatio;
	_windowHeight = window.innerHeight * window.devicePixelRatio;
	_windowScale = Math.min(_windowWidth, _windowHeight) / 400;
	
	for (i=0; i<_layers.length; i++)
	{
		_layers[i].canvas.width = _windowWidth;
		_layers[i].canvas.height = _windowHeight;
		_layers[i].canvas.style.width = (_windowWidth / window.devicePixelRatio) + 'px';
		_layers[i].canvas.style.height = (_windowHeight / window.devicePixelRatio) + 'px';
	}
}

function consumeResource()
{
	_resources[_highlightedResourceCode]--;
}


//// canvas layers
function layerCreate(drawFunction)
{
	let a;
	
	a = { visible: false, canvas: document.createElement("canvas"), draw: drawFunction };
	
	a.ctx = a.canvas.getContext("2d");
	
	_body.appendChild(a.canvas);
	
	_layers.push(a);
	
	// OR, to return index:
	// return _layers.push(a) - 1;
}

function draw()
{
	let i;
	
	_raf(draw);
	
	_frameNumber++;
	_highlightedResourceCode = -1;
	
	drawMain();
	
	for (i=0; i<_layers.length; i++)
	{
		_layers[i].canvas.style.display = _layers[i].visible ? "block" : "none";
		if (_layers[i].visible)
		{
			canvas = _layers[i].canvas;
			ctx = _layers[i].ctx;
			
			// reset to some default values
			ctx.globalCompositeOperation = "source-over";
			ctx.lineCap = "butt";
			ctx.miterLimit = 1;
			ctx.lineJoin = "round";
			ctx.fillStyle = "#000";
			
			_layers[i].draw.call();
			
//			if (DEBUG_BORDER)
			{
				ctx.strokeStyle = "#f00";
				ctx.lineWidth = 1;
				ctx.rect(_x(-200), _y(-200), _scale(400), _scale(400));
				ctx.stroke();
			}
		}
	}
	
	// reset clicking state
	_cursor.clicked = false;
}



///// common gui elements
function drawCircularSelection(p, radius)
{
	let a, c;
	
	ctx.lineCap = "butt";
	ctx.lineWidth = _scale(2);
	
/*
	a = (_frameNumber % 30) / 30;
	c = _frameNumber / 60;
	
	ctx.strokeStyle = "rgba(255,255,255," + Math.max(0, 1 - a * 2) + ")";
	
	_arc(b.position, b.radius + 2 + a * 5, c + 0/6, c + 1/6, 0, 1);
	_arc(b.position, b.radius + 2 + a * 5, c + 2/6, c + 3/6, 0, 1);
	_arc(b.position, b.radius + 2 + a * 5, c + 4/6, c + 5/6, 0, 1);
*/
	
	c = _frameNumber / 60;
	
	ctx.strokeStyle = "#fff";
	
	_arc(p, radius, c + 0/6, c + 1/6, 0, 1);
	_arc(p, radius, c + 2/6, c + 3/6, 0, 1);
	_arc(p, radius, c + 4/6, c + 5/6, 0, 1);
}

function drawGuiStripe(x, y, width, color, outline)
{
	ctx.beginPath();
	ctx.moveTo(_x(x), _y(y));
	ctx.lineTo(_x(x + width), _y(y));
	ctx.lineTo(_x(x + width - 8), _y(y + 12));
	ctx.lineTo(_x(x + - 8), _y(y + 12));
	ctx.closePath();
	
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	
	if (outline)
	{
		ctx.lineWidth = _scale(5);
		ctx.stroke();
		
		ctx.strokeStyle = "#000";
		ctx.lineWidth = _scale(2);
		ctx.stroke();
	}
	
	ctx.fill();
}

function drawGuiBase(skipStripes)
{
	let i;
	
	if (!skipStripes)
	{
		for (i = -400; i < 400; i += 20)
		{
			drawGuiStripe(i, -196, 10, "#222", false);
			drawGuiStripe(i, 184, 10, "#222", false);
		}
	}
	
	drawGuiButton("F", 11, 2, true, goFullScreen);
}

function drawGuiButton(title, x, size, enabled, callback, resourceCodeToHighlight)
{
	let c;
	
	if (_animation.position < 1)
	{
		return;
	}
	
	c = "#0ac";
	
	if (enabled)
	{
		if (_cursor.x > x * 20 - 5 && _cursor.x < x * 20 + size * 20 - 10 + 5 && _cursor.y > 175)
		{
			if (resourceCodeToHighlight !== undefined)
			{
				_highlightedResourceCode = resourceCodeToHighlight;
			}
			
			if (_cursor.clicked)
			{
				c = "#0ac";
				callback.call();
			}
			else
			{
				c = "#fff";
			}
		}
	}
	else
	{
		c = "#222";
	}
	
	drawGuiStripe(x * 20, 184, size * 20 - 10, c, true);
	ctx.fillStyle = "#000";
	ctx.textAlign = "center";
	ctx.font = _scale(10) + "px Arial";
	ctx.fillText(title, _x(x * 20 + (size - 1) * 10 + 1), _y(184 + 9.5));
}

function drawGuiResource(title, resourceCode, x, size)
{
	let background, foreground;
	
	// empty
	if (_resources[resourceCode] == 0)
	{
		background = "#222";
		foreground = "#555";
		
		if (_highlightedResourceCode == resourceCode)
		{
			background = "#800";
			foreground = "#e00";
		}
	}
	else // available
	{
		background = "#030";
		foreground = "#080";
		
		if (_highlightedResourceCode == resourceCode)
		{
			background = "#fff";
			foreground = "#000";
		}
	}
	
	drawGuiStripe(x * 20, -196, size * 20 - 10, background, false);
	ctx.fillStyle = foreground;
	ctx.textAlign = "center";
	ctx.font = _scale(9) + "px Arial";
	ctx.fillText(title + ": " + _resources[resourceCode], _x(x * 20 + (size - 1) * 10 + 1), _y(-196 + 9.5));
}

function drawGuiResources()
{
	drawGuiResource("Long jump fuel", RESOURCE_LONG_JUMP, -10, 5);
	drawGuiResource("Short jump fuel", RESOURCE_SHORT_JUMP, -5, 5);
	drawGuiResource("Rocket fuel", RESOURCE_ROCKET, 0, 5);
}
