import './App.css'
import { motion, useAnimationControls } from 'motion/react'
import { useState, useEffect, useCallback } from 'react'

// Messages grouped by energy levels
const MESSAGES = {
  low: ['Please stop', 'Can\'t you read?', 'Hey!', 'Not cool'],
  medium: ['SERIOUSLY?!', 'WHY?!', 'STAHP!', 'Oh come on!'],
  high: ['AAAAHHH!', 'MAKE IT STOP!!', 'HELP!!', '∑(ﾟДﾟ)'],
}

// Add to existing messages
const POST_EXPLOSION_MESSAGES = [
  'HAPPY NOW?!',
  'LOOK WHAT YOU DID!',
  'HOPE YOU\'RE PROUD OF YOURSELF!',
  '(╯°□°)╯︵ ┻━┻'
]

// Add near the top with other constants
const GLITCH_COLORS = [
  'rgb(255, 0, 0)',   // Red
  'rgb(0, 255, 255)', // Cyan
  'rgb(255, 0, 255)', // Magenta
  'rgb(255, 255, 0)', // Yellow
  'rgb(0, 255, 0)',   // Green
]

interface PopupText {
  id: number
  message: string
  x: number
  y: number
  duration: number
}

interface Particle {
  id: number
  x: number
  y: number
  rotation: number
  scale: number
}

