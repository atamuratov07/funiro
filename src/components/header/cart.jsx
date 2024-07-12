import { Icon } from '../ui/icon'

export function CartComponent() {
	return (
		<div className=''>
			<a href='#cart' className='group divide-black relative'>
				<Icon
					name='cart'
					className='w-6 text-dark-blue transition-default group-hover:text-accent'
				/>
				<span className='absolute w-5 aspect-square flex items-center justify-center -top-2.5 -right-2.5 rounded-[50%] bg-accent text-white text-xs'>
					10
				</span>
			</a>
			<div className='cart-header-body'>
				<ul className=''></ul>
			</div>
		</div>
	)
}
