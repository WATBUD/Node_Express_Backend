const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export const androidReleaseConfig = () => {
  const minimumVersionCode = positiveInteger(
    process.env.INI_ANDROID_MIN_VERSION_CODE,
    15, // Play release 15 approved; never advance this during review.
  )
  const latestVersionCode = Math.max(
    minimumVersionCode,
    positiveInteger(process.env.INI_ANDROID_LATEST_VERSION_CODE, minimumVersionCode),
  )

  return {
    platform: 'android',
    minimumVersionCode,
    latestVersionCode,
    latestVersionName: process.env.INI_ANDROID_LATEST_VERSION_NAME || '1.0.4',
    forceUpdate: true,
    storeUrl: 'https://play.google.com/store/apps/details?id=com.inidating.app',
  }
}
