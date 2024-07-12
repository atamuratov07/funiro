import { AppLayout } from './components/app-layout'
import { AppContextProvider } from './context/app-context'

export default function App() {
	return (
		<AppContextProvider>
			<AppLayout />
		</AppContextProvider>
	)
}
