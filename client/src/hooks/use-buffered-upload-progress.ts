import { useEffect, useRef, useState } from "react"

const BUFFER_LEAD = 14
const BUFFER_CREEP = 0.14
const PROGRESS_CATCHUP = 0.16
const MIN_STEP = 0.4

export function useBufferedUploadProgress(
  targetPercent: number,
  active: boolean,
  complete: boolean,
) {
  const [progress, setProgress] = useState(0)
  const [buffer, setBuffer] = useState(0)
  const targetRef = useRef(targetPercent)
  const progressRef = useRef(0)
  const bufferRef = useRef(0)

  targetRef.current = complete ? 100 : targetPercent

  useEffect(() => {
    if (!active) {
      progressRef.current = 0
      bufferRef.current = 0
      setProgress(0)
      setBuffer(0)
      return
    }

    let raf = 0

    const tick = () => {
      const target = complete ? 100 : targetRef.current

      let nextProgress = progressRef.current
      if (complete) {
        nextProgress = 100
      } else if (nextProgress < target) {
        nextProgress = Math.min(
          target,
          nextProgress +
            Math.max(MIN_STEP, (target - nextProgress) * PROGRESS_CATCHUP),
        )
      }

      const bufferCap = complete
        ? 100
        : Math.min(99, Math.max(target, nextProgress) + BUFFER_LEAD)

      let nextBuffer = bufferRef.current
      if (complete) {
        nextBuffer = 100
      } else if (nextBuffer < bufferCap) {
        nextBuffer = Math.min(bufferCap, nextBuffer + BUFFER_CREEP)
      } else if (nextBuffer > bufferCap + 2) {
        nextBuffer = bufferCap
      }

      nextBuffer = Math.max(nextBuffer, Math.min(99, nextProgress + 2))

      progressRef.current = nextProgress
      bufferRef.current = nextBuffer
      setProgress(nextProgress)
      setBuffer(nextBuffer)

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, complete])

  return {
    progress: Math.round(progress),
    buffer: Math.round(buffer),
  }
}
