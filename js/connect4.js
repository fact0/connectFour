document.addEventListener("DOMContentLoaded", function () {
	/** Connect Four
	 *
	 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
	 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
	 * board fills (tie)
	 */

	const WIDTH = 7;
	const HEIGHT = 6;

	let currPlayer = 1; // active player: 1 or 2
	let board = [];
	let bgMusic = new sound("sound/bg.mp3");
	let optionBtns = document.querySelectorAll(".option-btn img");
	let muteBtn = document.querySelector("#mute-button img");
	let resetBtn = document.querySelector("#reset-button img");
	let paintBtn = document.querySelector("#paint-button img");

	let startBtn = document.getElementById("start-button");
	startBtn.addEventListener("click", startGame);

	/** makeBoard: create in-JS board structure:
	 *    board = array of rows, each row is array of cells  (board[y][x])
	 */

	function makeBoard() {
		// TODO: set "board" to empty HEIGHT x WIDTH matrix array
		for (let y = 0; y < HEIGHT; y++) {
			board.push(Array.from({ length: WIDTH }));
		}
	}

	/** makeHtmlBoard: make HTML table and row of column tops. */

	function makeHtmlBoard() {
		// TODO: get "htmlBoard" variable from the item in HTML w/ID of "board"
		const board = document.querySelector(".grid-container");
		// TODO: add comment for this code
		for (let x = 0; x < WIDTH; x++) {
			const top = document.createElement("div");
			top.classList.add("top");
			top.setAttribute("id", `${x}`);
			top.addEventListener("click", handleClick);
			board.append(top);
		}

		// create main layout of board:
		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++) {
				const cell = document.createElement("div");
				cell.setAttribute("id", `${y}-${x}`);
				board.append(cell);
			}
		}
	}

	/** findSpotForCol: given column x, return top empty y (null if filled) */

	function findSpotForCol(x) {
		for (let y = HEIGHT - 1; y >= 0; y--) {
			if (!board[y][x]) {
				return y;
			}
		}
		return null;
	}

	/** placeInTable: update DOM to place piece into HTML table of board */

	function placeInTable(y, x) {
		const piece = document.createElement("div");
		let drop = new sound("sound/drop.wav");
		if (!muteBtn.classList.contains("pressed")) {
			drop.play();
		}
		piece.classList.add("piece");
		if (!paintBtn.classList.contains("pressed")) {
			piece.classList.add(`p${currPlayer}`);
		} else if (paintBtn.classList.contains("pressed")) {
			if (currPlayer === 1) {
				piece.classList.add(`p${currPlayer}`);
			} else if (currPlayer === 2) {
				piece.classList.add(`old`);
			}
		}
		piece.classList.add(`p${currPlayer}`);
		piece.classList.add("p-drop");
		piece.style.top = -50 * (y + 2);

		const spot = document.getElementById(`${y}-${x}`);
		spot.append(piece);
	}

	/** handleClick: handle click of column top to play piece */

	function handleClick(evt) {
		// get x from ID of clicked cell
		const x = +evt.target.id;

		// get next spot in column (if none, ignore click)
		const y = findSpotForCol(x);
		if (y === null) {
			return;
		}

		// place piece in board and add to HTML table
		board[y][x] = currPlayer;
		placeInTable(y, x);

		// check for win
		if (checkForWin()) {
			return endGame(`Player ${currPlayer} wins!`);
		}

		// check for tie
		if (board.every((row) => row.every((cell) => cell))) {
			return endGame("Tie!");
		}

		// switch players
		currPlayer = currPlayer === 1 ? 2 : 1;
		currentPlayerClick();
	}

	/** checkForWin: check board cell-by-cell for "does a win start here?" */

	function checkForWin() {
		function winPiece(cells) {
			const winners = [];
			cells.forEach(([y, x]) => {
				if (
					y >= 0 &&
					y < HEIGHT &&
					x >= 0 &&
					x < WIDTH &&
					board[y][x] === currPlayer
				) {
					winners.push([y, x]);
				}
			});
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

		// TODO: read and understand this code. Add comments to help you.

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

	function resetButton() {
		resetBtn.addEventListener("mousedown", () => {
			resetBtn.classList.toggle("pressed");
			clearPieces();
			makeBoard();
			makeHtmlBoard();
		});
		resetBtn.addEventListener("mouseup", () => {
			resetBtn.classList.toggle("pressed");
		});
	}

	function currentPlayerIcon() {
		let currPlayerIcon = document.querySelector("#current-p");
		currPlayerIcon.classList.add("piece");
		currPlayerIcon.classList.add(`p${currPlayer}`);
		currPlayerIcon.classList.add("fade-in");
	}
	function currentPlayerClick() {
		let currPlayerIcon = document.querySelector("#current-p");
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
	}

	function paintButton() {
		let currPlayerIcon = document.querySelector("#current-p");
		let boardImg = document.querySelector("#front img");
		paintBtn.addEventListener("click", () => {
			if (paintBtn.classList.contains("pressed")) {
				paintBtn.classList.toggle("pressed");
				boardImg.setAttribute("src", "img/boardSmallest.png");
			} else {
				paintBtn.classList.toggle("pressed");
				boardImg.setAttribute("src", "img/boardSmallestOld.png");
			}
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
			clearPieces();
			makeBoard();
			makeHtmlBoard();
		});
	}

	function startGame() {
		let container = document.querySelector(".container");
		bgMusic.play();
		bgMusic.sound.loop = true;
		makeBoard();
		makeHtmlBoard();
		muteButton();
		paintButton();
		resetButton();
		start.classList.add("playing");
		for (img of optionBtns) {
			img.classList.add("playing");
			img.classList.add("fade-in");
		}
		currentPlayerIcon();
		container.classList.add("fade-in");
	}

	function clearPieces() {
		let game = document.getElementById("game");
		board = [];
		game.innerHTML = "";
	}

	function restartGame() {
		let btn = document.getElementById("restart-button");
		let end = document.getElementById("end");
		btn.addEventListener("click", () => {
			clearPieces();
			end.classList.remove("game-over");
			end.classList.remove("fade-in-fast");
			makeBoard();
			makeHtmlBoard();
			bgMusic.full();
		});
	}
	function endGame(msg) {
		let win = new sound("sound/win.wav");
		let message = document.getElementById("message");
		let end = document.getElementById("end");
		bgMusic.duck();
		if (!muteBtn.classList.contains("pressed")) {
			win.play();
		}
		message.innerText = `${msg}`;
		end.classList.add("game-over");
		end.classList.add("fade-in-fast");
		restartGame();
	}
});
