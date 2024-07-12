import { cn } from '../../lib/utils'
import { Icon } from '../ui/icon'
import { CartComponent } from './cart'
import Avatar from '/images/header-avatar.png'

export function ActionsComponent({ className }) {
	return (
		<div
			className={cn(
				'flex items-center gap-x-4 md:gap-x-6 lg:gap-x-8',
				className
			)}
		>
			<a href='#favorites' className='group'>
				<Icon
					name='favorite'
					className='w-6 text-dark-blue group-hover:text-accent transition-default'
				/>
			</a>
			<CartComponent />
			<a href='' className='overflow-hidden rounded-[50%] w-8 md:w-10'>
				<img src={Avatar} alt='Avatar' />
			</a>
		</div>
	)
}
