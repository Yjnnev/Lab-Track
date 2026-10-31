import { render } from 'preact'
import { registerSW } from 'virtual:pwa-register'
import { App } from './app.jsx'

registerSW({ immediate: true })

render(<App />, document.getElementById('app'))
