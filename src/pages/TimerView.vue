<script setup>
import { onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { DateTime } from 'luxon'
import { useAudio } from 'src/composables/audio.js'
import { useColors, useTheme } from 'src/composables/colors.js'

const $q = useQuasar()
const { trackColor, textColor, textMuted, mutedColor, negativeColor } = useColors($q)
const { dark, toggle } = useTheme($q)

const DEFAULT_TIME = process.env.DEV ? 5 : 30
const timerInput = ref(null)
const inputError = ref(false)
const inputErrorMsg = ref('')
const timerValue = ref(0)
const timerLength = ref(DEFAULT_TIME)

const validate = (val) => {
  if (val <= 0) {
    inputError.value = true
    inputErrorMsg.value = 'Value must be greater than 0'
    return false
  }
  inputError.value = false
  inputErrorMsg.value = ''
  return true
}

const startTime = ref(null)
const endTime = ref(null)

const remaining = () => {
  if (endTime.value === null) return null
  return (endTime.value.diff(DateTime.now())).as('seconds')
}

const reset = () => {
  running.value = false
  paused.value = false
  startTime.value = DateTime.now()
  endTime.value = startTime.value.plus({ seconds: timerLength.value})
  timerValue.value = 0
}

const autoRestart = ref(false)
const { beeps, beep, shortBeep } = useAudio()
const tick = () => {
  let r = remaining()
  if (r <= 3 && beeps.value === 0) beep()
  if (r <= 2 && beeps.value === 1) beep()
  if (r <= 1 && beeps.value === 2) beep()
  if (r < 0) {
    beep()
    laps.value += 1
    if (autoRestart.value) {
      stop()
      reset()
      start()
    } else {
      stop()
    }
  }
  timerValue.value = timerLength.value - remaining()
}

const laps = ref(0)
const running = ref(false)
const paused = ref(false)
let interval = null

const start = () => {
  if (paused.value) {
    resume()
  }
  else {
    shortBeep()
    reset()
  }
  running.value = true
  tick()
  interval = setInterval(tick, 50)
}

const pause = () => {
  paused.value = true
  running.value = false
  if (interval !== null) clearInterval(interval)
}

const resume = () => {
  paused.value = false
  running.value = true
  startTime.value = DateTime.now().minus({ seconds: timerValue.value })
  endTime.value = startTime.value.plus({ seconds: timerLength.value})
}

const stop = () => {
  running.value = false
  paused.value = false
  startTime.value = null
  endTime.value = null
  if (interval !== null) clearInterval(interval)
}

const end = () => {
  laps.value = 0
  timerValue.value = 0
}

const setDefaults = () => {
  stop()
  end()
  autoRestart.value = false
  timerLength.value = DEFAULT_TIME
}

onUnmounted(() => {
  if (interval !== null) stop()
})

</script>

<template>
  <q-layout>
    <q-page-container>
      <q-page :class="`column items-center ${textColor}`">
        <q-btn
          class="q-ma-md"
          style="position: absolute; top: 0; right: 0;"
          no-caps
          flat
          dense
          :icon="dark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          :color="mutedColor"
          @click="toggle"
        />
          <h1 class="items-center justify-center" style="font-family: Roboto; font-size: 3.5rem; font-weight: bold;">
            <q-icon name="mdi-timer" color="accent" class="q-mb-sm"/>
            <span class="q-pr-sm">FreeTimer</span>
          </h1>
          <div>
            <q-circular-progress
              show-value
              :value="timerValue"
              :max="Math.max(1, timerLength)"
              size="300px"
              :track-color="trackColor"
              color="primary"
              :animation-speed="100"
              :thickness=".3"
            >
              <div class="column items-center" style="font-family: Roboto Mono, monospace;">
                <div class="cursor-pointer">
                  <span>
                    {{ Math.max(0, Math.ceil(remaining())) || timerLength }}
                  </span>
                  <q-popup-edit
                    class="q-py-md"
                    v-model="timerLength"
                    auto-save
                    anchor="center middle"
                    v-slot="scope"
                    :validate="validate"
                    @hide="validate"
                    @update:model-value="val => {timerLength = (val && val > 0) ? val : 1; reset()}"
                  >
                    <q-input
                      ref="timerInput"
                      style="font-size: 2rem; max-width: 200px;"
                      autofocus
                      v-model.number="scope.value"
                      type="number"
                      min="1"
                      no-error-icon
                      :error="inputError"
                      :error-message="inputErrorMsg"
                      @keyup.enter="scope.set"
                      @focus="timerInput.select()"
                    />
                  </q-popup-edit>
                </div>
                <span :class="`${textMuted} row items-center`" style="font-size: 2rem;">
                  <q-icon name="mdi-medal" class="q-mt-xs" size="sm" :color="trackColor"/>
                  {{ laps || 0 }}
                </span>

              </div>
            </q-circular-progress>
          </div>
          <div class="row q-mt-md q-gutter-sm q-pr-sm">
            <q-btn
              :outline="!autoRestart"
              :color="autoRestart ? 'accent' : mutedColor"
              icon="mdi-timer-refresh"
              round
              unelevated
              @click="autoRestart = !autoRestart"
            />
            <q-btn
              v-if="!running"
              color="primary"
              icon="mdi-play"
              style="color: #ffffffe0 !important;"
              round
              unelevated
              @click="start"
            />
            <q-btn
              v-else
              color="primary"
              icon="mdi-pause"
              style="color: #ffffffe0 !important;"
              round
              unelevated
              @click="pause"
            />
            <q-btn
              color="negative"
              icon="mdi-stop"
              style="color: #ffffffe4 !important;"
              round
              unelevated
              @click="stop(); end();"
            />
          </div>
          <div class="col-grow column items-bottom justify-end q-pb-sm">
            <q-btn
              no-caps
              flat
              dense
              :color="negativeColor"
              label="reset"
              @click="setDefaults"
            />
            <q-btn
              flat
              :color="mutedColor"
              no-caps
              dense
              icon="mdi-code-braces-box"
              href="https://github.com/mshems/FreeTimer"
              target="_blank"
              rel="noopener noreferrer"
              label="github"
            />
          </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
