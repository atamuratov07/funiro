import { useEffect, useRef } from 'react'

export function useOutsideClick(onOutsideClick, ...exceptions) {
	const ref = useRef()

	useEffect(() => {
		function handleClick(event) {
			if (ref.current && !ref.current.contains(event.target)) {
				onOutsideClick()
			}
		}

		document.addEventListener('click', handleClick)

		return () => {
			document.removeEventListener('click', handleClick)
		}
	}, [onOutsideClick])

	return ref
}
