import { createContext } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Store from './store/store.ts'
import './index.css'

interface State {
  store: Store,
}

const store = new Store()

export const Context = createContext<State>({ store })

const container = document.getElementById('root')!
const root = (container as any).__reactRoot ?? createRoot(container)
;(container as any).__reactRoot = root

root.render(
  <Context.Provider value={{ store }}>
    <App />
  </Context.Provider>
)
