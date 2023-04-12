import { computed } from 'vue'

export function useColors ($q) {
  const trackColor = computed(()    =>  $q.dark.isActive ? 'grey-9'         : 'grey-4')
  const textColor = computed(()     =>  $q.dark.isActive ? 'text-grey-6'    : 'text-grey-9')
  const textMuted = computed(()     =>  $q.dark.isActive ? 'text-grey-8'    : 'text-grey-6')
  const mutedColor = computed(()    =>  $q.dark.isActive ? 'grey-7'         : 'grey-5')
  const negativeColor = computed(() =>  $q.dark.isActive ? 'negative-dark'  : 'negative')

  return { trackColor, textColor, textMuted, mutedColor, negativeColor }
}

export function useTheme($q) {
  const stored = $q.localStorage.getItem('freetimer-dark')
  $q.dark.set(stored === null ? 'auto' : stored)

  function toggle () {
    $q.dark.toggle()
    $q.localStorage.set('freetimer-dark', $q.dark.mode)
  }

  return { dark: computed(() => $q.dark.isActive), toggle }
}
