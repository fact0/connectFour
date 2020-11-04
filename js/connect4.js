document.addEventListener("DOMContentLoaded", function () {
	// initialize Sound class for working with bg music and sound effects:
	class Sound {
		constructor(src) {
			this.sound = document.createElement("audio");
			this.sound.src = src;
			this.sound.setAttribute("preload", "auto");
			this.sound.setAttribute("controls", "none");
			this.sound.style.display = "none";
			document.body.appendChild(this.sound);
		}
		play() {
			this.sound.play();
		}
		stop() {
			this.sound.pause();
		}
		duck() {
			this.sound.volume = 0.5;
		}
		full() {
			this.sound.volume = 1;
		}
	}

	// initialize Game class to define new game objects:
	class Game {
		constructor(width = 7, height = 6) {
			// pass in players into array:
			// set variables for board width and height to be used for various calculations:
			this.width = width;
			this.height = height;
			// active player: 1 or 2
			this.currPlayer = p1;
			this.makeBoard();
			this.makeHtmlBoard();
			// select options button class to add fade effect to button container:
			this.optionBtns = document.querySelectorAll(".option-btn img");
			// select buttons for thier various event listener actions:
			this.muteBtn = document.querySelector("#mute-button img");
			this.resetBtn = document.querySelector("#reset-button img");
			this.paintBtn = document.querySelector("#paint-button img");
			// select container for transition:
			this.container = document.querySelector(".container");
			//initialize varible for bg music:
			this.bgMusic = new Sound("sound/bg.mp3");
		}

		// makeBoard: create in-JS board structure:
		// board = array of rows, each row is array of cells (board[y][x])
		makeBoard() {
			this.board = [];
			// pushes array of empty cells based on height and width varibles:
			for (let y = 0; y < this.height; y++) {
				this.board.push(Array.from({ length: this.width }));
			}
		}

		// makeHtmlBoard: make HTML board by dynamically filling css grid with labeled divs:
		makeHtmlBoard() {
			// select css grid container:
			const board = document.querySelector(".grid-container");
			// TODO: add comment for this code
			for (let x = 0; x < this.width; x++) {
				const top = document.createElement("div");
				// add top class for selecting slot to drop piece, add event listener on click:
				top.classList.add("top");
				top.classList.add("p1");
				top.setAttribute("id", `${x}`);
				top.addEventListener("click", handleClick);
				// append first row of divs to grid container:
				board.append(top);
			}

			// create main layout of board:
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
					// create divs, label them with xy coords and append to grid container:
					const cell = document.createElement("div");
					cell.setAttribute("id", `${y}-${x}`);
					board.append(cell);
				}
			}
		}

		// findSpotForCol: given column x, return top empty y (null if filled):
		findSpotForCol(x) {
			for (let y = this.height - 1; y >= 0; y--) {
				if (!this.board[y][x]) {
					return y;
				}
			}
			return null;
		}

		// placeInTable: update DOM to place piece into grid container:
		placeInTable(y, x) {
			// create piece div:
			const piece = document.createElement("div");
			// select sound effect for when piece is dropped, checks if mute button is pressed:
			const drop = new Sound("sound/drop.wav");
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
		handleClick(evt) {
			// get x from ID of clicked cell:
			const x = +evt.target.id;

			// get next spot in column (if none, ignore click):
			const y = this.findSpotForCol(x);
			if (y === null) {
				return;
			}

			// place piece in board and add to HTML grid container:
			this.board[y][x] = this.currPlayer;
			this.placeInTable(y, x);

			// check for win:
			if (this.checkForWin()) {
				return this.endGame(`Player ${currPlayer} wins!`);
			}

			// check for tie:
			if (this.board.every((row) => row.every((cell) => cell))) {
				return this.endGame("Tie!");
			}

			// switch players:
			this.currPlayer = this.currPlayer === 1 ? 2 : 1;
			// Use click event listener and currplayer update code with function, sets correct player piece color for top and current player icon on click:
			this.changePlayerPiece();
		}

		// checkForWin: check board cell-by-cell for "does a win start here?:
		checkForWin() {
			// get array of winning pieces xy coords and applies styles to the pieces in the winning coords:
			winPiece = (cells) => {
				const winners = [];
				// checks if positions for winning pattern is found in game board array:
				cells.forEach(([y, x]) => {
					if (
						y >= 0 &&
						y < this.height &&
						x >= 0 &&
						x < this.width &&
						this.board[y][x] === this.currPlayer
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
			};

			_win = (cells) => {
				// Check four cells to see if they're all color of current player
				//  - cells: list of four (y, x) cells
				//  - returns true if all are legal coordinates & all match currPlayer
				cells.every(
					([y, x]) =>
						y >= 0 &&
						y < this.height &&
						x >= 0 &&
						x < this.width &&
						this.board[y][x] === this.currPlayer
				);
			};

			// iterates through positions in array in sections using 4 length, each array contains the coords for winning combinations of pieces but different orientations:
			for (let y = 0; y < this.height; y++) {
				for (let x = 0; x < this.width; x++) {
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

		// toggles classes ta play and stop audio:
		muteButton() {
			muteBtn.addEventListener("click", () => {
				if (muteBtn.classList.contains("pressed")) {
					muteBtn.classList.toggle("pressed");
					this.bgMusic.play();
				} else {
					muteBtn.classList.toggle("pressed");
					this.bgMusic.stop();
				}
			});
		}
		// resets pieces, empties board array and empties grid container html contents:
		resetButton() {
			resetBtn.addEventListener("mousedown", () => {
				resetBtn.classList.toggle("pressed");
				this.clearPieces();
				this.makeBoard();
				this.makeHtmlBoard();
			});
			// this is so the icon toggles on mouseup
			resetBtn.addEventListener("mouseup", () => {
				resetBtn.classList.toggle("pressed");
			});
		}

		// initializes current player icon to show correct player when starting game:
		initPlayerIcon() {
			let currPlayerIcon = document.querySelector("#current-p");
			currPlayerIcon.classList.add("piece");
			currPlayerIcon.classList.add(`p${currPlayer}`);
			currPlayerIcon.classList.add("fade-in");
		}

		//
		paintButton() {
			// select board img and player icon for toggle:
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
				this.changePlayerPiece();
			});
		}

		// function controls updating piece colors on top row for hover effect and current player icon:
		changePlayerPiece() {
			// selects game pieces to have color pallete swapped:
			let boardPiecesP2 = document.querySelectorAll(".piece.p2");
			let boardPiecesOld = document.querySelectorAll(".piece.old");
			let currPlayerIcon = document.querySelector("#current-p");
			let topPieces = document.querySelectorAll(".top");
			if (!paintBtn.classList.contains("pressed")) {
				for (piece of boardPiecesOld) {
					piece.classList.remove("old");
					piece.classList.add("p2");
				}
				if (currPlayer === 1) {
					for (piece of topPieces) {
						piece.classList.remove("old");
						piece.classList.remove("p2");
						piece.classList.add("p1");
					}
					currPlayerIcon.classList.remove("old");
					currPlayerIcon.classList.remove("p2");
					currPlayerIcon.classList.add("p1");
				} else if (currPlayer === 2) {
					for (piece of topPieces) {
						piece.classList.remove("old");
						piece.classList.remove("p1");
						piece.classList.add("p2");
					}
					currPlayerIcon.classList.remove("old");
					currPlayerIcon.classList.remove("p1");
					currPlayerIcon.classList.add("p2");
				}
				// if pressed add or remove "old" styles to p2 based on which players turn it is:
			} else if (paintBtn.classList.contains("pressed")) {
				for (piece of boardPiecesP2) {
					piece.classList.remove("p2");
					piece.classList.add("old");
				}
				if (currPlayer === 1) {
					for (piece of topPieces) {
						piece.classList.remove(".p2");
						piece.classList.remove(".old");
						piece.classList.add(".p1");
					}
					currPlayerIcon.classList.remove("p2");
					currPlayerIcon.classList.remove("old");
					currPlayerIcon.classList.add("p1");
				} else if (currPlayer === 2) {
					for (piece of topPieces) {
						piece.classList.remove("p2");
						piece.classList.remove("p1");
						piece.classList.add("old");
					}
					currPlayerIcon.classList.remove("p2");
					currPlayerIcon.classList.remove("p1");
					currPlayerIcon.classList.add("old");
				}
			}
		}

		// clears game board html, and empties array used in reset function:
		clearPieces() {
			let game = document.getElementById("game");
			this.board = [];
			game.innerHTML = "";
		}

		// end game results screen
		endGame(msg) {
			// game over sound effect:
			let win = new Sound("sound/win.wav");
			let message = document.getElementById("message");
			let end = document.getElementById("end");
			// lower volume:
			this.bgMusic.duck();
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
			this.restartGame();
		}
		// used post results screen, restarts game but keeeps music loop going:
		restartGame() {
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
				this.bgMusic.full();
			});
		}

		// start bg music and run main functions:
		startGame() {
			this.bgMusic.play();
			this.bgMusic.sound.loop = true;
			muteButton();
			paintButton();
			resetButton();
			// makes game start, transitions:
			start.classList.add("playing");
			// update player icon before fade in:
			initPlayerIcon();
			// a bunch of elements fade in:
			for (img of optionBtns) {
				img.classList.add("playing");
				img.classList.add("fade-in");
			}
			container.classList.add("fade-in");
		}
	}

	// select start button and start game on click by creating new Game from class:
	document.getElementById("start-button").addEventListener("click", () => {
		new Game().startGame();
	});
});
