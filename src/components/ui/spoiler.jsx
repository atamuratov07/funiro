import { createContext, useContext, useState } from 'react'
import { cn } from '../../lib/utils'

const SpoilerContext = createContext(null)

const useSpoilerContext = () => {
	const context = useContext(SpoilerContext)

	if (!context) {
		throw new Error('Use SpoilerTrigger within Spoiler Component')
	}

	return context
}

export function Spoiler({ value, children, className }) {
	const [isActive, setIsActive] = useState(false)

	const values = {
		isActive,
		state: isActive ? 'open' : 'closed',
		setIsActive,
		triggerId: value + '-header',
		contentId: value + '-content',
	}

	return (
		<SpoilerContext.Provider value={values}>
			<div className={cn('group', className)} data-state={values.state}>
				{children}
			</div>
		</SpoilerContext.Provider>
	)
}

Spoiler.Header = function SpoilerHeader({ children, className }) {
	const { state } = useSpoilerContext()

	return (
		<h3
			data-state={state}
			className={cn('flex items-center justify-between', className)}
		>
			{children}
		</h3>
	)
}
Spoiler.Trigger = function SpoilerTrigger({ children }) {
	const { isActive, state, setIsActive, triggerId, contentId } =
		useSpoilerContext()

	return (
		<button
			type='button'
			aria-expanded={String(isActive)}
			data-state={state}
			aria-controls={contentId}
			id={triggerId}
			onClick={setIsActive(prev => !prev)}
		>
			{/* <Icon
				name='arrow-down'
				className={cn('transition-transform w-5 md:w-3', {
					'text-accent -rotate-180': isActive,
				})}
			/> */}
			{children}
		</button>
	)
}

Spoiler.Content = function SpoilerContent({ children, className }) {
	const { isActive, contentId, headerId } = useSpoilerContext()
	const [contentHidden, setContentHidden] = useState(!isActive)

	if (isActive) setContentHidden(false)

	return (
		<div
			className={cn('grid grid-rows-[1fr] transition-grid overflow-hidden', {
				'grid-rows-[0fr] pointer-events-none ': !isActive,
			})}
			hidden={contentHidden}
			onTransitionEnd={event => {
				if (!contentHidden && !isActive) setContentHidden(true)
			}}
		>
			<div
				id={contentId}
				role='region'
				aria-labelledby={headerId}
				className='min-h-0 group-content'
			>
				{/* <ul className='p-4 my-2 bg-accent'>
					<li>
						<a href='#' className=''>
							Subitem 1
						</a>
					</li>
					<li>
						<a href='#' className=''>
							Subitem 2
						</a>
					</li>
					<li>
						<a href='#' className=''>
							Subitem 3
						</a>
					</li>
				</ul> */}
				{children}
			</div>
		</div>
	)
}
