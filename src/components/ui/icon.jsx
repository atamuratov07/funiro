import { useAppContext } from '../../context/app-context'
import { cn } from '../../lib/utils'

export function Icon({ name, className, ...props }) {
	const { icons, baseDir } = useAppContext()

	if (!icons) return null

	return (
		<svg className={cn('aspect-square', className)} {...props}>
			<use href={`${baseDir}${icons.path}#${icons.starterId}${name}`} />
		</svg>
	)
}
