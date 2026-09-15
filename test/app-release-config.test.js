import { expect } from 'chai'
import { androidReleaseConfig } from '../src/config/app-release-config.js'

describe('Android release config', () => {
  const originalMin = process.env.INI_ANDROID_MIN_VERSION_CODE
  const originalLatest = process.env.INI_ANDROID_LATEST_VERSION_CODE

  afterEach(() => {
    if (originalMin === undefined) delete process.env.INI_ANDROID_MIN_VERSION_CODE
    else process.env.INI_ANDROID_MIN_VERSION_CODE = originalMin
    if (originalLatest === undefined) delete process.env.INI_ANDROID_LATEST_VERSION_CODE
    else process.env.INI_ANDROID_LATEST_VERSION_CODE = originalLatest
  })

  it('requires the approved Play release when environment values are absent', () => {
    delete process.env.INI_ANDROID_MIN_VERSION_CODE
    delete process.env.INI_ANDROID_LATEST_VERSION_CODE
    const config = androidReleaseConfig()
    expect(config.minimumVersionCode).to.equal(15)
    expect(config.latestVersionCode).to.equal(15)
    expect(config.latestVersionName).to.equal('1.0.4')
  })

  it('never reports latest below the minimum allowed build', () => {
    process.env.INI_ANDROID_MIN_VERSION_CODE = '8'
    process.env.INI_ANDROID_LATEST_VERSION_CODE = '7'
    const config = androidReleaseConfig()
    expect(config.minimumVersionCode).to.equal(8)
    expect(config.latestVersionCode).to.equal(8)
  })
})
