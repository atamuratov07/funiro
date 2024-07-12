import { createContext, useContext, useEffect, useState } from 'react'
import jsonData from '/data.json?url'

const AppContext = createContext({})

export function useAppContext() {
	const context = useContext(AppContext)
	if (!context) throw new Error('Use app context within provider!')
	return context
}

export function AppContextProvider({ children }) {
	const [data, setData] = useState({})

	useEffect(() => {
		async function fetchData() {
			const response = await fetch(jsonData)

			const res = await response.json()

			if (res !== undefined) setData(res)
		}

		fetchData()
	}, [])

	return <AppContext.Provider value={data}>{children}</AppContext.Provider>
}
