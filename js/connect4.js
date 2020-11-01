document.addEventListener("DOMContentLoaded", function () {
	// set variables for board width and height to be used for various calculations:
	const WIDTH = 7;
	const HEIGHT = 6;
	// active player: 1 or 2
	let currPlayer = 1;
	let board = [];
	//initialize varible for bg music:
	let bgMusic = new sound("sound/bg.mp3");
	// select options button class to add fade effect to button container:
	let optionBtns = document.querySelectorAll(".option-btn img");
	// select buttons for thier various event listener actions:
	let muteBtn = document.querySelector("#mute-button img");
	let resetBtn = document.querySelector("#reset-button img");
	let paintBtn = document.querySelector("#paint-button img");
	// select start button and start game on click:
	let startBtn = document.getElementById("start-button");
	startBtn.addEventListener("click", startGame);

	// makeBoard: create in-JS board structure:
	// board = array of rows, each row is array of cells (board[y][x])
	function makeBoard() {
		// pushes array of empty cells based on height and width varibles:
		for (let y = 0; y < HEIGHT; y++) {
			board.push(Array.from({ length: WIDTH }));
		}
	}

	// makeHtmlBoard: make HTML board by dynamically filling css grid with labeled divs:
	function makeHtmlBoard() {
		// select css grid container:
		const board = document.querySelector(".grid-container");
		// TODO: add comment for this code
		for (let x = 0; x < WIDTH; x++) {
			const top = document.createElement("div");
			// add top class for selecting slot to drop piece, add event listener on click:
			top.classList.add("top");
			top.setAttribute("id", `${x}`);
			top.addEventListener("click", handleClick);
			// append first row of divs to grid container:
			board.append(top);
		}

		// create main layout of board:
		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++) {
				// create divs, label them with xy coords and append to grid container:
				const cell = document.createElement("div");
				cell.setAttribute("id", `${y}-${x}`);
				board.append(cell);
			}
		}
	}

	// findSpotForCol: given column x, return top empty y (null if filled):
	function findSpotForCol(x) {
		for (let y = HEIGHT - 1; y >= 0; y--) {
			if (!board[y][x]) {
				return y;
			}
		}
		return null;
	}

	// placeInTable: update DOM to place piece into grid container:
	function placeInTable(y, x) {
		// create piece div:
		const piece = document.createElement("div");
		// select sound effect for when piece is dropped, checks if mute button is pressed:
		let drop = new sound("sound/drop.wav");
		if (!muteBtn.classList.contains("pressed")) {
			drop.play();
		}
		// adds styles to div to make it looks like a game piece:
		piece.classList.add("piece");
		// checks if styles to be applied to new piece are from the correct color pallete, this is if the paint button is pressed:
		if (!paintBtn.classList.contains("pressed")) {
			piece.classList.add(`p${currPlayer}`);
			// if button is pressed, apply "old" styles to player 2:
		} else if (paintBtn.classList.contains("pressed")) {
			if (currPlayer === 1) {
				piece.classList.add(`p${currPlayer}`);
			} else if (currPlayer === 2) {
				piece.classList.add(`old`);
			}
		}
		// add drop animation class:
		piece.classList.add("p-drop");
		// gets spot in board to place piece from passed in xy coords:
		const spot = document.getElementById(`${y}-${x}`);
		spot.append(piece);
	}

	// handleClick: handle click of column top to play piece:
	function handleClick(evt) {
		// get x from ID of clicked cell:
		const x = +evt.target.id;

		// get next spot in column (if none, ignore click):
		const y = findSpotForCol(x);
		if (y === null) {
			return;
		}

		// place piece in board and add to HTML grid container:
		board[y][x] = currPlayer;
		placeInTable(y, x);

		// check for win:
		if (checkForWin()) {
			return endGame(`Player ${currPlayer} wins!`);
		}

		// check for tie:
		if (board.every((row) => row.every((cell) => cell))) {
			return endGame("Tie!");
		}

		// switch players:
		currPlayer = currPlayer === 1 ? 2 : 1;
		// Use click event listener and currplayer update code with function currectplayerclick:
		currentPlayerClick();
	}

	// checkForWin: check board cell-by-cell for "does a win start here?:
	function checkForWin() {
		// get array of winning pieces xy coords and applies styles to the pieces in the winning coords:
		function winPiece(cells) {
			const winners = [];
			// checks if positions for winning pattern is found in game board array:
			cells.forEach(([y, x]) => {
				if (
					y >= 0 &&
					y < HEIGHT &&
					x >= 0 &&
					x < WIDTH &&
					board[y][x] === currPlayer
				) {
					// pushes coords of winning pieces to array:
					winners.push([y, x]);
				}
			});
			// iterates through array and gets the winning coords of spot then applies styles to the coorisponding piece in that spot:
			for (i = 0; i < winners.length; i++) {
				let y = winners[i][0];
				let x = winners[i][1];
				document.getElementById(`${y}-${x}`).childNodes[0].classList.add("shiny");
			}
		}

		function _win(cells) {
			// Check four cells to see if they're all color of current player
			//  - cells: list of four (y, x) cells
			//  - returns true if all are legal coordinates & all match currPlayer
			return cells.every(
				([y, x]) =>
					y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH && board[y][x] === currPlayer
			);
		}

		// iterates through positions in array in sections using 4 length, each array contains the coords for winning combinations of pieces but different orientations:
		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++) {
				const horiz = [
					[y, x],
					[y, x + 1],
					[y, x + 2],
					[y, x + 3],
				];
				const vert = [
					[y, x],
					[y + 1, x],
					[y + 2, x],
					[y + 3, x],
				];
				const diagDR = [
					[y, x],
					[y + 1, x + 1],
					[y + 2, x + 2],
					[y + 3, x + 3],
				];
				const diagDL = [
					[y, x],
					[y + 1, x - 1],
					[y + 2, x - 2],
					[y + 3, x - 3],
				];
				// if coords in game board array meet requirments of same player color and correct orientation, pass the orientation and coords to winpiece and return true to _win:
				if (_win(horiz)) {
					winPiece(horiz);
					return true;
				} else if (_win(vert)) {
					winPiece(vert);
					return true;
				} else if (_win(diagDR)) {
					winPiece(diagDR);
					return true;
				} else if (_win(diagDL)) {
					winPiece(diagDL);
					return true;
				}
			}
		}
	}

	// global sound function to start, pause, change volume of sound effects and bg music:
	function sound(src) {
		this.sound = document.createElement("audio");
		this.sound.src = src;
		this.sound.setAttribute("preload", "auto");
		this.sound.setAttribute("controls", "none");
		this.sound.style.display = "none";
		document.body.appendChild(this.sound);
		this.play = function () {
			this.sound.play();
		};
		this.stop = function () {
			this.sound.pause();
		};
		this.duck = function () {
			this.sound.volume = 0.5;
		};
		this.full = function () {
			this.sound.volume = 1;
		};
	}
	// toggles classes ta play and stop audio:
	function muteButton() {
		muteBtn.addEventListener("click", () => {
			if (muteBtn.classList.contains("pressed")) {
				muteBtn.classList.toggle("pressed");
				bgMusic.play();
			} else {
				muteBtn.classList.toggle("pressed");
				bgMusic.stop();
			}
		});
	}
	// resets pieces, empties board array and empties grid container html contents:
	function resetButton() {
		resetBtn.addEventListener("mousedown", () => {
			resetBtn.classList.toggle("pressed");
			clearPieces();
			makeBoard();
			makeHtmlBoard();
		});
		// this is so the icon toggles on mouseup
		resetBtn.addEventListener("mouseup", () => {
			resetBtn.classList.toggle("pressed");
		});
	}

	// initializes current player icon to show correct player when starting game:
	function currentPlayerIcon() {
		let currPlayerIcon = document.querySelector("#current-p");
		currPlayerIcon.classList.add("piece");
		currPlayerIcon.classList.add(`p${currPlayer}`);
		currPlayerIcon.classList.add("fade-in");
	}

	// function is called on top click, changes play icon passed on what color pallete is selected with paint button:
	function currentPlayerClick() {
		let currPlayerIcon = document.querySelector("#current-p");
		// if not pressed add or remove standard colors based on which players turn it is:
		if (!paintBtn.classList.contains("pressed")) {
			if (currPlayer === 1) {
				currPlayerIcon.classList.remove("old");
				currPlayerIcon.classList.remove("p2");
				currPlayerIcon.classList.add("p1");
			} else if (currPlayer === 2) {
				currPlayerIcon.classList.remove("old");
				currPlayerIcon.classList.remove("p1");
				currPlayerIcon.classList.add("p2");
			}
			// if pressed add or remove "old" styles to p2 based on which players turn it is:
		} else if (paintBtn.classList.contains("pressed")) {
			if (currPlayer === 1) {
				currPlayerIcon.classList.remove("p2");
				currPlayerIcon.classList.remove("old");
				currPlayerIcon.classList.add("p1");
			} else if (currPlayer === 2) {
				currPlayerIcon.classList.remove("p2");
				currPlayerIcon.classList.remove("p1");
				currPlayerIcon.classList.add("old");
			}
		}
	}

	//
	function paintButton() {
		// select board img and player icon for toggle:
		let currPlayerIcon = document.querySelector("#current-p");
		let boardImg = document.querySelector("#front img");
		// on click change board color pallete:
		paintBtn.addEventListener("click", () => {
			if (paintBtn.classList.contains("pressed")) {
				paintBtn.classList.toggle("pressed");
				boardImg.setAttribute("src", "img/boardSmallest.png");
			} else {
				paintBtn.classList.toggle("pressed");
				boardImg.setAttribute("src", "img/boardSmallestOld.png");
			}
			// update current player icon accordingly:
			if (!paintBtn.classList.contains("pressed")) {
				if (currPlayer === 1) {
					currPlayerIcon.classList.remove("old");
					currPlayerIcon.classList.remove("p2");
					currPlayerIcon.classList.add("p1");
				} else if (currPlayer === 2) {
					currPlayerIcon.classList.remove("old");
					currPlayerIcon.classList.remove("p1");
					currPlayerIcon.classList.add("p2");
				}
			} else if (paintBtn.classList.contains("pressed")) {
				if (currPlayer === 1) {
					currPlayerIcon.classList.remove("p2");
					currPlayerIcon.classList.remove("old");
					currPlayerIcon.classList.add("p1");
				} else if (currPlayer === 2) {
					currPlayerIcon.classList.remove("p2");
					currPlayerIcon.classList.remove("p1");
					currPlayerIcon.classList.add("old");
				}
			}
			// same as reset, prevents bug of having multiple different color palletes on board at once:
			clearPieces();
			makeBoard();
			makeHtmlBoard();
		});
	}
	// start bg music and run main functions:
	function startGame() {
		let container = document.querySelector(".container");
		bgMusic.play();
		bgMusic.sound.loop = true;
		makeBoard();
		makeHtmlBoard();
		muteButton();
		paintButton();
		resetButton();
		// makes game start, transitions:
		start.classList.add("playing");
		// update player icon before fade in:
		currentPlayerIcon();
		// a bunch of elements fade in:
		for (img of optionBtns) {
			img.classList.add("playing");
			img.classList.add("fade-in");
		}
		container.classList.add("fade-in");
	}
	// clears game board html, and empties array used in reset function:
	function clearPieces() {
		let game = document.getElementById("game");
		board = [];
		game.innerHTML = "";
	}

	// end game results screen
	function endGame(msg) {
		// game over sound effect:
		let win = new sound("sound/win.wav");
		let message = document.getElementById("message");
		let end = document.getElementById("end");
		// lower volume:
		bgMusic.duck();
		// dont play if muted
		if (!muteBtn.classList.contains("pressed")) {
			win.play();
		}
		// display winner text:
		message.innerText = `${msg}`;
		// brings up game over screen and fades in:
		end.classList.add("game-over");
		end.classList.add("fade-in-fast");
		// runs restart game to get event listener on play again button:
		restartGame();
	}
	// used post results screen, restarts game but keeeps music loop going:
	function restartGame() {
		let btn = document.getElementById("restart-button");
		let end = document.getElementById("end");
		btn.addEventListener("click", () => {
			// resets everything and fades out:
			clearPieces();
			end.classList.remove("game-over");
			end.classList.remove("fade-in-fast");
			makeBoard();
			makeHtmlBoard();
			// return volume:
			bgMusic.full();
		});
	}
});
