"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, Camera, MessageSquare, User, ArrowLeft, Play, Pause, RotateCcw } from "lucide-react"

const games = {
  "1": {
    title: "Word Guessing AI",
    description: "AI-powered word association game to improve cognitive function",
    icon: MessageSquare,
    color: "bg-blue-500",
    difficulty: "Medium"
  },
  "2": {
    title: "Facial Recognition Memory",
    description: "TensorFlow-powered facial recognition for cognitive motor tasks",
    icon: Camera,
    color: "bg-green-500",
    difficulty: "Hard"
  },
  "3": {
    title: "Character Story Builder",
    description: "Create and customize character stories for memory enhancement",
    icon: User,
    color: "bg-purple-500",
    difficulty: "Easy"
  }
}

function WordGuessingGame() {
  const [currentWord, setCurrentWord] = useState("")
  const [userGuess, setUserGuess] = useState("")
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [feedback, setFeedback] = useState("")

  const words = ["apple", "ocean", "mountain", "butterfly", "rainbow", "garden", "music", "friendship"]
  const hints = {
    "apple": "A red or green fruit that keeps the doctor away",
    "ocean": "A vast body of saltwater covering most of Earth",
    "mountain": "A large natural elevation of the earth's surface",
    "butterfly": "A colorful insect that transforms from a caterpillar",
    "rainbow": "A colorful arc in the sky after rain",
    "garden": "A place where flowers and vegetables grow",
    "music": "Sounds arranged in time to produce beauty",
    "friendship": "A close relationship between people who care about each other"
  }

  const startGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)]
    setCurrentWord(randomWord)
    setGameStarted(true)
    setUserGuess("")
    setFeedback("")
  }

  const checkGuess = () => {
    if (userGuess.toLowerCase() === currentWord.toLowerCase()) {
      setScore(score + 1)
      setFeedback("Correct! Great job!")
      setTimeout(startGame, 2000)
    } else {
      setFeedback(`Try again! Hint: ${hints[currentWord]}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Word Guessing AI Game</h2>
        <div className="bg-card p-6 rounded-lg border">
          <div className="mb-4">
            <Badge variant="secondary" className="mb-2">Score: {score}</Badge>
          </div>
          
          {!gameStarted ? (
            <Button onClick={startGame} className="bg-blue-500 hover:bg-blue-600">
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
          ) : (
            <div className="space-y-4">
              <p className="text-lg">Hint: {hints[currentWord]}</p>
              <input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                className="w-full p-3 border rounded-md"
                placeholder="Enter your guess..."
                onKeyPress={(e) => e.key === 'Enter' && checkGuess()}
              />
              <div className="flex gap-2 justify-center">
                <Button onClick={checkGuess}>Submit Guess</Button>
                <Button variant="outline" onClick={startGame}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Word
                </Button>
              </div>
              {feedback && (
                <div className={`p-3 rounded-md ${feedback.includes('Correct') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {feedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FacialRecognitionGame() {
  const [isActive, setIsActive] = useState(false)
  const [detectionCount, setDetectionCount] = useState(0)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Facial Recognition Memory Game</h2>
        <div className="bg-card p-6 rounded-lg border">
          <div className="mb-4">
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-16 h-16 text-gray-400" />
              <span className="ml-2 text-gray-500">Camera Feed (TensorFlow Integration)</span>
            </div>
            <Badge variant="secondary" className="mb-2">Detections: {detectionCount}</Badge>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This game uses TensorFlow.js for real-time facial recognition to help with cognitive motor tasks.
              Look at the camera and follow the prompts to improve memory and recognition skills.
            </p>
            <Button 
              onClick={() => setIsActive(!isActive)}
              className={isActive ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
            >
              {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isActive ? "Stop Detection" : "Start Detection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CharacterStoryGame() {
  const [character, setCharacter] = useState({
    name: "",
    age: "",
    occupation: "",
    story: ""
  })
  const [generatedStory, setGeneratedStory] = useState("")

  const generateStory = () => {
    const stories = [
      `${character.name}, a ${character.age}-year-old ${character.occupation}, discovered a magical garden behind their house. Every morning, they would tend to the flowers that changed colors with their emotions.`,
      `Once upon a time, ${character.name} worked as a ${character.occupation}. At ${character.age}, they decided to embark on an adventure to find the lost city of memories, where every forgotten moment could be rediscovered.`,
      `${character.name}, age ${character.age}, was known throughout the village as the kindest ${character.occupation}. Their story began when they found a mysterious book that could bring drawings to life.`
    ]
    const randomStory = stories[Math.floor(Math.random() * stories.length)]
    setGeneratedStory(randomStory)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Character Story Builder</h2>
        <div className="bg-card p-6 rounded-lg border">
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium mb-1">Character Name</label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter({...character, name: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Enter character name..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input
                type="text"
                value={character.age}
                onChange={(e) => setCharacter({...character, age: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Enter age..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Occupation</label>
              <input
                type="text"
                value={character.occupation}
                onChange={(e) => setCharacter({...character, occupation: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Enter occupation..."
              />
            </div>
            <Button 
              onClick={generateStory}
              disabled={!character.name || !character.age || !character.occupation}
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Generate Story
            </Button>
            
            {generatedStory && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border">
                <h3 className="font-semibold mb-2">Your Character's Story:</h3>
                <p className="text-sm">{generatedStory}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GamePage({ params }) {
  const [gameId, setGameId] = useState(null)

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setGameId(resolvedParams?.id)
    }
    getParams()
  }, [params])

  const game = gameId ? games[gameId] : null

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">AI-Powered Cognitive Games</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(games).map(([id, gameInfo]) => {
                const IconComponent = gameInfo.icon
                return (
                  <div key={id} className="bg-card p-6 rounded-lg border hover:shadow-lg transition-shadow">
                    <div className={`w-12 h-12 ${gameInfo.color} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{gameInfo.title}</h3>
                    <p className="text-muted-foreground mb-4">{gameInfo.description}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{gameInfo.difficulty}</Badge>
                      <Button asChild>
                        <a href={`/games/${id}`}>Play Game</a>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    )
  }

  const IconComponent = game.icon

  const renderGame = () => {
    switch (gameId) {
      case "1":
        return <WordGuessingGame />
      case "2":
        return <FacialRecognitionGame />
      case "3":
        return <CharacterStoryGame />
      default:
        return <div>Game not found</div>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button variant="outline" asChild className="mb-4">
            <a href="/games">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Games
            </a>
          </Button>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${game.color} rounded-lg flex items-center justify-center`}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{game.title}</h1>
              <p className="text-muted-foreground">{game.description}</p>
              <Badge variant="secondary" className="mt-2">{game.difficulty}</Badge>
            </div>
          </div>
        </div>
        
        {renderGame()}
      </main>
    </div>
  )
}
