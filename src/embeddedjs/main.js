import Poco from "commodetto/Poco";
import parseBMF from "commodetto/parseBMF";
import parseRLE from "commodetto/parseRLE";


const render = new Poco(screen);

// Colors
const black = render.makeColor(0, 0, 0);
const white = render.makeColor(255, 255, 255);

// setup fonts
const timeFont = getFont("Asakim_Bold", 60);

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
  9: 0b1111011,
  10: 0b0000110,
  11: 0b0110110,
  12: 0b0000110,
};

function drawHour(digit,x, y, height ,width ,corner) {
  if (digit < 10) {
  drawHourNumber(digit, x, y, height, width, 6);
  } else if (digit == 10) {
    drawHourNumber(10, x, y, height, width*0.75, 6);
    drawHourNumber(0, width / 4 + 4, y, height, width*0.75 - 4, 6);
  } else if (digit == 11) {
    drawHourNumber(11, x, y, height, width, 6);
  } else if (digit == 12) {
    drawHourNumber(10, x, y, height, width*0.75 , 6);
    drawHourNumber(2, width / 4 + 4, y, height, width*0.75 - 4, 6);
  }
}

//draw hour number
function drawHourNumber(digit, x , y, height, width, corner) {
  const bitmask = SEGMENTS[digit];
  
  // If the digit isn't 0-9, bail out
  //if (bitmask === undefined) return;
  
  //drawRoundRect(x, y, width, height, color, radius, corners);
  
  // A: Top
  if (bitmask & 0b1000000) {
     render.drawRoundRect(x, y, width, height/6, white, corner); //full width
     render.drawRoundRect(x + width - width/3 + 1, y, width/3, height/3.5, white, corner); //right edge
     render.drawRoundRect(x, y, width/3, y + height/3.5, white, corner); //left edge
  }; 
  
  // B: Top Right
  if (bitmask & 0b0100000)  render.drawRoundRect(x + width - width/3 + 1, y, width/3, height/2, white, corner, 0b0011);   //topright
  
  // C: Bottom Right
  if (bitmask & 0b0010000) render.drawRoundRect(x + width - width/3 + 1, y + height/2, width/3, height/2, white, corner, 0b1100);   //bottomright
  
  // D: Bottom
  if (bitmask & 0b0001000) {
    render.drawRoundRect(x, height - height/6 , y + width, height/6, white, corner); //full width
    render.drawRoundRect(x + width - width/3 + 1, y + height-height/3.5, width/3, height/3.5, white, corner); //right edge  
    render.drawRoundRect(x, height - height/3.5, y + width/3, height/3.5, white, corner); //left edge
  }
  
  // E: Bottom Left
  if (bitmask & 0b0000100) render.drawRoundRect(x, y + height/2, width/3, height/2, white, corner, 0b1100);     //bottomleft
  
  // F: Top Left
  if (bitmask & 0b0000010) render.drawRoundRect(x, y, width/3, height/2 , white, corner, 0b0011);     //topleft
  
  // G: Middle
  if (bitmask & 0b0000001) render.drawRoundRect(x, y + (height-height/7)/2, width, height/7, white, corner);   //middle
}

// Load a custom font from BMF resources
function getFont(name, size) {
    const font = parseBMF(new Resource(`${name}-${size}.fnt`));
    font.bitmap = parseRLE(new Resource(`${name}-${size}-alpha.bm4`));
    return font;
}


//main "loop"
function draw(event) {
  
  
    //get time and date
    const now = event.date;
  
    // get hours int
    const hours = now.getHours();
  
    //I dont like 24 h at the moment so fix that!
    const hours12Int = hours % 12 || 12;
  
    // get minutes string 2 Sig figs
    const minutes = String(now.getMinutes()).padStart(2, "0");
  
  
    // LAYOUT
  
    // Precompute layout positions
    const timeY = render.height / 6.5;
  
    // calculate minute centring
    let width = render.getTextWidth(minutes, timeFont);
    
    // offset for minutes when hour 10 or 12
    let minuteoffset = 0;
    if ( hours12Int === 10 || hours12Int === 12 ){
      minuteoffset = render.width/8;
    }
  
  
    //start drawing
    render.begin();

    //fill background
    render.fillRectangle(black, 0, 0, render.width, render.height);
  
    //draw bold hours
    drawHour(hours12Int, 0, 0, render.height, render.width, 6);
    
    //draw minutes
    render.drawText(minutes, timeFont, white, (render.width - width) / 2 + minuteoffset, timeY);
  
    //end drawing
    render.end();
}

// Update every minute (fires immediately when registered)
watch.addEventListener("minutechange", draw);
