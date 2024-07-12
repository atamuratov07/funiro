import { useRef, useState } from 'react'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/icon'

export function SearchComponent({ className }) {
	const [isActive, setIsActive] = useState(false)
	const inputRef = useRef(null)

	if (isActive) inputRef?.current?.focus()

	return (
		<div className={className}>
			<div className='max-w-[473px]'>
				<button
					type='button'
					onClick={() => setIsActive(true)}
					className='flex items-center lg:hidden'
				>
					<Icon
						name='search'
						className={cn('w-6 relative z-10', {
							'text-accent': isActive,
							'text-dark-blue': !isActive,
						})}
					/>
				</button>
				<form
					action='#'
					onBlur={() => setIsActive(false)}
					className={cn(
						'flex items-center bg-white shadow lg:shadow-none absolute left-0 z-10 transition-default lg:opacity-100 lg:static w-full lg:w-auto',
						{
							'-top-full opacity-0': !isActive,
							'top-full rounded-sm outline-3 outline outline-primary outline-offset-2':
								isActive,
						}
					)}
				>
					<button
						type='submit'
						className='w-11 aspect-square flex justify-center items-center'
						onClick={e => e.preventDefault()}
					>
						<Icon name='search' className='w-4' />
					</button>
					<input
						ref={inputRef}
						onFocus={() => setIsActive(true)}
						type='text'
						placeholder='Search for minimalist chair'
						className='text-sm placeholder:text-secondary-dark w-full pr-5 focus:outline-none'
					/>
				</form>
			</div>
		</div>
	)
}
