import { useState } from 'react'
import { useAppContext } from '../../context/app-context'
import { cn } from '../../lib/utils'
import { Icon } from '../ui/icon'

const ItemWithSubList = ({ itemData, ...itemProps }) => {
	const [isActive, setIsActive] = useState(false)

	const className = cn(
		'grid grid-rows-[1fr] p-4',
		'relative z-5 flex-full bg-accent -mx-5 overflow-hidden',
		'md:absolute md:left-0 md:top-full md:mx-0 md:min-w-[200px]',
		'md:duration-0 transition-all transition-grid',
		'md:opacity-0 md:grid-rows-[1fr] md:py-4 md:-translate-y-2 md:scale-95',
		'group-hover:duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-hover:scale-100',
		{
			'grid-rows-[0fr] py-0 pointer-events-none': !isActive,
		}
	)

	return (
		<Item
			itemData={itemData}
			onBlur={() => setIsActive(false)}
			{...itemProps}
		>
			<button
				type='button'
				onTouchStart={() => setIsActive(prev => !prev)}
				className={cn(
					'md:ml-2 transition-transform group-hover:-rotate-180 group-hover:text-accent',
					{
						'text-accent -rotate-180': isActive,
					}
				)}
			>
				<Icon name='arrow-down' className='w-5 md:w-3' />
			</button>

			{itemData.content && (
				<div className={className} hidden={!isActive}>
					<ul className='min-h-0 space-y-2 md:space-y-1'>
						{itemData.content.map(subItemData => (
							<li key={subItemData.id}>
								<a
									href={subItemData.url}
									className='text-white text-lg md:text-base'
								>
									{subItemData.title}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}
		</Item>
	)
}

const Item = ({ itemData, children, ...props }) => {
	return (
		<li
			key={itemData.id}
			className='group relative flex items-center flex-wrap justify-between md:mx-1 py-1'
			{...props}
		>
			<a
				href={itemData.url}
				className='font-semibold md:font-medium text-2xl md:text-base transition-colors group-hover:text-accent'
			>
				{itemData.title}
			</a>
			{children}
		</li>
	)
}

export function NavComponent({ className, isActive, onItemClick = () => {} }) {
	const { headerNavData: data } = useAppContext()

	if (!data) return null

	return (
		<nav
			className={cn(
				'fixed inset-0 overflow-y-auto bg-orange-100 pt-20 px-4 transition-default',
				'md:bg-transparent md:static md:p-0 md:overflow-visible',
				className
			)}
		>
			<ul className='md:flex md:flex-wrap md:justify-evenly space-y-4 md:space-y-0'>
				{data.map(itemData =>
					itemData['content'] ? (
						<ItemWithSubList
							key={itemData.id}
							itemData={itemData}
							onClick={onItemClick}
						/>
					) : (
						<Item
							key={itemData.id}
							itemData={itemData}
							onClick={onItemClick}
						/>
					)
				)}
			</ul>
		</nav>
	)
}
