  import { createContext } from 'react'
  import { createRoot } from 'react-dom/client'
  import App from './App.tsx'
  import Store from './store/store.ts'
  interface State{
    store: Store,
  }
  const store = new Store()

  export const Context = createContext<State>({
    store,
  })

  createRoot(document.getElementById('root')!).render(
    <Context.Provider value={{
      store
    }}>
      <App />
    </Context.Provider>
  )
