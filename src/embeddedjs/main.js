import Poco from "commodetto/Poco";
import parseBMF from "commodetto/parseBMF";
import parseRLE from "commodetto/parseRLE";

const render = new Poco(screen);

//define bitmap for "7 segment display"
const SEGMENTS = {
  0: 0b1111110,
  1: 0b0110000,
  2: 0b1101101,
  3: 0b1111001,
  4: 0b0110011,
  5: 0b1011011,
  6: 0b1011111,
  7: 0b1110000,
  8: 0b1111111,
  9: 0b1111011
};

//draw hour number
function drawHourNumber(digit, height, width, corner) {
  const bitmask = SEGMENTS[digit];
  
  // If the digit isn't 0-9, bail out
  if (bitmask === undefined) return;
  
  //drawRoundRect(x, y, width, height, color, radius, corners);
  
  // A: Top
  if (bitmask & 0b1000000) {
     render.drawRoundRect(0, 0, width, height/6, white, corner); //full width
     render.drawRoundRect(width - width/3 + 1, 0, width/3, height/3.5, white, corner); //right edge
     render.drawRoundRect(0, 0, width/3, height/3.5, white, corner); //left edge
  }; 
  
  // B: Top Right
  if (bitmask & 0b0100000)  render.drawRoundRect(width - width/3 + 1, 0, width/3, height/1.8, white, corner);   //topright
  
  // C: Bottom Right
  if (bitmask & 0b0010000) render.drawRoundRect(width - width/3 + 1, height/2.2, width/3, height/2, white, corner);   //bottomright
  
  // D: Bottom
  if (bitmask & 0b0001000) {
    render.drawRoundRect(0, height - height/6 , width, height/6, white, corner); //full width
    render.drawRoundRect(width - width/3 + 1, height-height/3.5, width/3, height/3.5, white, corner); //right edge  
    render.drawRoundRect(0, height - height/3.5, width/3, height/3.5, white, corner); //left edge
  }
  
  // E: Bottom Left
  if (bitmask & 0b0000100) render.drawRoundRect(0, height/2.2, width/3, height/2, white, corner);     //bottomleft
  
  // F: Top Left
  if (bitmask & 0b0000010) render.drawRoundRect(0, 0, width/3, height/1.8, white, corner);     //topleft
  
  // G: Middle
  if (bitmask & 0b0000001) render.drawRoundRect(0, (height-height/7)/2, width, height/7, white, corner);   //middle

}

// Load a custom font from BMF resources
function getFont(name, size) {
    const font = parseBMF(new Resource(`${name}-${size}.fnt`));
    font.bitmap = parseRLE(new Resource(`${name}-${size}-alpha.bm4`));
    return font;
}

// Use the same Jersey font as the C tutorial — a distinctive display font
const timeFont = getFont("Asakim_Bold", 60);

// Colors
const black = render.makeColor(0, 0, 0);
const white = render.makeColor(255, 255, 255);
const red = render.makeColor(255, 0, 0);

// Precompute layout positions
const timeY = render.height / 6.5;

function draw(event) {
  
    const now = event.date;2
    
    render.begin();
    
    //fill background
    render.fillRectangle(black, 0, 0, render.width, render.height);
  
    // Format time as HH:MM
    const hours = String(now.getHours());
    const minutes = String(now.getMinutes()).padStart(2, "0");

    // Draw time centered
    let width = render.getTextWidth(minutes, timeFont);

    //draw bold hours
    drawHourNumber(2, render.height, render.width, 14);
  
    //draw minutes
    render.drawText(minutes, timeFont, red, (render.width - width) / 2, timeY);
  
    render.end();
}

// Update every minute (fires immediately when registered)
watch.addEventListener("minutechange", draw);