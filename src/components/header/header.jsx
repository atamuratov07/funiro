import { useState } from 'react'
import { ActionsComponent } from './actions'
import { MenuBurger } from './menu-burger'
import { NavComponent } from './nav'
import { SearchComponent } from './search'

export function Header() {
	const [isNavActive, setIsNavActive] = useState(false)

	const toggleNavActive = () => {
		setIsNavActive(last => !last)
	}

	const closeNavActive = () => {
		setIsNavActive(false)
	}

	return (
		<header className='absolute top-0 left-0 w-full'>
			<div className='fixed top-0 left-0 w-full z-50'>
				<div className='container relative py-1 flex items-center gap-x-4 md:gap-x-6 min-h-12 md:min-h-20 lg:min-h-[125px]'>
					<div className='flex-auto lg:flex-initial flex items-center gap-x-3 w-[calc(494/1240*100%)]'>
						<a
							href='/'
							className='text-black font-bold text-2xl relative z-10'
						>
							Funiro.
						</a>
						<NavComponent
							isActive={isNavActive}
							onItemClick={closeNavActive}
							className='basis-[420px]'
						/>
					</div>
					<SearchComponent className='lg:flex-auto' />
					<ActionsComponent className='relative z-10' />

					<div className='relative z-10 md:hidden'>
						<MenuBurger
							isActive={isNavActive}
							onClick={toggleNavActive}
							onBlur={closeNavActive}
						/>
					</div>
				</div>
			</div>
		</header>
	)
}
