import { useState, useEffect } from 'react'
import './App.css'
import wordsList from "./components/words.tsx"
import clsx from 'clsx'
import Confetti from 'react-confetti'

export default function App() {

  const [answer, setAnswer] = useState("")
  const [guesses, setAllGuesses] = useState(Array(6).fill(null))
  const [gameInProgress, setGameStatus] = useState(true)
  const [currentGuess, setCurrentGuess] = useState("")

  useEffect(() => {
    if (gameInProgress) {
      setAnswer(wordsList[Math.floor(Math.random() * wordsList.length)])
      setAllGuesses(Array(6).fill(null))
      setCurrentGuess("")
    }
  }, [gameInProgress])

  useEffect(() => {
    const currentGuessRow = guesses.findIndex(current => current == null);
    if (currentGuessRow === -1) {
      setGameStatus(false);
      return
    }
    if (currentGuessRow > 0 && guesses[currentGuessRow-1] === answer) {
      setGameStatus(false);
      return
    }
  }, [guesses]);
  
  useEffect(() => {
    if (!gameInProgress) { return }

    function handleChange(e: KeyboardEvent) {
      if (!e) { return }
      if (!e.key) { return }

      if (/^[a-zA-Z]$/.test(e.key)) {
        if (currentGuess.length >= 5) { return }
        setCurrentGuess(prev => prev + e.key )
        return
      }

      if (e.key === "Backspace") {
        setCurrentGuess(prev => prev.slice(0, -1) )
        return
      }

      if (currentGuess.length != 5) { return }
      
      setAllGuesses(prev => {
        const currentGuessRow = prev.findIndex(current => current == null)
        const toUse = [...prev]
        toUse[currentGuessRow] = currentGuess
        return toUse
      })
      setCurrentGuess("")


    }
    window.addEventListener("keydown", handleChange)
    return () => {
      window.removeEventListener("keydown", handleChange)
    }
  }, [currentGuess, gameInProgress])

  let currentGuessRow: number = guesses.findIndex(current => current == null)
  const currentColumnGuess: number = currentGuess.length - 1
  if (!gameInProgress && currentGuessRow === -1) {
    currentGuessRow = 6
  }
  const guessedCorrectAnswer = !gameInProgress && (currentGuessRow > 0 && guesses[currentGuessRow-1] === answer)

  const tiles = guesses.map((current, index) => <Tile key={index+1} row={index} answer={answer} currentGuessRow={currentGuessRow} currentColumnGuess={currentColumnGuess} guess={currentGuessRow === index ? currentGuess : current ? current : ""} />)

  function restartGame() {
    setGameStatus(true)
  }

  const mainClasses = clsx("flex", "flex-col", "justify-center", "items-center", "min-h-screen", "gap-2", !gameInProgress && !guessedCorrectAnswer && "animate-incorrect-pulse", !gameInProgress && guessedCorrectAnswer && "animate-correct-pulse")
  return (
    <main className={mainClasses}>
      {!gameInProgress ? <h1 className="motion-preset-fade motion-preset-shrink motion-duration-800 font-bold mb-5 uppercase motion-delay-750">{answer}</h1> : null}
      {tiles}
      {!gameInProgress ? <button onClick={restartGame} className={"mt-5 shadow-md bg-gray-500 font-bold text-xl text-white px-4 py-2 rounded-md cursor-pointer uppercase transition motion-preset-oscillate motion-preset-fade motion-duration-2000 motion-delay-1500"}>Restart</button> : null}
      {guessedCorrectAnswer ? <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false}/> : null }
    </main>
  )
}

function Tile({guess, row, currentGuessRow, currentColumnGuess, answer}: {guess: string, row: number, currentGuessRow: number, currentColumnGuess: number, answer: string}) {
  const tiles = []
  const guessedCharsUsed = []
  const guessedCharsGradually: string[] = []
  const charsInCorrectPositions = []
  for (let i = 0; i < 5; i++) {
    guessedCharsUsed.push(guess[i])
    if (guess[i] != "" && guess[i] === answer[i]) {
      charsInCorrectPositions.push(answer[i])
    }
  }
  for (let i = 0; i < 5; i++) {
    guessedCharsGradually.push(guess[i])
    const includesLetter = [...answer].includes(guess[i])
    const numberCharsCorrectPos = charsInCorrectPositions.filter(c => c === guess[i]).length
    const incorrect = (!includesLetter || guess[i] != answer[i] && numberCharsCorrectPos > 0 && guessedCharsUsed.filter(c => c === guess[i]).length > numberCharsCorrectPos) || includesLetter && numberCharsCorrectPos == 0 && guessedCharsGradually.filter(c => c === guess[i]).length > [...answer].filter(c => c === guess[i]).length
    const tileClasses = clsx("w-14", "h-14", "border-solid", "border-2", "text-xl", "font-bold", "font-mono", "uppercase", "flex", "items-center", "justify-center",
      row < currentGuessRow && guess[i] === answer[i] && "bg-correct",
      row < currentGuessRow && incorrect && "bg-incorrect",
      row < currentGuessRow && !incorrect && guess[i] != answer[i] && includesLetter && "bg-semicorrect",
      row < currentGuessRow && "border-gray-600" || row == currentGuessRow && i <= currentColumnGuess && "border-gray-600" || "border-gray-200",
      row < currentGuessRow && "text-white",
      row == currentGuessRow && i == currentColumnGuess && "motion-preset-pop motion-duration-150"
    )
    tiles.push(<div key={"row-"+row+"-col-"+(i+1)} className={tileClasses}>{guess[i]}</div>)
  }
  return <div className="flex guess-section gap-2 justify-center">{tiles}</div>
}