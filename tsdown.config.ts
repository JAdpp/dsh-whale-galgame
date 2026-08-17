import { clientBundle } from './build/tsdown.client.ts'

export default clientBundle('dsh-whale-galgame', ['src/index.ts'], {
  portableCssModuleIds: true,
})
