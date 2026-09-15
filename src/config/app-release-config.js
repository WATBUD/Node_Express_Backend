const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const androidReleaseConfig = () => {
  const minimumVersionCode = positiveInteger(
    process.env.INI_ANDROID_MIN_VERSION_CODE,
    11,
  )
  const latestVersionCode = Math.max(
    minimumVersionCode,
    positiveInteger(process.env.INI_ANDROID_LATEST_VERSION_CODE, minimumVersionCode),
  )

  return {
    platform: 'android',
    minimumVersionCode,
    latestVersionCode,
    forceUpdate: true,
    storeUrl: 'https://play.google.com/store/apps/details?id=com.inidating.app',
  }
}
