// ============================================================
// Week 5 Example 1 — Sprite Sheet Animation
// ============================================================

// ------------------------------------------------------------
// SPRITE CONFIGURATION
// Adjust these values to match your sprite sheet.
//
// frameWidth  — width of one frame in pixels
// frameHeight — height of one frame in pixels
// numFrames   — number of frames per row
// animSpeed   — how many draw() frames per sprite frame
//               lower = faster animation, higher = slower
// scale       — how much to scale the sprite when drawing
//               1 = original size, 2 = double, 3 = triple
// ------------------------------------------------------------
const SPRITE = {
  frameWidth: 100, // width of one frame  (300px / 4 frames)
  frameHeight: 100, // height of one frame (600px / 4 rows)
  numFrames: 5, // frames per row
  animSpeed: 20, // draw() frames per sprite frame (higher = slower)
  scale: 0.5, // draw at half original size

  // Row index for each direction
  // Change these if your sheet has a different row order
  rows: {
    down: 0,
    up: 1,
    right: 2,
    left: 3,
  },

  // Fine-tune the source position for each direction
  // Adjust x to shift left/right, y to shift up/down
  // Positive y moves the source window down into the sheet
  // Try values like 5, 10, 15 to line up your frames
  offsets: {
    down: { x: 0, y: 0 },
    up: { x: 0, y: 0 },
    right: { x: 0, y: 10 },
    left: { x: 0, y: 20 },
  },
};

// ------------------------------------------------------------
// PLAYER
// x, y track the centre position on the canvas.
// Animation state is stored alongside position so everything
// about the player is in one place.
// ------------------------------------------------------------
let player = {
  x: 400, // centre x position on canvas
  y: 225, // centre y position on canvas
  speed: 3, // pixels moved per frame

  // Animation state
  currentFrame: 0, // which frame in the row (0 to numFrames-1)
  frameTimer: 0, // counts up to animSpeed then advances frame
  direction: "down", // current facing direction
  isMoving: false, // only animate when moving
};

let mario; // the loaded sprite sheet image

// ============================================================
// preload()
// Runs once before setup(). Always load images here so they
// are ready before the sketch tries to use them.
// ============================================================
function preload() {
  // loadImage() loads the sprite sheet before setup() runs
  mario = loadImage("assets/images/mario.png");
}

// ============================================================
// setup()
// Runs once at the very start of the sketch.
// imageMode(CENTER) makes image() draw from the centre point
// rather than the top-left corner.
// ============================================================
function setup() {
  createCanvas(800, 450);
  imageMode(CENTER);
}

// ============================================================
// draw()
// Runs repeatedly in a loop after setup() finishes.
// Each frame: handle input, advance animation, draw everything.
// ============================================================
function draw() {
  background(30);

  handleInput();
  animateSprite();
  drawCharacter();
  drawHUD();
}

// ------------------------------------------------------------
// handleInput()
// Moves the player and sets the correct facing direction.
// Each direction is checked independently so diagonal
// movement works naturally — holding W and D moves up-right.
// The last key held wins for direction (D overrides W if both
// are held and D is checked last).
// ------------------------------------------------------------
function handleInput() {
  player.isMoving = false;

  if (keyIsDown(87)) {
    // W — up
    player.y -= player.speed;
    player.direction = "up";
    player.isMoving = true;
  }
  if (keyIsDown(83)) {
    // S — down
    player.y += player.speed;
    player.direction = "down";
    player.isMoving = true;
  }
  if (keyIsDown(65)) {
    // A — left
    player.x -= player.speed;
    player.direction = "left";
    player.isMoving = true;
  }
  if (keyIsDown(68)) {
    // D — right
    player.x += player.speed;
    player.direction = "right";
    player.isMoving = true;
  }

  // Keep player inside the canvas
  // hw and hh are the half-dimensions of the drawn sprite
  let hw = (SPRITE.frameWidth * SPRITE.scale) / 2;
  let hh = (SPRITE.frameHeight * SPRITE.scale) / 2;
  player.x = constrain(player.x, hw, width - hw);
  player.y = constrain(player.y, hh, height - hh);
}

// ------------------------------------------------------------
// animateSprite()
// Advances the animation frame at a controlled speed.
// frameTimer counts up every draw() call.
// When it reaches animSpeed, we move to the next frame.
// Only animates when the player is moving — stays on frame 0
// when idle so the character stands still.
// ------------------------------------------------------------
function animateSprite() {
  if (player.isMoving) {
    player.frameTimer++;

    // When the timer reaches animSpeed, advance to the next frame
    // % numFrames wraps back to 0 after the last frame
    if (player.frameTimer >= SPRITE.animSpeed) {
      player.frameTimer = 0;
      player.currentFrame = (player.currentFrame + 1) % SPRITE.numFrames;
    }
  } else {
    // Reset to standing frame when not moving
    player.currentFrame = 0;
    player.frameTimer = 0;
  }
}

// ------------------------------------------------------------
// drawCharacter()
// Draws one frame from the sprite sheet using image() with
// source rectangle parameters.
//
// image(img, dx, dy, dw, dh, sx, sy, sw, sh)
//   dx, dy — where to draw on the canvas (destination centre)
//   dw, dh — how large to draw it (destination size)
//   sx, sy — where to start reading from the sprite sheet
//   sw, sh — how many pixels to read from the sheet
//
// sx slides along the row by multiplying frame number by
// frameWidth — each frame is one frameWidth apart.
// sy selects the row by multiplying row index by frameHeight.
// ------------------------------------------------------------
function drawCharacter() {
  // Get the correct row and offset for the current direction
  let row = SPRITE.rows[player.direction];
  let offset = SPRITE.offsets[player.direction];

  // Source position on the sprite sheet (with offset applied)
  let sx = player.currentFrame * SPRITE.frameWidth + offset.x;
  let sy = row * SPRITE.frameHeight + offset.y;

  // Draw size (original frame size multiplied by scale)
  let dw = SPRITE.frameWidth * SPRITE.scale;
  let dh = SPRITE.frameHeight * SPRITE.scale;

  image(
    mario,
    player.x,
    player.y, // destination centre position
    dw,
    dh, // destination size (scaled)
    sx,
    sy, // source position on sprite sheet
    SPRITE.frameWidth, // source width  (one frame)
    SPRITE.frameHeight, // source height (one row)
  );
}

// ------------------------------------------------------------
// drawHUD()
// HUD = Heads Up Display.
// Shows controls and current animation info for reference.
// The frame/row readout is useful when tuning a new sprite sheet.
// ------------------------------------------------------------
function drawHUD() {
  noStroke();
  fill(160);
  textSize(13);
  textAlign(LEFT);
  textFont("monospace");
  text("Move: WASD", 16, 24);

  // Debug info — useful when aligning frames on a new sheet
  fill(100);
  textSize(11);
  text("Direction: " + player.direction, 16, 44);
  text(
    "Frame: " + player.currentFrame + " / " + (SPRITE.numFrames - 1),
    16,
    58,
  );
  text("Row: " + SPRITE.rows[player.direction], 16, 72);
}
