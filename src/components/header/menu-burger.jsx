import { useOutsideClick } from '../../hooks/useOutsideClick'
import { cn } from '../../lib/utils'

export function MenuBurger({ onClick, onBlur, isActive, className }) {
	const ref = useOutsideClick(onBlur)

	return (
		<button
			type='button'
			ref={ref}
			onClick={onClick}
			className={cn(
				'cursor-pointer w-12 h-11 p-2.5 transition-colors rounded-sm hover:bg-secondary',
				className
			)}
		>
			<div
				className={cn(
					'relative top-0 w-full h-1 rounded-sm bg-current transition-all duration-0 delay-300',
					'before:content-[""] before:absolute before:left-0 before:bottom-2.5 before:w-full before:h-1 before:rounded-sm before:bg-current before:transition-burger-bottom',
					'after:content-[""] after:absolute after:left-0 after:top-2.5 after:w-full after:h-1 after:rounded-sm after:bg-current after:transition-burger-top',
					{
						'bg-transparent before:-rotate-45 before:bottom-0 before:transition-burger-bottom-after after:rotate-45 after:top-0 after:transition-burger-top-after':
							isActive,
					}
				)}
			/>
		</button>
	)
}
