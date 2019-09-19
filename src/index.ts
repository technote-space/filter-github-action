import { Context } from '@actions/github/lib/context';

const isTargetEventName = (events: object, context: Context): boolean => context.eventName in events;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isTargetEventAction = (action: string | any[] | Function, context: Context): boolean => {
	if (Array.isArray(action)) {
		return action.some(item => isTargetEventAction(item, context));
	}
	if (typeof action === 'function') {
		return action(context);
	}
	return '*' === action || context.payload.action === action;
};

/**
 * @param {object} targets targets
 * @param {Context} context context
 * @return {boolean} is target event?
 */
export const isTargetEvent = (targets: object, context: Context): boolean => isTargetEventName(targets, context) && isTargetEventAction(targets[context.eventName], context);