function App() {
  const controls = useAnimationControls()
  const [energy, setEnergy] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
  const [popupTexts, setPopupTexts] = useState<PopupText[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [textCounter, setTextCounter] = useState(0)
  const [isExploding, setIsExploding] = useState(false)
  const [maxEnergyTimer, setMaxEnergyTimer] = useState<number | null>(null)
  const [postExplosionStep, setPostExplosionStep] = useState(0)
  const [isGlitching, setIsGlitching] = useState(false)
  const MAX_ENERGY = 100
  const ENERGY_DECAY = 1 // Reduced from 2 to 1
  const ENERGY_GAIN = 20 // Increased from 15 to 20
  const TICK_RATE = 50 // ms
  const CLICK_THRESHOLD = 200
  const EXPLOSION_CHARGE_TIME = 1500 // Reduced from 2000 to 1500ms

  useEffect(() => {
    const decayTimer = setInterval(() => {
      setEnergy(prev => {
        const newEnergy = Math.max(0, prev - ENERGY_DECAY);
        // Only clear timer if energy drops significantly below max
        if (newEnergy < MAX_ENERGY - 5 && maxEnergyTimer) {
          clearTimeout(maxEnergyTimer);
          setMaxEnergyTimer(null);
        }
        return newEnergy;
      });
    }, TICK_RATE);

    return () => {
      clearInterval(decayTimer);
      if (maxEnergyTimer) clearTimeout(maxEnergyTimer);
    };
  }, [maxEnergyTimer]);

  const addPopupText = useCallback(() => {
    const messageGroup = energy < 33 ? 'low' : energy < 66 ? 'medium' : 'high'
    const messages = MESSAGES[messageGroup]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    // Button dimensions (approximate)
    const BUTTON_WIDTH = 300
    const BUTTON_HEIGHT = 80
    const SAFE_MARGIN = 40 // Minimum distance from button

    // Calculate random position in safe zone
    let x, y
    do {
      x = Math.random() * 500 - 250 // -250 to 250
      y = Math.random() * 500 - 250 // -250 to 250
    } while (
      Math.abs(x) < (BUTTON_WIDTH / 2 + SAFE_MARGIN) &&
      Math.abs(y) < (BUTTON_HEIGHT / 2 + SAFE_MARGIN)
    )

    // Calculate duration based on message length (100ms per character, minimum 1s, maximum 3s)
    const duration = Math.min(Math.max(randomMessage.length * 0.1, 1), 3)

    const newText: PopupText = {
      id: textCounter,
      message: randomMessage,
      x,
      y,
      duration
    }

    setPopupTexts(prev => [...prev, newText])
    setTextCounter(prev => prev + 1)

    // Remove the text after animation
    setTimeout(() => {
      setPopupTexts(prev => prev.filter(text => text.id !== newText.id))
    }, duration * 1000)
  }, [energy, textCounter])

  const createExplosion = useCallback(() => {
    // Start glitch effect before explosion
    setIsGlitching(true)

    // Actual explosion happens after glitch
    setTimeout(() => {
      setIsGlitching(false)
      setIsExploding(true)
      const particleCount = 20
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: 0,
        y: 0,
        rotation: (360 / particleCount) * i,
        scale: Math.random() * 0.5 + 0.5
      }))
      setParticles(newParticles)

      // Start post-explosion sequence
      setTimeout(() => {
        setParticles([])
        setIsExploding(false)
        setEnergy(0)

        // Show messages in sequence
        POST_EXPLOSION_MESSAGES.forEach((_, index) => {
          setTimeout(() => {
            setPostExplosionStep(index + 1)
          }, index * 1000) // Show each message 1 second apart
        })

        // Redirect after messages
        setTimeout(() => {
          window.location.href = 'https://bombig.net'
        }, POST_EXPLOSION_MESSAGES.length * 1000 + 500) // Add extra 500ms after last message
      }, 1000)
    }, 2000) // 2 seconds of glitch effect
  }, [])

  const handleClick = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime;

    const newEnergy = timeSinceLastClick < CLICK_THRESHOLD
      ? Math.min(MAX_ENERGY, energy + ENERGY_GAIN)
      : Math.min(MAX_ENERGY, energy + ENERGY_GAIN * 0.5);

    // Start max energy timer if we just reached max energy
    if (newEnergy >= MAX_ENERGY && !maxEnergyTimer && !isExploding) {
      const timer = window.setTimeout(() => {
        createExplosion();
      }, EXPLOSION_CHARGE_TIME);
      setMaxEnergyTimer(timer);
    }

    setEnergy(newEnergy);
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
  }, [controls, energy, lastClickTime, addPopupText, isExploding, createExplosion, maxEnergyTimer])

  const buttonColor = `rgb(255, ${255 - (energy * 2.5)}, ${255 - (energy * 2.5)})`;

  return (
    <main
      className="relative flex flex-col justify-center items-center h-screen overflow-hidden"
      style={{
        backgroundColor: isGlitching
          ? GLITCH_COLORS[Math.floor(Math.random() * GLITCH_COLORS.length)]
          : 'black'
      }}
    >
      {/* Glitch overlay */}
      {isGlitching && (
        <motion.div
          className="absolute inset-0 pointer-events-none mix-blend-difference"
          animate={{
            backgroundColor: GLITCH_COLORS,
          }}
          transition={{
            duration: 0.2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      )}

      {/* Glitching button */}
      <motion.button
        className="px-8 py-4 rounded-md font-bold text-2xl uppercase"
        style={{
          backgroundColor: buttonColor,
          boxShadow: maxEnergyTimer ? '0 0 20px 10px rgba(255, 0, 0, 0.5)' : 'none'
        }}
        onClick={handleClick}
        animate={controls}
        {...(isGlitching && {
          animate: {
            x: [-2, 2, -4, 4, -2, 2, 0],
            y: [2, -2, 4, -4, 2, -2, 0],
            scale: [1, 1.02, 0.98, 1.04, 0.96, 1],
            filter: [
              'hue-rotate(0deg)',
              'hue-rotate(90deg)',
              'hue-rotate(180deg)',
              'hue-rotate(270deg)',
              'hue-rotate(0deg)',
            ],
          },
          transition: {
            duration: 0.2,
            repeat: Infinity,
            repeatType: "reverse",
          },
        })}
        {...(isExploding && {
          animate: {
            scale: [1, 1.5, 0],
            rotate: [0, 15, -15, 0],
            opacity: [1, 1, 0]
          },
          transition: {
            duration: 0.5,
            ease: "easeInOut"
          }
        })}
      >
        Don't click this button
      </motion.button>

      {/* Text glitch effect during glitch phase */}
      {isGlitching && (
        <motion.div
          className="absolute inset-0 flex justify-center items-center pointer-events-none"
          animate={{
            filter: [
              'blur(0px)',
              'blur(2px)',
              'blur(0px)',
              'blur(3px)',
              'blur(0px)',
            ],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <div className="font-bold text-white text-4xl mix-blend-difference">
            SYSTEM OVERLOAD
          </div>
        </motion.div>
      )}

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
            y: text.y - 50,
          }}
          transition={{
            duration: text.duration,
            ease: "backOut",
          }}
        >
          {text.message}
        </motion.div>
      ))}

      {/* Explosion particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-white rounded-full w-4 h-4 pointer-events-none"
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            rotate: particle.rotation,
            opacity: 1
          }}
          animate={{
            x: Math.cos(particle.rotation * (Math.PI / 180)) * 100,
            y: Math.sin(particle.rotation * (Math.PI / 180)) * 100,
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        />
      ))}

      {/* Max energy charging indicator */}
      {maxEnergyTimer && (
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{
            duration: EXPLOSION_CHARGE_TIME / 1000,
            ease: "linear"
          }}
        />
      )}

      {/* Flash effect */}
      {isExploding && (
        <motion.div
          className="absolute inset-0 bg-white pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Post explosion messages */}
      {postExplosionStep > 0 && postExplosionStep <= POST_EXPLOSION_MESSAGES.length && (
        <motion.div
          key={postExplosionStep}
          className="absolute font-bold text-white text-4xl pointer-events-none"
          initial={{ opacity: 0, scale: 0.5, y: 0 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "backOut" }}
        >
          {POST_EXPLOSION_MESSAGES[postExplosionStep - 1]}
        </motion.div>
      )}
    </main>
  )
}

export default App
