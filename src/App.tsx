import './App.css'
import { motion, useAnimationControls } from 'motion/react'
import { useState, useEffect, useCallback } from 'react'

// Messages grouped by energy levels
const MESSAGES = {
  low: ['Please stop', 'Can\'t you read?', 'Hey!', 'Not cool'],
  medium: ['SERIOUSLY?!', 'WHY?!', 'STAHP!', 'Oh come on!'],
  high: ['AAAAHHH!', 'MAKE IT STOP!!', 'HELP!!', '∑(ﾟДﾟ)'],
}

interface PopupText {
  id: number
  message: string
  x: number
  y: number
}

function App() {
  const controls = useAnimationControls()
  const [energy, setEnergy] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [popupTexts, setPopupTexts] = useState<PopupText[]>([])
  const [textCounter, setTextCounter] = useState(0)
  const MAX_ENERGY = 100
  const ENERGY_DECAY = 2 // Loss per tick
  const ENERGY_GAIN = 15 // Gain per click
  const TICK_RATE = 50 // ms
  const CLICK_THRESHOLD = 200

  useEffect(() => {
    const decayTimer = setInterval(() => {
      setEnergy(prev => Math.max(0, prev - ENERGY_DECAY));
    }, TICK_RATE);

    return () => clearInterval(decayTimer);
  }, []);

  const addPopupText = useCallback(() => {
    const messageGroup = energy < 33 ? 'low' : energy < 66 ? 'medium' : 'high'
    const messages = MESSAGES[messageGroup]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    // Random position around the button (in a 300x300 area)
    const x = Math.random() * 300 - 150 // -150 to 150
    const y = Math.random() * 300 - 150 // -150 to 150

    const newText: PopupText = {
      id: textCounter,
      message: randomMessage,
      x,
      y,
    }

    setPopupTexts(prev => [...prev, newText])
    setTextCounter(prev => prev + 1)

    // Remove the text after animation
    setTimeout(() => {
      setPopupTexts(prev => prev.filter(text => text.id !== newText.id))
    }, 1000)
  }, [energy, textCounter])

  const handleClick = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    if (timeSinceLastClick < CLICK_THRESHOLD) {
      setEnergy(prev => Math.min(MAX_ENERGY, prev + ENERGY_GAIN));
    } else {
      setEnergy(prev => Math.min(MAX_ENERGY, prev + ENERGY_GAIN * 0.5));
    }

    setLastClickTime(now);

    const intensity = energy / MAX_ENERGY;
    const scale = Math.pow(intensity, 2); // Quadratic scaling for smoother progression

    await controls.set({ rotate: 0, x: 0, y: 0 });
    controls.start({
      rotate: [
        0,
        -1 * scale,
        2 * scale,
        -8 * scale,
        6 * scale,
        -4 * scale,
        2 * scale,
        0
      ],
      x: [
        0,
        2 * scale,
        -4 * scale,
        6 * scale,
        -6 * scale,
        4 * scale,
        -2 * scale,
        0
      ],
      y: [
        0,
        1 * scale,
        -2 * scale,
        2 * scale,
        -1 * scale,
        1 * scale,
        0
      ],
      transition: {
        duration: Math.max(0.5 - (intensity * 0.3), 0.15),
        ease: intensity > 0.7 ? "easeInOut" : "anticipate",
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1],
      }
    });

    // Add popup text at certain intervals
    if (energy % 10 === 0 || Math.random() < 0.3) { // 30% chance or every 10 energy
      addPopupText()
    }
  }, [controls, energy, lastClickTime, addPopupText])

  const buttonColor = `rgb(255, ${255 - (energy * 2.5)}, ${255 - (energy * 2.5)})`;

  return (
    <main className="relative flex flex-col justify-center items-center bg-black h-screen overflow-hidden">
      {popupTexts.map((text) => (
        <motion.div
          key={text.id}
          className="absolute font-bold text-white text-xl pointer-events-none"
          initial={{
            opacity: 0,
            scale: 0.5,
            x: text.x,
            y: text.y,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1, 0.8],
            y: text.y - 50, // Float upward
          }}
          transition={{
            duration: 1,
            ease: "backOut",
          }}
        >
          {text.message}
        </motion.div>
      ))}

      <motion.button
        className="px-8 py-4 rounded-md font-bold text-2xl uppercase"
        style={{ backgroundColor: buttonColor }}
        onClick={handleClick}
        animate={controls}
        whileTap={{ scale: 0.97 }}
      >
        Don't click this button
      </motion.button>
    </main>
  )
}

export default App
