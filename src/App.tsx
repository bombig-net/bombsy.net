import './App.css'
import { motion, useAnimationControls } from 'motion/react'
import { useState, useEffect, useCallback } from 'react'

function App() {
  const controls = useAnimationControls()
  const [energy, setEnergy] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)
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
  }, [controls, energy, lastClickTime]);

  const buttonColor = `rgb(255, ${255 - (energy * 2.5)}, ${255 - (energy * 2.5)})`;

  return (
    <main className="flex flex-col justify-center items-center bg-black h-screen">
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
