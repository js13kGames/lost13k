"use strict";

function generateBody(parent, size, r, speed, type)
{
	let a = {
		parent: parent,
		def: arrayRandom(BODY_TYPE_DEFINITIONS[type]),
		radiusBase: size,
		radiusScale: randFloat(),
		radius: 0,
		orbitRadius: r,
		position: randFloat(),
		speed: speed * (randFloat() + 0.5) * 5,
		type: type,
		childCount: 0
	};
	
	a.radius = a.radiusBase * (a.radiusScale + 0.8);
	
	if (parent)
	{
		parent.childCount++;
	}
	
	// randomize color a bit
	a.def[0] *= 1 + randPlusMinus(0.025);
	
	return a;
}

function updateBodies()
{
	let i, b;
	
	for (i=0; i<_currentSystem.bodies.length; i++)
	{
		b = _currentSystem.bodies[i];
		b.position += b.speed;
		
		if (b.type == BODY_TYPE_STAR)
		{
			b.centerX = 0;
			b.centerY = 0;
			b.positionX = 0;
			b.positionY = 0;
		}
		else
		{
			b.centerX = b.parent.positionX;
			b.centerY = b.parent.positionY;
			b.positionX = b.centerX + cos(b.position) * b.orbitRadius;
			b.positionY = b.centerY + sin(b.position) * b.orbitRadius;
		}
	}
}

function drawBodies()
{
	let i, j, a, b, c, stripes, clicked;
	
	ctx.lineCap = "round";
	
	for (i=0; i<_currentSystem.bodies.length; i++)
	{
		b = _currentSystem.bodies[i];
		
		if (b.type == BODY_TYPE_PLANET)
		{
			ctx.lineWidth = _scale(1.5);
		}
		else
		{
			ctx.lineWidth = _scale(1);
		}
		
		stripes = b.orbitRadius * 0.8;
		
		for (j=0; j<stripes; j++)
		{
			c = ((stripes - j) / stripes);
			
			if (b.type == BODY_TYPE_PLANET)
			{
				ctx.strokeStyle = hsla2rgba_(b.parent.def[0], b.parent.def[1], b.parent.def[2], c);
			}
			else
			{
				ctx.strokeStyle = "rgba(0,200,255," + c + ")";
			}
			
			a = b.position - j * 2 * 1/(stripes * 2 * 1.1);
			
			_arc(b.centerX, b.centerY, b.orbitRadius, a - 1 / (stripes * 5), a, 0, 1);
		}
	}
	
	ctx.globalCompositeOperation = "source-over";
	
	for (i=0; i<_currentSystem.bodies.length; i++)
	{
		b = _currentSystem.bodies[i];
		
		// planet
		if (b.type == BODY_TYPE_PLANET)
		{
			// atmosphere
			ctx.lineWidth = _scale(1);
			ctx.strokeStyle = hsla2rgba_(0.4, 0.2, 0.8, 0.7);
			_arc(b.positionX, b.positionY, b.radius + 1.5, 0, 1, 0, 1);
		}
		
		ctx.fillStyle = hsla2rgba_(b.def[0], b.def[1], b.def[2], 1);
		_arc(b.positionX, b.positionY, b.radius, 0, 1, 1);
		
		// no shadow on the star
		if (b.type == BODY_TYPE_STAR)
		{
			continue;
		}
		
		// planet
		if (b.type == BODY_TYPE_PLANET)
		{
			c = b.position + 0.25;
		}
		// moon
		else
		{
			c = b.parent.position + 0.25;
		}
		
		// sunny side
		ctx.fillStyle = hsla2rgba_(_currentSystem.bodies[0].def[0], _currentSystem.bodies[0].def[1], _currentSystem.bodies[0].def[2], 0.2);
		_arc(b.positionX, b.positionY, b.radius, 0, 1, 1);
		
		// shadow
		ctx.fillStyle = "rgba(0,0,0,0.4)";
		_arc(b.positionX, b.positionY, b.radius, c - 0.5, c, 1);
	}
	
	clicked = false;
	
	if (_cursor.clicked && _cursor.y > -180 && _cursor.y < 180)
	{
		clicked = true;
		_selectedBody = null;
	}
	
	for (i=0; i<_currentSystem.bodies.length; i++)
	{
		b = _currentSystem.bodies[i];
		
		if (b.type != BODY_TYPE_STAR)
		{
			if (getDistance({ x: b.positionX, y: b.positionY }, _cursor) < b.radius + 4)
			{
				if (clicked)
				{
					_selectedBody = b;
				}
				drawCircularSelection({ x: b.positionX, y: b.positionY }, b.radius + 2);
				
				break;
			}
		}
	}
}

function describeBodySize(b)
{
	if (b.radiusScale < 0.15)
	{
		return "tiny";
	}
	
	if (b.radiusScale < 0.25)
	{
		return "small";
	}
	
	if (b.radiusScale < 0.75)
	{
		return "medium sized";
	}
	
	if (b.radiusScale < 0.85)
	{
		return "big";
	}
	
	return "huge";
}

function describeMoons(b)
{
	if (b.childCount == 0)
	{
		return "no moons";
	}
	
	if (b.childCount == 1)
	{
		return "a moon";
	}
	
	return "a few moons";
}

function describeBody(b)
{
	let star;
	let s;
	
	s = "Oh, now I remember! Must be on ";
	
	if (b.type == BODY_TYPE_MOON)
	{
		s += "the [" + describeBodySize(b) + "] [" + b.def[3] + "] moon of ";
		
		// hack but cheap
		b = b.parent;
	}
	
	star = b.parent;
	s += "a [" + describeBodySize(b) + "] [" + b.def[3] + "] planet [with " + describeMoons(b) + "], ";
	
	s += "orbiting a [" + star.def[3] + "] sun."
	
	console.log(s);
}

function generateBodies()
{
	let i, j, a, b, c, result;
	
	result = [];
	
	result.push(generateBody(null, 13, 0, 0, BODY_TYPE_STAR));
	
	b = 20;
	
	for (i=0; i<5; i++)
	{
		a = result.push(generateBody(result[0], 5, i * 30 + 50, 0.0001, BODY_TYPE_PLANET)) - 1;
		
		c = Math.floor(randFloat() * 3);
		
		for (j=0; j<c; j++)
		{
			result.push(generateBody(result[a], 2, j * 10 + 15, 0.0005, BODY_TYPE_MOON));
		}
	}
	
	describeBody(result[2]);
	
	return result;
}

function regenerateAllBodies()
{
	let i;
	
	for (i=0; i<_map.systems.length; i++)
	{
		_map.systems[i].bodies = generateBodies();
	}
}

function solarNext()
{
}

function solarLand()
{
	_currentBody = _selectedBody;
}

function solarZoom()
{
	_cursor.clicked = false;
	_layers[0].visible = false;
	_layers[1].visible = true;
}

function drawSolar()
{
	ctx.fillRect(0, 0, WIDTH, HEIGHT);
	
	updateBodies();
	drawBodies();
	
	drawGuiStripes();
	drawGuiButton("\u00BB", 4, 1, true, solarNext);
	drawGuiButton("LAND", 5, 3, (_selectedBody != null), solarLand);
	drawGuiButton("ZOOM", 8, 3, true, solarZoom);
}
