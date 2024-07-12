import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { useLayoutEffect } from '../../hooks/use-layout-effect'
import { useComposedRefs } from '../../lib/helpers/compose-ref'

type Machine<S> = { [k: string]: { [k: string]: S } }
type MachineState<T> = keyof T
type MachineEvent<T> = keyof UnionToIntersection<T[keyof T]>

// 🤯 https://fettblog.eu/typescript-union-to-intersection/
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (
	x: infer R
) => any
	? R
	: never

export function useStateMachine<M>(
	initialState: MachineState<M>,
	machine: M & Machine<MachineState<M>>
) {
	return React.useReducer(
		(state: MachineState<M>, event: MachineEvent<M>): MachineState<M> => {
			const nextState = (machine[state] as any)[event]
			return nextState ?? state
		},
		initialState
	)
}

interface PresenceProps {
	children:
		| React.ReactElement
		| ((props: { present: boolean }) => React.ReactElement)
	present: boolean
}

const Presence: React.FC<PresenceProps> = props => {
	const { present, children } = props
	const presence = usePresence(present)

	const child = (
		typeof children === 'function'
			? children({ present: presence.isPresent })
			: React.Children.only(children)
	) as React.ReactElement

	const ref = useComposedRefs(presence.ref, getElementRef(child))
	const forceMount = typeof children === 'function'
	return forceMount || presence.isPresent
		? React.cloneElement(child, { ref })
		: null
}

Presence.displayName = 'Presence'

/* -------------------------------------------------------------------------------------------------
 * usePresence
 * -----------------------------------------------------------------------------------------------*/

/**
 * Хук делающий задержку до окончания анимации на unmount
 * Принимает состояние элемента Boolean(mounted | unmounted)
 * Возвращает задержанное состояние, и ref, который нужно повесить на прослушиваемый элемент
 * Похож на useUnmountTransition
 */
function usePresence(present: boolean) {
	const [node, setNode] = React.useState<HTMLElement>()
	const stylesRef = React.useRef<CSSStyleDeclaration>({} as any)
	const prevPresentRef = React.useRef(present)
	const prevAnimationNameRef = React.useRef<string>('none')
	const initialState = present ? 'mounted' : 'unmounted'
	const [state, send] = useStateMachine(initialState, {
		// one of the types of component states
		mounted: {
			// valid events for this state
			UNMOUNT: 'unmounted', // next state for this event
			ANIMATION_OUT: 'unmountSuspended', // next state for this event
		},

		// one of the types of component states
		unmountSuspended: {
			// valid events for this state
			MOUNT: 'mounted', // next state for this event
			ANIMATION_END: 'unmounted', // next state for this event
		},

		// one of the types of component states
		unmounted: {
			// valid events for this state
			MOUNT: 'mounted', // next state for this event
		},
	})

	React.useEffect(() => {
		const currentAnimationName = getAnimationName(stylesRef.current)
		prevAnimationNameRef.current =
			state === 'mounted' ? currentAnimationName : 'none'
	}, [state])

	useLayoutEffect(() => {
		const styles = stylesRef.current
		const wasPresent = prevPresentRef.current
		const hasPresentChanged = wasPresent !== present

		if (hasPresentChanged) {
			const prevAnimationName = prevAnimationNameRef.current
			const currentAnimationName = getAnimationName(styles)

			if (present) {
				send('MOUNT')
			} else if (
				currentAnimationName === 'none' ||
				styles?.display === 'none'
			) {
				// If there is no exit animation or the element is hidden, animations won't run
				// so we unmount instantly
				send('UNMOUNT')
			} else {
				/**
				 * When `present` changes to `false`, we check changes to animation-name to
				 * determine whether an animation has started. We chose this approach (reading
				 * computed styles) because there is no `animationrun` event and `animationstart`
				 * fires after `animation-delay` has expired which would be too late.
				 */
				const isAnimating = prevAnimationName !== currentAnimationName

				send(wasPresent && isAnimating ? 'ANIMATION_OUT' : 'UNMOUNT')
			}

			prevPresentRef.current = present
		}
	}, [present, send])

	useLayoutEffect(() => {
		if (node) {
			/**
			 * Triggering an ANIMATION_OUT during an ANIMATION_IN will fire an `animationcancel`
			 * event for ANIMATION_IN after we have entered `unmountSuspended` state. So, we
			 * make sure we only trigger ANIMATION_END for the currently active animation.
			 */
			const handleAnimationEnd = (event: AnimationEvent) => {
				const currentAnimationName = getAnimationName(stylesRef.current)
				const isCurrentAnimation = currentAnimationName.includes(
					event.animationName
				)
				if (event.target === node && isCurrentAnimation) {
					// With React 18 concurrency this update is applied
					// a frame after the animation ends, creating a flash of visible content.
					// By manually flushing we ensure they sync within a frame, removing the flash.
					ReactDOM.flushSync(() => send('ANIMATION_END'))
				}
			}
			const handleAnimationStart = (event: AnimationEvent) => {
				if (event.target === node) {
					// if animation occurred, store its name as the previous animation.
					prevAnimationNameRef.current = getAnimationName(
						stylesRef.current
					)
				}
			}
			node.addEventListener('animationstart', handleAnimationStart)
			node.addEventListener('animationcancel', handleAnimationEnd)
			node.addEventListener('animationend', handleAnimationEnd)
			return () => {
				node.removeEventListener('animationstart', handleAnimationStart)
				node.removeEventListener('animationcancel', handleAnimationEnd)
				node.removeEventListener('animationend', handleAnimationEnd)
			}
		} else {
			// Transition to the unmounted state if the node is removed prematurely.
			// We avoid doing so during cleanup as the node may change but still exist.
			send('ANIMATION_END')
		}
	}, [node, send])

	return {
		isPresent: ['mounted', 'unmountSuspended'].includes(state),
		ref: React.useCallback((node: HTMLElement) => {
			if (node) stylesRef.current = getComputedStyle(node)
			setNode(node)
		}, []),
	}
}

/* -----------------------------------------------------------------------------------------------*/

function getAnimationName(styles?: CSSStyleDeclaration) {
	return styles?.animationName || 'none'
}

// Before React 19 accessing `element.props.ref` will throw a warning and suggest using `element.ref`
// After React 19 accessing `element.ref` does the opposite.
// https://github.com/facebook/react/pull/28348
//
// Access the ref using the method that doesn't yield a warning.
function getElementRef(element: React.ReactElement) {
	// React <=18 in DEV
	let getter = Object.getOwnPropertyDescriptor(element.props, 'ref')?.get
	let mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning
	if (mayWarn) {
		return (element as any).ref
	}

	// React 19 in DEV
	getter = Object.getOwnPropertyDescriptor(element, 'ref')?.get
	mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning
	if (mayWarn) {
		return element.props.ref
	}

	// Not DEV
	return element.props.ref || (element as any).ref
}

export { Presence }
export type { PresenceProps }
