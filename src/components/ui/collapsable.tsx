import {
	forwardRef,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import { useControllableState } from '../../hooks/use-controllable-state'
import { composeEventHandlers } from '../../lib/helpers/compose-event-handlers'
import { useComposedRefs } from '../../lib/helpers/compose-ref'
import type { Scope } from '../../lib/helpers/create-context'
import { createContextScope } from '../../lib/helpers/create-context'
import { Presence } from './presence'

/* -------------------------------------------------------------------------------------------------
 * Collapsible
 * -----------------------------------------------------------------------------------------------*/

const COLLAPSIBLE_NAME = 'Collapsible'

type ScopedProps<P> = P & { __scopeCollapsible?: Scope }

const [createCollapsibleContext, createCollapsibleScope] =
	createContextScope(COLLAPSIBLE_NAME)

type CollapsibleContextValue = {
	contentId: string
	disabled?: boolean
	open: boolean
	onOpenToggle(): void
}

const [CollapsibleProvider, useCollapsibleContext] =
	createCollapsibleContext<CollapsibleContextValue>(COLLAPSIBLE_NAME)

type CollapsibleElement = ElementRef<typeof Primitive.div>
type PrimitiveDivProps = ComponentPropsWithoutRef<typeof Primitive.div>
interface CollapsibleProps extends PrimitiveDivProps {
	defaultOpen?: boolean
	open?: boolean
	disabled?: boolean
	onOpenChange?(open: boolean): void
}

const Collapsible = forwardRef<CollapsibleElement, CollapsibleProps>(
	(props: ScopedProps<CollapsibleProps>, forwardedRef) => {
		const {
			__scopeCollapsible,
			open: openProp,

			defaultOpen,
			disabled,
			onOpenChange,
			...collapsibleProps
		} = props

		const [open = false, setOpen] = useControllableState({
			prop: openProp,
			defaultProp: defaultOpen,
			onChange: onOpenChange,
		})

		return (
			<CollapsibleProvider
				scope={__scopeCollapsible}
				disabled={disabled}
				contentId={useId()}
				open={open}
				onOpenToggle={useCallback(
					() => setOpen(prevOpen => !prevOpen),
					[setOpen]
				)}
			>
				<Primitive.div
					data-state={getState(open)}
					data-disabled={disabled ? '' : undefined}
					{...collapsibleProps}
					ref={forwardedRef}
				/>
			</CollapsibleProvider>
		)
	}
)

Collapsible.displayName = COLLAPSIBLE_NAME

/* -------------------------------------------------------------------------------------------------
 * CollapsibleTrigger
 * -----------------------------------------------------------------------------------------------*/

const TRIGGER_NAME = 'CollapsibleTrigger'

type CollapsibleTriggerElement = ElementRef<typeof Primitive.button>
type PrimitiveButtonProps = ComponentPropsWithoutRef<typeof Primitive.button>
interface CollapsibleTriggerProps extends PrimitiveButtonProps {}

const CollapsibleTrigger = forwardRef<
	CollapsibleTriggerElement,
	CollapsibleTriggerProps
>((props: ScopedProps<CollapsibleTriggerProps>, forwardedRef) => {
	const { __scopeCollapsible, ...triggerProps } = props
	const context = useCollapsibleContext(TRIGGER_NAME, __scopeCollapsible)
	return (
		<Primitive.button
			type='button'
			aria-controls={context.contentId}
			aria-expanded={context.open || false}
			data-state={getState(context.open)}
			data-disabled={context.disabled ? '' : undefined}
			disabled={context.disabled}
			{...triggerProps}
			ref={forwardedRef}
			onClick={composeEventHandlers(props.onClick, context.onOpenToggle)}
		/>
	)
})

CollapsibleTrigger.displayName = TRIGGER_NAME

/* -------------------------------------------------------------------------------------------------
 * CollapsibleContent
 * -----------------------------------------------------------------------------------------------*/

const CONTENT_NAME = 'CollapsibleContent'

type CollapsibleContentElement = CollapsibleContentImplElement
interface CollapsibleContentProps
	extends Omit<CollapsibleContentImplProps, 'present'> {
	/**
	 * Used to force mounting when more control is needed. Useful when
	 * controlling animation with React animation libraries.
	 */
	forceMount?: true
}

const CollapsibleContent = forwardRef<
	CollapsibleContentElement,
	CollapsibleContentProps
>((props: ScopedProps<CollapsibleContentProps>, forwardedRef) => {
	const { forceMount, __scopeCollapsible, ...contentProps } = props
	const context = useCollapsibleContext(CONTENT_NAME, __scopeCollapsible)
	return (
		<Presence present={forceMount || context.open}>
			{({ present }) => (
				<CollapsibleContentImpl
					{...contentProps}
					ref={forwardedRef}
					present={present}
				/>
			)}
		</Presence>
	)
})

CollapsibleContent.displayName = CONTENT_NAME

/* -----------------------------------------------------------------------------------------------*/

type CollapsibleContentImplElement = ElementRef<typeof Primitive.div>
interface CollapsibleContentImplProps extends PrimitiveDivProps {
	present: boolean
}

const CollapsibleContentImpl = forwardRef<
	CollapsibleContentImplElement,
	CollapsibleContentImplProps
>((props: ScopedProps<CollapsibleContentImplProps>, forwardedRef) => {
	const { __scopeCollapsible, present, children, ...contentProps } = props
	const context = useCollapsibleContext(CONTENT_NAME, __scopeCollapsible)
	const [isPresent, setIsPresent] = useState(present)
	const ref = useRef<CollapsibleContentImplElement>(null)
	const composedRefs = useComposedRefs(forwardedRef, ref)
	const heightRef = useRef<number | undefined>(0)
	const height = heightRef.current
	const widthRef = useRef<number | undefined>(0)
	const width = widthRef.current
	// when opening we want it to immediately open to retrieve dimensions
	// when closing we delay `present` to retrieve dimensions before closing
	const isOpen = context.open || isPresent
	const isMountAnimationPreventedRef = useRef(isOpen)
	const originalStylesRef = useRef<Record<string, string>>()

	useEffect(() => {
		const rAF = requestAnimationFrame(
			() => (isMountAnimationPreventedRef.current = false)
		)
		return () => cancelAnimationFrame(rAF)
	}, [])

	useLayoutEffect(() => {
		const node = ref.current
		if (node) {
			originalStylesRef.current = originalStylesRef.current || {
				transitionDuration: node.style.transitionDuration,
				animationName: node.style.animationName,
			}
			// block any animations/transitions so the element renders at its full dimensions
			node.style.transitionDuration = '0s'
			node.style.animationName = 'none'

			// get width and height from full dimensions
			const rect = node.getBoundingClientRect()
			heightRef.current = rect.height
			widthRef.current = rect.width

			// kick off any animations/transitions that were originally set up if it isn't the initial mount
			if (!isMountAnimationPreventedRef.current) {
				node.style.transitionDuration =
					originalStylesRef.current.transitionDuration
				node.style.animationName = originalStylesRef.current.animationName
			}

			setIsPresent(present)
		}
		/**
		 * depends on `context.open` because it will change to `false`
		 * when a close is triggered but `present` will be `false` on
		 * animation end (so when close finishes). This allows us to
		 * retrieve the dimensions *before* closing.
		 */
	}, [context.open, present])

	return (
		<Primitive.div
			data-state={getState(context.open)}
			data-disabled={context.disabled ? '' : undefined}
			id={context.contentId}
			hidden={!isOpen}
			{...contentProps}
			ref={composedRefs}
			style={{
				[`--collapsible-content-height` as any]: height
					? `${height}px`
					: undefined,
				[`--collapsible-content-width` as any]: width
					? `${width}px`
					: undefined,
				...props.style,
			}}
		>
			{isOpen && children}
		</Primitive.div>
	)
})

/* -----------------------------------------------------------------------------------------------*/

function getState(open?: boolean) {
	return open ? 'open' : 'closed'
}

const Root = Collapsible
const Trigger = CollapsibleTrigger
const Content = CollapsibleContent

export {
	//
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
	Content,
	//
	Root,
	Trigger,
	createCollapsibleScope,
}
export type {
	CollapsibleContentProps,
	CollapsibleProps,
	CollapsibleTriggerProps,
}
