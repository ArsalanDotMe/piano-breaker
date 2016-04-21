'use strict';

const cp = require('child_process');
const path = require('path');
const _ = require('lodash');
var imageinfo = require('imageinfo'),
    fs = require('fs');

const binary_path = '/Users/arsalanahmad/Code/pianotiles/pianotiles/target/release/pianotiles';
const GetWindowIdPath = '/Users/arsalanahmad/Code/GetWindowID/GetWindowID';

function* getNextId() {
  let uniqueId = 0;
  while (true) {
    if (uniqueId > 30) {
      uniqueId = 0;
    }
    yield uniqueId++;
  }
}

const idMaker = getNextId();

const bluestacksWindowId = cp.execSync(`${GetWindowIdPath} "BlueStacks" "BlueStacks App Player"`).toString().trim();

cp.execSync(`adb shell "screencap -p /sdcard/screen.png"; adb pull /sdcard/screen.png reference.png`);
cp.execSync(`convert -rotate "> -90" reference.png reference.png`);

const refData = fs.readFileSync('reference.png');
const refInfo = imageinfo(refData);
console.log("  Dimensions:", refInfo.width, "x", refInfo.height);

const capturedInfo = {
  width: 404,
  height: 719,
  offset: {
    x: 438,
    y: 44
  }
};

const coordsMultiplier = {
  x: refInfo.width / capturedInfo.width,
  y: refInfo.height / capturedInfo.height,
};

console.log('multipliers', coordsMultiplier);

while (true) {
  const currentId = idMaker.next().value;
  // console.log(`adb shell "screencap -p /sdcard/screen.png"; adb pull /sdcard/screen.png screen-${currentId}.png`);
  // cp.execSync(`adb shell "screencap -p /sdcard/screen.png"; adb pull /sdcard/screen.png screen-${currentId}.png`);
  // cp.execSync(`convert -rotate "> -90" screen-${currentId}.png screen-${currentId}.png`)
  cp.execSync(`screencapture -l${bluestacksWindowId} -o screen-${currentId}.png`);
  cp.execSync(`convert -crop ${capturedInfo.width}x${capturedInfo.height}+${capturedInfo.offset.x}+${capturedInfo.offset.y} screen-${currentId}.png screen-${currentId}.png`);
  const imgPath = path.join(process.cwd(), `screen-${currentId}.png`);
  const output = cp.execSync(`${binary_path} "${imgPath}"`).toString();
  
  const lines = output.split('\n');
  if (lines.length === 0) {
    process.exit();
  }

  const coords = _(lines).map(line => {
    // console.log(line);
    const coords = line.split(',');
    if (coords[1])
      return { x: Math.round(Number(coords[0]) * coordsMultiplier.x), y: Math.round(Number(coords[1]) * coordsMultiplier.y) };
  }).filter().sortBy(c => -c.y).value();
  if (coords.length > 0) {
    const commands = _(coords).take(2).value().map(c => `input tap ${c.x} ${c.y + 1}; `).join('');
    console.log(`screen-${currentId}.png :: adb shell "${commands}"`);
    cp.execSync(`adb shell "${commands}"`);
  }
}
