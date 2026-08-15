import { clientBundle } from './build/tsdown.client.ts'

export default clientBundle('@dsh-external/dsh-whale-galgame', ['src/index.ts'], {
  portableCssModuleIds: true,
})
