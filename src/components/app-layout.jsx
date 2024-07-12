import { useState } from 'react'
import { cn } from '../lib/utils'
import { Icon } from './ui/icon'

const Spoiler = ({}) => {
	const [isActive, setIsActive] = useState(false)
	const [contentHidden, setContentHidden] = useState(true)

	const className = cn(
		'grid grid-rows-[1fr] outline-dashed outline-2 outline-primary overflow-hidden',
		'transition-grid',
		{
			'grid-rows-[0fr] pointer-events-none': !isActive,
		}
	)

	return (
		<div className='max-w-52 group mx-auto mt-[200px]'>
			<h3 className='flex items-center justify-between'>
				<a
					href='#'
					className='font-semibold md:font-medium text-2xl md:text-base transition-colors group-hover:text-accent'
				>
					Accordion Header
				</a>
				<button
					type='button'
					aria-expanded={String(isActive)}
					aria-controls='acc-content'
					id='acc-header'
					onClick={() => {
						setIsActive(prev => !prev)
						setContentHidden(false)
					}}
				>
					<Icon
						name='arrow-down'
						className={cn('transition-transform w-5 md:w-3', {
							'text-accent -rotate-180': isActive,
						})}
					/>
				</button>
			</h3>

			<div
				className={className}
				hidden={contentHidden}
				onTransitionEnd={event => {
					// console.log(event)
					if (!contentHidden && !isActive) setContentHidden(true)
				}}
			>
				<div
					id='acc-content'
					role='region'
					aria-labelledby='acc-header'
					className='min-h-0'
				>
					<ul className='p-4 my-2 bg-accent'>
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
					</ul>
				</div>
			</div>
		</div>
	)
}
export function AppLayout() {
	return (
		<>
			{/* <Header /> */}
			<Spoiler />
			<div id='modals' className=''></div>
		</>
	)
}
