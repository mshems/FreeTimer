import { ref, unref } from 'vue'

export function useAudio () {
  const beeps = ref(0)
  const short = new Audio('sfx/beep-short.mp3')
  short.playbackRate = 2
  const long = new Audio('sfx/beep-complete.mp3')


  function shortBeep () {
    short.play()
  }

  function longBeep () {
    long.play()
  }

  function beep () {
    if (beeps.value < 3) {
      shortBeep()
      beeps.value++
    } else {
      longBeep()
      beeps.value = 0
    }
  }

  return { beeps, beep, shortBeep, longBeep }
}
